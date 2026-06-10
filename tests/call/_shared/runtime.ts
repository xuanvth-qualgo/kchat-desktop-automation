import { allure } from 'allure-playwright';
import type { Browser, Page } from '@playwright/test';
import { CallPage } from '../../../src/pages/call/CallPage';
import type { CallService } from '../../../src/services/call/CallService';
import { log } from '../../../src/core/log';
import { attachScreenshot } from '../../../src/core/reporting/allure';
import { EPIC, CALLER, CALLEE, type CallScenario } from './base';

// ---------------------------------------------------------------------------
// retry wrapper — mirrors tests/chat/_shared/runtime.ts so call tests get the
// same per-step resilience without cross-feature imports.
// ---------------------------------------------------------------------------
export async function retryStep(
   label: string,
   fn: () => Promise<void>,
   attempts: number = 3,
): Promise<void> {
   let lastErr: unknown;
   for (let i = 1; i <= attempts; i++) {
      const stepLabel = i === 1 ? label : `${label} (retry ${i - 1})`;
      try {
         await allure.step(stepLabel, fn);
         return;
      } catch (e) {
         lastErr = e;
         log.warn(`[call-step-retry] "${label}" attempt ${i}/${attempts} failed: ${(e as Error).message}`);
      }
   }
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
