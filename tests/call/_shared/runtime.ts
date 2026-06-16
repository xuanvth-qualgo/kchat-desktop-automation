import { allure } from 'allure-playwright';
import type { Browser, Page } from '@playwright/test';
import { CallPage } from '../../../src/pages/call/CallPage';
import type { CallService } from '../../../src/services/call/CallService';
import { log } from '../../../src/core/log';
import { attachScreenshot } from '../../../src/core/reporting/allure';
import { EPIC, CALLER, CALLEE, type CallScenario } from './base';

// ---------------------------------------------------------------------------
// Ngữ cảnh fail của retryStep (call) — scenario đăng ký page Caller/Callee
// trước khi chạy STEP. Khi step hết retry: tự chụp screenshot + note Allure.
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
      catch (e) { log.warn(`[call-step-retry] screenshot ${name} failed: ${(e as Error).message}`); }
   }
}

// ---------------------------------------------------------------------------
// retry wrapper — mirror tests/chat/_shared/runtime.ts để test call cũng có
// cùng chính sách retry mà không cross-import giữa hai feature.
//
// Spec (theo yêu cầu lead):
//   - Tối đa 3 lần thử (1 lần chính + 2 lần retry).
//   - Tổng thời gian không vượt 30 giây — fail sớm thay vì kéo dài.
//   - Mỗi attempt được bọc trong allure.step để hiển thị rõ trên report.
// ---------------------------------------------------------------------------
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
         log.warn(`[call-step-retry] "${label}" total timeout ${totalTimeoutMs}ms exceeded before attempt ${i}`);
         break;
      }
      const stepLabel = i === 1 ? label : `${label} (retry ${i - 1})`;
      try {
         await allure.step(stepLabel, fn);
         return;
      } catch (e) {
         lastErr = e;
         log.warn(`[call-step-retry] "${label}" attempt ${i}/${attempts} failed: ${(e as Error).message}`);
         if (Date.now() >= deadline) {
            log.warn(`[call-step-retry] "${label}" total timeout ${totalTimeoutMs}ms exceeded after attempt ${i}`);
            break;
         }
      }
   }
   await captureFailureArtifacts(label, lastErr as Error);
   throw lastErr;
}

export async function allureCallMetadata(sc: CallScenario, kind: 'voice' | 'video') {
   await allure.epic(EPIC);
   await allure.feature(sc.feature);
   await allure.story(`[${sc.context}] ${sc.name}`);
   await allure.severity(sc.severity ?? 'normal');
   await allure.parameter('Caller',       CALLER);
   await allure.parameter('Callee',       CALLEE);
   await allure.parameter('Context',      sc.context);
   await allure.parameter('Conversation', sc.hostConv.name);
   await allure.parameter('Call type',    kind);
}

// ---------------------------------------------------------------------------
// Window helpers
// ---------------------------------------------------------------------------

/**
 * Host: click voice/video call button and capture the new call window as a CallPage.
 * Relies on CallService.startCallAndSwitchWindow which uses ElectronApplication.waitForEvent.
 */
export async function startHostCall(
   host: CallService,
   kind: 'voice' | 'video',
): Promise<CallPage> {
   return host.startCallAndSwitchWindow(kind);
}

/**
 * VM (CDP-attached Browser): wait for a new page to appear in the first context.
 * kChat opens incoming-call as a separate window which surfaces as a new Page
 * in the CDP target list. We then bind a CallPage to it.
 */
export async function waitForVmIncomingCall(
   vmApp: Browser,
   vmMain: Page,
   timeoutMs = 60_000,
): Promise<CallPage> {
   const ctx = vmApp.contexts()[0];
   if (!ctx) throw new Error('vmApp has no context');
   const t0 = Date.now();
   // Try via event first; fall back to polling existing pages (in case the
   // window appeared before our listener was registered).
   const pagePromise = ctx.waitForEvent('page', { timeout: timeoutMs }).catch(() => null);
   const existing    = await pollForNewVmPage(ctx, vmMain, 2_000);
   const page        = existing ?? await pagePromise;
   if (!page) throw new Error(`incoming call window did not appear within ${timeoutMs}ms`);
   await page.waitForLoadState().catch(() => { /* best-effort */ });
   log.info(`[call] vm incoming window appeared after ${((Date.now() - t0) / 1000).toFixed(1)}s, url=${page.url()}`);
   return new CallPage(page);
}

async function pollForNewVmPage(
   ctx: import('@playwright/test').BrowserContext,
   exclude: Page,
   timeoutMs: number,
): Promise<Page | null> {
   const deadline = Date.now() + timeoutMs;
   while (Date.now() < deadline) {
      const candidate = ctx.pages().find(p => p !== exclude && !p.url().startsWith('devtools://'));
      if (candidate) return candidate;
      await new Promise(r => setTimeout(r, 250));
   }
   return null;
}

export const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Screenshot helpers (Allure attachment)
// ---------------------------------------------------------------------------
export async function snap(page: Page, name: string): Promise<void> {
   try { await attachScreenshot(page, name); } catch { /* best-effort */ }
}
