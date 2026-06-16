import { TenantContext } from '../../../src/tenant/TenantContext';
import { unfocusVmApp } from '../../../src/core/vm';
import { attachScreenshot } from '../../../src/core/reporting/allure';
import {
   RUN_TAG,
   test, chatOf,
   type UserContext, type Action, type Case, type SharedState,
} from './base';
import { waitForVisible } from '../../../src/core/utils/actions';
import {
   allureMetadata, captureSeedRoot, recordErrors, registerCases,
   resetNotifBaseline, retryStep, stepNotifDelta,
   setRetryFailureContext,
} from './runtime';
import type { ChatService } from '../../../src/services/chat/ChatService';
import type { Page } from '@playwright/test';

// Decide who seeds the root message:
//  - file/image/video: VM (CDP-only) cannot stub the Electron file dialog.
//  - seedFromHost flag: edit/delete/etc. where the actor must own the message.
const useHostSeeder = (action: Action): boolean =>
   action.seedFromHost === true ||
   action.rootType === 'file' ||
   action.rootType === 'image' ||
   action.rootType === 'video';

export const THREAD_ROOT_TEXT = `ROOT THREAD ${RUN_TAG}`;
const root = THREAD_ROOT_TEXT;

const hostSyncedByPage = new WeakMap<Page, Set<string>>();
function hostSyncedFor(page: Page): Set<string> {
   let set = hostSyncedByPage.get(page);
   if (!set) { set = new Set(); hostSyncedByPage.set(page, set); }
   return set;
}

type ThreadScenario = { context: string; name: string; parent?: string };
export const scenarios: ThreadScenario[] = [
   { context: 'Group',   name: 'Automation Test Group' },  //  Group Nói Linh Tinh
   { context: 'Community', name: 'Group A', parent: 'Automation Test Community' },
];
export type Scenario = ThreadScenario;

async function ensureRootThread(svc: ChatService) {
   const bubble = svc.chatPage.messages.getTextMessage(root);
   const exists = (await bubble.count()) > 0;

   if (exists) {
      try {
         await svc.actions.do('openThread', { type: 'text', value: root });
         return;
      } catch { }
   } else {
      await svc.send.sendText(root);
      await waitForVisible(bubble, 10_000);
   }
   await svc.actions.do('createThread', { type: 'text', value: root });
   await anchorThread(svc);
}

async function anchorThread(svc: ChatService) {
   const thread = svc.chatPage.thread;
   await thread.composers.inputMessage('----------');
   await thread.composers.clickSend();
   await waitForVisible(thread.messages.getTextMessage('----------'), 10_000);
}

async function reopenThread(svc: ChatService, sc: Scenario, role: 'host' | 'vm') {
   if (role === 'host') {
      const synced = hostSyncedFor(svc.page);
      if (!synced.has(sc.context)) {
         await svc.page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => { /* fall through */ });
         synced.add(sc.context);
      }
   }
   await svc.chatPage.thread.close();
   await svc.openConversation(sc.name, sc.parent);
   await waitForVisible(svc.chatPage.messages.getTextMessage(root), 10_000);
   await svc.actions.do('openThread', { type: 'text', value: root });
}

export function runCases(action: Action, caseGroups: Case[][]): void {
   let cases: Case[] = caseGroups.flat();
   if (action.scope === 'once') cases = cases.filter(c => c.once);

   for (const sc of scenarios) {
      test.describe.serial(action.description(sc.context), () => {
         const scenarioShared: SharedState = {};

         if (!action.seedPerCase) {
            test.beforeAll(async ({ user1, user2, tenantContext }) => {
               const seeder = chatOf(useHostSeeder(action) ? user1 : user2, tenantContext);
               await seeder.openConversation(sc.name, sc.parent);
               await ensureRootThread(seeder);
               await captureSeedRoot(action, scenarioShared, seeder, undefined, sc.context);
            });
         }

         test.afterEach(async ({ user2 }, testInfo) => {
            recordErrors(testInfo, action);
            try {
               await chatOf(user2).chatPage.composers.focusMessage();
            } catch { }
         });

         registerCases(cases, tc => runSteps(action, sc, tc, action.seedPerCase ? {} : scenarioShared));
      });
   }
}

function runSteps(action: Action, sc: Scenario, tc: Case, shared: SharedState) {
   return async ({ user1, user2, tenantContext }: {
      user1: UserContext; user2: UserContext; tenantContext: TenantContext;
   }) => {
      const sender   = chatOf(user1, tenantContext);
      const receiver = chatOf(user2, tenantContext);
      const N        = tc.rounds ?? 1;
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
         context: sc.context, conversation: sc.name, rounds: N,
      });

      // STEP 1: VM re-opens conv + thread panel; unfocus app for notif counting.
      await retryStep('STEP 1: VM opens conversation + opens thread panel', async () => {
         await reopenThread(receiver, sc, 'vm');
         unfocusVmApp();
      });

      // Baseline: drain VM notifications so STEP 5 only sees thread replies.
      let notifBaseline = 0;
      await retryStep('STEP 1.5: Reset VM notification baseline', async () => {
         notifBaseline = await resetNotifBaseline();
      });

      // STEP 2: Host re-opens conv + thread panel (3s sync wait on first call).
      await retryStep('STEP 2: Host opens conversation + opens thread panel', async () => {
         await reopenThread(sender, sc, 'host');
      });

      // STEP 2.1 (seedPerCase only): seed a fresh thread root per case so
      // edit/delete operates on a unique message each run.
      if (action.seedPerCase && action.seedRoot) {
         await retryStep('STEP 2.1: Seed fresh thread root for this case', async () => {
            await ensureRootThread(sender);
            await captureSeedRoot(action, shared, sender, undefined, undefined);
         });
      }

      // STEP 3: Host sends N thread message(s). NOTE: send is non-idempotent—
      // a retry may produce duplicate messages and skew downstream counts.
      // Accepted per user request to retry every step up to 3x.
      await retryStep(`STEP 3: Host sends ${N} thread message(s)`, async () => {
         if (action.prelude) await action.prelude(sender, shared);
         await tc.run(sender, shared);
      });

      // STEP 4: Host verifies last message + screenshot.
      await retryStep('STEP 4: Host verifies "Last Message" in thread + screenshot', async () => {
         if (action.verifyOverride) await action.verifyOverride(sender, tc, shared);
         else                       await sender.view.verifyLastMessage(tc.expected, tc.type, quoteOf());
         await attachScreenshot(user1.page, '1-host-thread-last-message');
      });

      // STEP 5: VM Notification Center delta = +N (skipped for copy/delete/edit).
      if (!action.skipPushNotif) {
         await stepNotifDelta(N, notifBaseline, `STEP 5: VM Notification Center delta = +${N}`);
      }

      // STEP 6: VM verifies last reply + screenshot.
      await retryStep('STEP 6: VM verifies last reply + screenshot', async () => {
         if (action.verifyOverride) await action.verifyOverride(receiver, tc, shared);
         else                       await receiver.view.verifyLastMessage(tc.expected, tc.type, quoteOf());
         await attachScreenshot(user2.page, '2-vm-thread-last-message');
      });
   };
}
