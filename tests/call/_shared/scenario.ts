import { allure } from 'allure-playwright';
import { log } from '../../../src/core/log';
import { showVmApp, unfocusVmApp } from '../../../src/core/vm';
import {
   test, chatOf, hostCallOf,
   type UserContext, type CallScenario,
} from './base';
import { TenantContext } from '../../../src/tenant/TenantContext';
import {
   allureCallMetadata, retryStep, setRetryFailureContext, snap, startHostCall,
   wait, waitForVmIncomingCall,
} from './runtime';
import type { CallPage } from '../../../src/pages/call/CallPage';

/* Per-scenario in-call behavior. The runner handles open/start/accept/end
 * boilerplate; the variant only declares what happens *between* "ringing"
 * and "hang up". */
export type Variant =
   /* 1: ring 29s → caller hits Cancel.                                     */
   | { kind: 'caller-cancel-29s' }

   /* 2: ring 29s → callee hits Decline.                                    */
   | { kind: 'callee-decline-29s' }

   /* 3 & 4: callee Accept, then optional mic/cam toggles, wait N s,
    *        then either caller or callee ends.                             */
   | {
      kind:        'accept-toggle-end';
      callerMic?:  'off' | 'on';
      callerCam?:  'off' | 'on';
      calleeMic?:  'off' | 'on';
      calleeCam?:  'off' | 'on';
      durationMs:  number;
      endedBy:     'caller' | 'callee';
   }

   /* 5: callee Accept, callee opens Settings (manual setting change is a
    *    UI-specific TODO — runner just opens the panel), wait N s, end.   */
   | {
      kind:        'accept-settings-end';
      durationMs:  number;
      endedBy:     'caller' | 'callee';
      settingNote: string; // freeform label, surfaced in Allure
   };

export type CallTestOpts = {
   scenario:  CallScenario;
   kind:      'voice' | 'video';
   variant:   Variant;
};

export function runCallTest(opts: CallTestOpts): void {
   const { scenario: sc, kind, variant } = opts;

   test(`${sc.id} - ${sc.name}`, async ({ user1, user2, tenantContext, vmApp }) => {
      await allureCallMetadata(sc, kind);
      await allure.parameter('Variant', variant.kind);

      const senderChat = chatOf(user1, tenantContext);
      const hostCall   = hostCallOf(user1, tenantContext);

      // Đăng ký page Host + VM để retryStep tự chụp khi step hết retry vẫn fail.
      setRetryFailureContext([
         { name: 'host', page: user1.page },
         { name: 'vm',   page: user2.page },
      ]);

      // STEP 1: Host opens scenario conversation.
      await retryStep(`STEP 1: Host opens "${sc.hostConv.name}"`, async () => {
         await senderChat.openConversation(sc.hostConv.name, sc.hostConv.parent);
      });

      // STEP 2: VM brings app to foreground so the incoming-call window is
      //         allowed to appear (some OSes suppress windows for unfocused
      //         apps). Tests are intentionally tolerant: helper is best-effort.
      await retryStep('STEP 2: VM focuses app', async () => {
         try { showVmApp(); } catch (e) { log.warn(`[call] showVmApp failed: ${(e as Error).message}`); }
      });

      // STEP 3: Host starts the call (new outgoing window appears).
      let hostWindow: CallPage | null = null;
      await retryStep(`STEP 3: Host starts ${kind} call`, async () => {
         hostWindow = await startHostCall(hostCall, kind);
         await snap(hostWindow.getPage(), '1-host-call-window');
      });
      if (!hostWindow) throw new Error('host call window did not open');

      // STEP 4: VM receives incoming-call window.
      if (!vmApp) throw new Error('vmApp fixture missing — VM-side scenarios require remote app');
      let vmWindow: CallPage | null = null;
      await retryStep('STEP 4: VM receives incoming call', async () => {
         vmWindow = await waitForVmIncomingCall(vmApp, user2.page);
         await snap(vmWindow.getPage(), '2-vm-incoming-call');
      });
      if (!vmWindow) throw new Error('vm incoming call window did not open');

      // ----- branch on variant -----
      if (variant.kind === 'caller-cancel-29s') {
         await retryStep('STEP 5: Ring for 29s', async () => { await wait(29_000); });
         await retryStep('STEP 6: Host cancels the call', async () => {
            await hostWindow!.cancelCall();
         });

      } else if (variant.kind === 'callee-decline-29s') {
         await retryStep('STEP 5: Ring for 29s', async () => { await wait(29_000); });
         await retryStep('STEP 6: VM declines the call', async () => {
            await vmWindow!.declineCall();
         });

      } else if (variant.kind === 'accept-toggle-end') {
         await retryStep('STEP 5: VM accepts the call', async () => {
            await vmWindow!.acceptCall();
         });
         await retryStep('STEP 6: In-call toggles (mic/cam)', async () => {
            if (variant.callerMic === 'off') await hostWindow!.muteMic();
            if (variant.callerMic === 'on')  await hostWindow!.unmuteMic();
            if (variant.callerCam === 'on')  await hostWindow!.turnOnCamera();
            if (variant.callerCam === 'off') await hostWindow!.turnOffCamera();
            if (variant.calleeMic === 'off') await vmWindow!.muteMic();
            if (variant.calleeMic === 'on')  await vmWindow!.unmuteMic();
            if (variant.calleeCam === 'on')  await vmWindow!.turnOnCamera();
            if (variant.calleeCam === 'off') await vmWindow!.turnOffCamera();
         });
         await retryStep(`STEP 7: Stay in call for ${variant.durationMs / 1000}s`, async () => {
            await wait(variant.durationMs);
         });
         await retryStep(`STEP 8: ${variant.endedBy === 'caller' ? 'Host' : 'VM'} ends call`, async () => {
            const ender = variant.endedBy === 'caller' ? hostWindow! : vmWindow!;
            await ender.endCall();
         });

      } else if (variant.kind === 'accept-settings-end') {
         await retryStep('STEP 5: VM accepts the call', async () => {
            await vmWindow!.acceptCall();
         });
         await retryStep(`STEP 6: VM opens Call Settings — ${variant.settingNote}`, async () => {
            // TODO(call-settings): once the settings popover locators are
            // confirmed in the running app, implement device selection here.
            // For now we just open/close the panel to exercise the button.
            await vmWindow!.openSettings();
         });
         await retryStep(`STEP 7: Stay in call for ${variant.durationMs / 1000}s`, async () => {
            await wait(variant.durationMs);
         });
         await retryStep(`STEP 8: ${variant.endedBy === 'caller' ? 'Host' : 'VM'} ends call`, async () => {
            const ender = variant.endedBy === 'caller' ? hostWindow! : vmWindow!;
            await ender.endCall();
         });
      }

      // Final screenshots after hang-up.
      await snap(user1.page, '9-host-after-call');
      await snap(user2.page, '9-vm-after-call');

      // VM goes back to background — keeps subsequent tests' notif baselines clean.
      try { unfocusVmApp(); } catch { /* best-effort */ }
   });
}

/** Convenience: hides the `tenantContext` typing nag at the call site. */
export type _TC = TenantContext;
export type _UC = UserContext;
