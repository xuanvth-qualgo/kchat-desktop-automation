import { expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import {
   clearVmNotifications,
   getVmNotificationCenterCount,
   getVmNotificationRows,
} from '../../../src/core/vm';
import { recordTestErrors } from '../../../src/core/reporting/error-log';
import type { TestInfo } from '@playwright/test';
import {
   EPIC, SENDER, RECEIVER,
   test,
   type Action, type Case, type SharedState,
} from './base';
import type { Page } from '@playwright/test';
import { waitForVisible } from '../../../src/core/utils/actions';
import { ensureInView } from '../../../src/core/utils/ui';
import { log } from '../../../src/core/log';
import { attachScreenshot } from '../../../src/core/reporting/allure';
import type { ChatService } from '../../../src/services/chat/ChatService';
import { handlerFor } from '../../../src/services/chat/ChatTypeHandlers';
import type { MessageType } from '../../../src/services/chat/types';

const seedRootCache = new Map<string, { rootId: string; rootQuoteText?: string }>();
const seedRootKey = (feature: string, context: string) => `${feature}::${context}`;

// ---------------------------------------------------------------------------
// Ngữ cảnh fail của retryStep — runner (main.ts / thread.ts) đăng ký
// danh sách Page trước khi chạy các STEP. Khi step hết retry vẫn fail,
// retryStep sẽ chụp screenshot tất cả Page + đính lý do fail vào Allure
// trước khi ném lỗi ra ngoài. Mục đích: report luôn có đủ ảnh 2 phía.
// ---------------------------------------------------------------------------
type FailCapturePage = { name: string; page: Page };
let failCapturePages: FailCapturePage[] = [];

export function setRetryFailureContext(pages: FailCapturePage[]): void {
   failCapturePages = pages.filter((p) => !!p.page);
}

export function clearRetryFailureContext(): void {
   failCapturePages = [];
}

async function captureFailureArtifacts(label: string, err: Error): Promise<void> {
   try {
      await allure.attachment(
         `FAIL reason — ${label}`,
         `${err.message}\n\n${err.stack ?? ''}`,
         'text/plain',
      );
   } catch { /* best-effort */ }
   for (const { name, page } of failCapturePages) {
      try { await attachScreenshot(page, `FAIL-${name}-${label}`); }
      catch (e) { log.warn(`[step-retry] screenshot ${name} failed: ${(e as Error).message}`); }
   }
}

/**
 * Bọc 1 bước test với chính sách retry chuẩn của framework.
 *
 * Spec (theo yêu cầu lead):
 *  - Tối đa 3 lần thử (1 lần chính + 2 lần retry).
 *  - Tổng thời gian không quá 30 giây — fail sớm thay vì kéo dài.
 *  - Mỗi attempt bọc trong `allure.step` nên hiển thị rõ trên Allure report.
 *  - Nếu hết retry vẫn fail thì ném lỗi gốc ra ngoài (Playwright sẽ
 *    đánh dấu test fail + tự chụp screenshot do `screenshot: only-on-failure`).
 *
 * @param label          Tên bước hiển thị trên log / Allure (vd: "STEP 3: Host sends message")
 * @param fn             Hàm async chứa action cần retry
 * @param attempts       Số lần thử tối đa (mặc định 3)
 * @param totalTimeoutMs Ngưỡng tổng thời gian retry (mặc định 30_000ms)
 */
export async function retryStep(
   label: string,
   fn: () => Promise<void>,
   attempts: number = 3,
   totalTimeoutMs: number = 30_000,
): Promise<void> {
   let lastErr: unknown;
   const deadline = Date.now() + totalTimeoutMs;
   for (let i = 1; i <= attempts; i++) {
      if (Date.now() >= deadline) {
         log.warn(`[step-retry] "${label}" total timeout ${totalTimeoutMs}ms exceeded before attempt ${i}`);
         break;
      }
      const stepLabel = i === 1 ? label : `${label} (retry ${i - 1})`;
      try {
         await allure.step(stepLabel, fn);
         return;
      } catch (e) {
         lastErr = e;
         log.warn(`[step-retry] "${label}" attempt ${i}/${attempts} failed: ${(e as Error).message}`);
         if (Date.now() >= deadline) {
            log.warn(`[step-retry] "${label}" total timeout ${totalTimeoutMs}ms exceeded after attempt ${i}`);
            break;
         }
      }
   }
   // Hết retry vẫn fail: chụp screenshot mọi Page đã đăng ký + đính lý do
   // fail vào Allure trước khi ném lỗi ra ngoài.
   await captureFailureArtifacts(label, lastErr as Error);
   throw lastErr;
}

export async function resetNotifBaseline(): Promise<number> {
   clearVmNotifications();
   await expect.poll(
      () => getVmNotificationCenterCount(),
      { timeout: 3_000, intervals: [100, 200, 400, 600] },
   ).toBe(0);
   return getVmNotificationCenterCount();
}

export async function stepNotifDelta(N: number, baseline: number, label: string) {
   await retryStep(label, async () => {
      const t0 = Date.now();
      let last = baseline;
      let lastLogged = -1;
      try {
         await expect.poll(
            () => {
               last = getVmNotificationCenterCount();
               if (last !== lastLogged) {
                  log.info(`[notif-poll] +${((Date.now() - t0) / 1000).toFixed(1)}s count=${last} delta=${last - baseline}`);
                  lastLogged = last;
               }
               return last - baseline;
            },
            {
               message:   `expected ${N} kChat push notifications (baseline=${baseline})`,
               timeout:   90_000,
               intervals: [250, 500, 750, 1000, 1500],
            },
         ).toBe(N);
         await allure.parameter('Noti pushes',
            `${baseline} → ${last} (Δ +${last - baseline} / +${N})`);
         log.info(`[notif] baseline=${baseline}, final=${last}, delta=${last - baseline}`);
         dumpNotifRows('done');
      } catch (err) {
         log.warn(`[notif] TIMEOUT baseline=${baseline}, last=${last}, expected delta=+${N}`);
         dumpNotifRows('timeout');
         throw err;
      }
   });
}

function dumpNotifRows(tag: string) {
   try {
      const rows = getVmNotificationRows(undefined, 5);
      if (rows.length === 0) {
         log.info(`[notif-rows:${tag}] (no rows)`);
         return;
      }
      log.info(`[notif-rows:${tag}] ${rows.length} latest:`);
      for (const r of rows) log.info(`  - ${r.raw}`);
   } catch (e) {
      log.warn(`[notif-rows:${tag}] dump failed: ${(e as Error).message}`);
   }
}

export async function captureSeedRoot(
   action: Action,
   shared: SharedState,
   seederSvc: ChatService,
   mirrorSvc?: ChatService,
   context?: string,
): Promise<void> {
   if (!action.seedRoot) return;

   // 0) Cache hit: same (action, context) within this process — reuse rootId
   //    without probing/sending. Covers subsequent test files & retries.
   const cacheKey = context ? seedRootKey(action.feature, context) : undefined;
   if (cacheKey) {
      const cached = seedRootCache.get(cacheKey);
      if (cached) {
         shared.rootId = cached.rootId;
         if (cached.rootQuoteText !== undefined) shared.rootQuoteText = cached.rootQuoteText;
         log.info(`[seedRoot] cache hit for ${cacheKey} (rootId=${cached.rootId})`);
         if (mirrorSvc) await mirrorSvc.view.verifyMessageById(cached.rootId, 30_000);
         return;
      }
   }

   // 1) Probe: invoke seedRoot with a mock svc whose `send.*` are no-ops,
   //    so we can extract the descriptor (return value) without actually sending.
   const noopSend = new Proxy({}, { get: () => async () => {} });
   const probeSvc = new Proxy(seederSvc, {
      get(target, prop, receiver) {
         if (prop === 'send') return noopSend;
         return Reflect.get(target, prop, receiver);
      },
   }) as ChatService;
   const ret = await action.seedRoot(probeSvc);
   if (ret === undefined || ret === null) return;

   const messages = (await seederSvc.chatPage.thread.isOpen())
      ? seederSvc.chatPage.thread.messages
      : seederSvc.chatPage.messages;

   // Build a locator that matches ALL bubbles for the descriptor (without
   // the `.last()` collapsing that `getTextMessage`/handlers apply), then
   // exclude reply/forward bubbles so we only target the true root.
   const replyOrForwardMarker = seederSvc.chatPage.page.locator(
      '[role="button"][aria-label^="Reply to"], svg.lucide-forward',
   );
   let rootCandidates;
   if (typeof ret === 'string') {
      shared.rootQuoteText = ret;
      rootCandidates = messages.data_message.filter({ hasText: ret });
   } else if (typeof ret === 'object' && 'type' in (ret as Record<string, unknown>)) {
      const tag = ret as { type: MessageType; value?: string };
      // Type-based match (e.g. voice/file/image) still goes through the
      // handler, but we pull the same candidates without `.last()` by
      // re-applying the handler's filter on `data_message` is non-trivial;
      // fall back to the single-locator path for non-text types.
      rootCandidates = handlerFor(tag.type).locator(messages, tag.value);
   } else {
      return;
   }
   const rootOnly = rootCandidates.filter({ hasNot: replyOrForwardMarker });
   const last = rootOnly.last();

   // 2) Try to find an existing root in DOM. If not attached (virtualized
   //    list scrolled past), scroll up to load history before giving up.
   let alreadyExists = false;
   try {
      await last.waitFor({ state: 'attached', timeout: 2_000 });
      alreadyExists = (await rootOnly.count()) > 0;
   } catch {
      alreadyExists = false;
   }
   if (!alreadyExists) {
      try {
         await ensureInView(seederSvc.chatPage.page, rootOnly, 40);
         alreadyExists = (await rootOnly.count()) > 0;
         if (alreadyExists) log.info('[seedRoot] root found after scroll-up');
      } catch {
         alreadyExists = false;
      }
   }

   if (alreadyExists) {
      log.info('[seedRoot] root already exists, skipping send');
   } else {
      await action.seedRoot(seederSvc);
      await seederSvc.chatPage.scrollToBottom().catch(() => { /* best-effort */ });
   }

   await waitForVisible(last, 30_000);
   shared.rootId = (await last.getAttribute('data-message-id')) ?? undefined;
   if (!shared.rootId) throw new Error('seedRoot: failed to capture rootId');

   if (cacheKey) {
      seedRootCache.set(cacheKey, {
         rootId: shared.rootId,
         rootQuoteText: shared.rootQuoteText,
      });
      log.info(`[seedRoot] cached ${cacheKey} (rootId=${shared.rootId})`);
   }

   if (mirrorSvc) {
      await mirrorSvc.view.verifyMessageById(shared.rootId, 30_000);
   }
}

export function recordErrors(testInfo: TestInfo, action: Action) {
   recordTestErrors(testInfo, {
      epic:     EPIC,
      feature:  action.feature,
   });
}

export function registerCases(
   cases: Case[],
   makeFn: (tc: Case) => Parameters<typeof test>[2],
): void {
   for (const tc of cases) {
      const tag = tc.smoke ? '@smoke' : undefined;
      if (tc.skip) {
         test.skip(`${tc.id} - ${tc.name}`, { tag }, () => {});
         continue;
      }
      test(`${tc.id} - ${tc.name}`, { tag }, makeFn(tc));
   }
}

export async function allureMetadata(opts: {
   action: Action;
   storyLabel: string;
   tenantKind: string;
   context: string;
   conversation: string;
   rounds: number;
   roundsLabel?: string;  // 'Messages sent' (thread) or 'Action sent' (main)
}) {
   await allure.epic(EPIC);
   await allure.feature(opts.action.feature);
   await allure.story(opts.storyLabel);
   await allure.severity(opts.action.severity ?? 'normal');
   await allure.parameter('Tenant',        opts.tenantKind);
   await allure.parameter('Sender',        SENDER);
   await allure.parameter('Receiver',      RECEIVER);
   await allure.parameter('Context',       opts.context);
   await allure.parameter('Conversation',  opts.conversation);
   await allure.parameter(opts.roundsLabel ?? 'Messages sent', String(opts.rounds));
}
