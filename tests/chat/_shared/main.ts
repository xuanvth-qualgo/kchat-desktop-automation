import { allure } from 'allure-playwright';
import { TenantContext } from '../../../src/tenant/TenantContext';
import { unfocusVmApp, showVmApp } from '../../../src/core/vm';
import { attachScreenshot } from '../../../src/core/reporting/allure';
import { log } from '../../../src/core/log';
import type { ChatService } from '../../../src/services/chat/ChatService';
import {
   SENDER, RECEIVER,
   test, chatOf, notifOf,
   type UserContext, type Action, type Case, type SharedState,
} from './base';
import {
   allureMetadata, captureSeedRoot, recordErrors, registerCases,
   resetNotifBaseline, retryStep, stepNotifDelta,
   setRetryFailureContext, clearRetryFailureContext,
} from './runtime';

// Decide who seeds the root message:
//  - file/image/video: VM (CDP-only) cannot stub the Electron file dialog.
//  - seedFromHost flag: edit/delete/etc. where the actor must own the message.
const useHostSeeder = (action: Action): boolean =>
   action.seedFromHost === true ||
   action.rootType === 'file' ||
   action.rootType === 'image' ||
   action.rootType === 'video';

type ConversationRef = { name: string; parent?: string };
type MainScenario = {
   context: string;
   hostConv:   ConversationRef;
   vmIdleConv:  ConversationRef; // state before notif drain
   vmConv:     ConversationRef;
};
export const scenarios: MainScenario[] = [
   {  
      context: 'Direct', 
      hostConv:  { name: RECEIVER }, 
      vmIdleConv: { name: 'KChat™ ✨' }, 
      vmConv:     { name: SENDER } 
   },
   {  
      context: 'Group', 
      hostConv:  { name: 'Automation Test Group' }, // Group Nói Linh Tinh
      vmIdleConv: { name: 'KChat™ ✨' }, 
      vmConv:    { name: 'Automation Test Group' }, 
   },
   {
      context: 'Community',
      hostConv:   { name: 'Group A', parent: 'Automation Test Community' },
      vmIdleConv: { name: 'General', parent: 'Automation Test Community' },
      vmConv:     { name: 'Group A', parent: 'Automation Test Community' },
   },
];
export type Scenario = MainScenario;

const currentConv = new WeakMap<object, string>();
const convKey = (ref: ConversationRef) => `${ref.parent ?? ''}::${ref.name}`;

async function openConv(svc: ChatService, ref: ConversationRef): Promise<void> {
   const key = convKey(ref);
   if (currentConv.get(svc.page) === key) return;
   await svc.openConversation(ref.name, ref.parent);
   currentConv.set(svc.page, key);
}

export function runCases(action: Action, caseGroups: Case[][]): void {
   let cases: Case[] = caseGroups.flat();
   if (action.scope === 'once') cases = cases.filter(c => c.once);

   const useSerial = !!action.seedRoot;
   const describe  = useSerial ? test.describe.serial : test.describe;

   for (const sc of scenarios) {
      // Mention is not a valid scenario in Direct chat — skip the whole describe
      if (sc.context === 'Direct' && action.rootType === 'mention') continue;
      const scopedCases = sc.context === 'Direct'
         ? cases.filter(c => c.type !== 'mention')
         : cases;
      if (scopedCases.length === 0) continue;

      describe(action.description(sc.context), () => {
         const scenarioShared: SharedState = {};

         if (action.seedRoot && !action.seedPerCase) {
            test.beforeAll(async ({ user1, user2, tenantContext }) => {
               const hostSvc = chatOf(user1, tenantContext);
               const vmSvc   = chatOf(user2, tenantContext);
               await openConv(hostSvc, sc.hostConv);
               await openConv(vmSvc,   sc.vmConv);
               // Default: VM seeds, host mirrors. Swap when host must be seeder
               // (file/image/video dialog stub, or action requires actor==owner).
               const hostSeeds = useHostSeeder(action);
               const seeder = hostSeeds ? hostSvc : vmSvc;
               const mirror = hostSeeds ? vmSvc   : hostSvc;
               await captureSeedRoot(action, scenarioShared, seeder, mirror, sc.context);
            });
         }

         test.afterEach(async ({ user2 }, testInfo) => {
            recordErrors(testInfo, action);
            try {
               const receiver = chatOf(user2);
               await openConv(receiver, sc.vmConv);
               await receiver.chatPage.composers.focusMessage();
            } catch { }
         });

         registerCases(scopedCases, tc =>
            runSteps(action, sc, tc, (useSerial && !action.seedPerCase) ? scenarioShared : undefined),
         );
      });
   }
}

function runSteps(action: Action, sc: Scenario, tc: Case, scenarioShared?: SharedState) {
   return async ({ user1, user2, tenantContext }: {
      user1: UserContext; user2: UserContext; tenantContext: TenantContext;
   }) => {
      const sender   = chatOf(user1, tenantContext);
      const receiver = chatOf(user2, tenantContext);
      const notif    = notifOf(user2);
      const N        = tc.rounds ?? 1;
      const shared: SharedState = scenarioShared ?? {};
      const quoteOf = (): string | undefined =>
         action.verifyQuote ? shared.rootQuoteText : undefined;

      // Đăng ký page Host + VM để retryStep tự chụp khi step hết retry vẫn fail.
      setRetryFailureContext([
         { name: 'host', page: user1.page },
         { name: 'vm',   page: user2.page },
      ]);

      await allureMetadata({
         action, storyLabel: action.description(sc.context),
         tenantKind: tenantContext.kind.toUpperCase(),
         context: sc.context, conversation: sc.vmConv.name, rounds: N,
         roundsLabel: 'Action sent',
      });

      // STEP 1: Host opens App + focuses scenario conversation.
      await retryStep('STEP 1: Host opens App + focuses scenario conversation', async () => {
         await openConv(sender, sc.hostConv);
      });

      // STEP 1.1 (seedPerCase only): seed a fresh root before baselines so the
      // seed message is already counted, and downstream unread deltas reflect
      // only the action under test.
      if (action.seedPerCase && action.seedRoot) {
         await retryStep('STEP 1.1: Seed fresh root for this case', async () => {
            await captureSeedRoot(action, shared, sender, undefined, undefined);
         });
      }

      // Baselines BEFORE sending.
      // `readAppBarBreakdown()` actually returns all unread aria-labels in the
      // DOM ("Conversation with <name>, N unread messages" rows). Chat tab and
      // Community icon badges don't expose unread via aria-label, so we
      // identify the scenario's conv by matching `vmConv.name` in the label.
      const convNeedle = sc.vmConv.name.toLowerCase();
      const convLabelMatcher = (label: string): boolean =>
         label.toLowerCase().includes(convNeedle);
      const baselineSidebar   = await notif.getUnreadCount(sc.vmConv.name).catch(() => 0);
      const baselineBreakdown = await notif.pushPage.readAppBarBreakdown().catch(() => []);
      const baselineAppBar    = baselineBreakdown.reduce((s, i) => s + i.count, 0);
      const baselineConvUnread = baselineBreakdown.find(i => convLabelMatcher(i.label))?.count ?? 0;
      let notifBaseline = 0;
      await retryStep('STEP 1.5: Reset VM notification baseline', async () => {
         notifBaseline = await resetNotifBaseline();
      });

      // STEP 2: VM opens App + KChat™ ✨ conversation + unfocus.
      await retryStep('STEP 2: VM opens App + idle conversation + unfocus', async () => {
         await openConv(receiver, sc.vmIdleConv);
         unfocusVmApp();
      });

      // STEP 3: Host actions N round(s). NOTE: send is non-idempotent—
      // a retry here may produce duplicate messages and skew downstream
      // count-based assertions (notif/app-bar/sidebar). Accepted per user
      // request to retry every step up to 3x.
      await retryStep(`STEP 3: Host actions ${N} round(s)`, async () => {
         if (action.prelude) await action.prelude(sender, shared);
         await tc.run(sender, shared);
      });

      // STEP 4: Host verifies last message + screenshot.
      await retryStep('STEP 4: Host verifies "Last Message" + screenshot', async () => {
         if (action.verifyOverride) await action.verifyOverride(sender, tc, shared);
         else                       await sender.view.verifyLastMessage(tc.expected, tc.type, quoteOf());
         await attachScreenshot(user1.page, '1-host-last-message');
      });

      // STEP 5: VM Notification Center delta = +N (skipped for copy/delete/edit).
      if (!action.skipPushNotif) {
         await stepNotifDelta(N, notifBaseline, `STEP 5: VM Notification Center delta = +${N}`);
      }

      // STEP 6: VM scenario-conv unread badge = baseline + N.
      // We match the conversation row aria-label by `vmConv.name`. Unread
      // bleed from unrelated convs/groups is logged but does NOT contribute
      // to the assertion.
      if (!action.skipSidebarUnread) {
         const convName = sc.vmConv.name;
         await retryStep(`STEP 6: VM "${convName}" unread = baseline + ${N}`, async () => {
            const breakdown = await notif.pushPage.readAppBarBreakdown();
            const convHit   = breakdown.find(i => convLabelMatcher(i.label));
            const convNow   = convHit ? convHit.count : 0;
            const totalNow  = breakdown.reduce((s, i) => s + i.count, 0);
            const fmtItems  = (items: Array<{ label: string; count: number }>) =>
               items.length
                  ? items.map(i => `${JSON.stringify(i.label)}=${i.count}`).join(', ')
                  : '(no badges)';
            await allure.parameter(`Unread "${convName}"`,
               `${baselineConvUnread} → ${convNow} (expected ${baselineConvUnread + N})`);
            await allure.parameter('Unread total + breakdown',
               `${baselineAppBar} → ${totalNow}; now=${fmtItems(breakdown)}; baseline=${fmtItems(baselineBreakdown)}`);
            log.info(`[unread] conv="${convName}" baseline=${baselineConvUnread}, now=${convNow}, expecting=${baselineConvUnread + N}`);
            log.info(`[unread] total baseline=${baselineAppBar}, now=${totalNow}`);
            log.info(`[unread] baseline breakdown: ${fmtItems(baselineBreakdown)}`);
            log.info(`[unread] now breakdown:      ${fmtItems(breakdown)}`);
            await notif.expectAppBarTabUnread(convLabelMatcher, baselineConvUnread + N, 20_000);
         });
      }

      // STEP 7: VM focuses App (without entering conversation).
      await retryStep('STEP 7: VM focuses App (without entering conversation)', async () => {
         showVmApp();
      });

      // STEP 8: VM sidebar unread = baseline + N + screenshot (skipped for react/copy/delete/edit).
      if (!action.skipSidebarUnread) {
         await retryStep(`STEP 8: VM sidebar unread = baseline + ${N} + screenshot`, async () => {
            const sidebarNow = await notif.getUnreadCount(sc.vmConv.name).catch(() => 0);
            await allure.parameter('Sidebar unread',
               `${baselineSidebar} → ${sidebarNow} (expected ${baselineSidebar + N})`);
            log.info(`[sidebar] baseline=${baselineSidebar}, now=${sidebarNow}, expecting=${baselineSidebar + N}`);
            await notif.expectUnreadCount(sc.vmConv.name, baselineSidebar + N, 20_000);
            await attachScreenshot(user2.page, '2-vm-unread-count');
         });
      }

      // STEP 9: VM enters conversation + verifies last message + screenshot.
      await retryStep('STEP 9: VM enters conversation + verifies "Last Message" + screenshot', async () => {
         await openConv(receiver, sc.vmConv);
         if (action.verifyOverride) await action.verifyOverride(receiver, tc, shared);
         else                       await receiver.view.verifyLastMessage(tc.expected, tc.type, quoteOf());
         await attachScreenshot(user2.page, '3-vm-last-message');
      });

      // STEP 10: VM focuses message input.
      await retryStep('STEP 10: VM focuses message input', async () => {
         await receiver.chatPage.composers.focusMessage();
      });

      // STEPS 11 & 12: Host/VM quit App — handled by worker-scope teardown.
   };
}
