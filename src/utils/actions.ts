import { Page, Locator, expect, test } from '@playwright/test';
import type { Page as PlaywrightPage, ElectronApplication } from 'playwright';
import { allure } from 'allure-playwright';
import { ensureInView } from './ui';
import * as fs from 'fs';
import * as path from 'path';

// Base UI actions
export async function click(element: Locator): Promise<void> {
   await expect(element).toBeVisible();
   await expect(element).toBeEnabled();
   await element.click();
}

export async function rightClick(element: Locator): Promise<void> {
   await expect(element).toBeVisible();
   await expect(element).toBeEnabled();
   await element.click({ button: 'right' });
}

export async function hover(element: Locator): Promise<void> {
   await element.scrollIntoViewIfNeeded({ timeout: 2_000 }).catch(() => { });
   await expect(element).toBeVisible();
   await element.hover();
}

export async function press(element: Locator, key: string): Promise<void> {
   await expect(element).toBeVisible();
   await expect(element).toBeEnabled();
   await element.press(key);
}

export async function longClick(element: Locator, durationMs: number = 1500): Promise<void> {
   await expect(element).toBeVisible();
   await expect(element).toBeEnabled();
   const box = await element.boundingBox();
   if (!box) throw new Error('longClick: element has no bounding box');
   const page = element.page();
   const x = box.x + box.width / 2;
   const y = box.y + box.height / 2;
   await page.mouse.move(x, y);
   await page.mouse.down();
   await page.waitForTimeout(durationMs);
   await page.mouse.up();
}

export async function longHover(element: Locator, durationMs: number = 1500): Promise<void> {
   await element.scrollIntoViewIfNeeded({ timeout: 2_000 }).catch(() => { /* best effort */ });
   await expect(element).toBeVisible();
   await element.hover();
   await element.page().waitForTimeout(durationMs);
}

export async function input(element: Locator, text: string): Promise<void> {
   await expect(element).toBeVisible();
   await expect(element).toBeEnabled();
   await element.click();
   await element.clear();
   await element.fill(text);
}

type Scope = Page | Locator;

export function getButtonByName(scope: Scope, name: string | RegExp, exact: boolean = false): Locator {
   return scope.getByRole('button', { name, exact }).first();
}

export function getMenuItemByName(scope: Scope, name: string | RegExp, exact: boolean = false): Locator {
   return scope.getByRole('menuitem', { name, exact }).first();
}

export function getTextboxByName(scope: Scope, name: string | RegExp, exact: boolean = false): Locator {
   return scope.getByRole('textbox', { name, exact }).first();
}

export function getTabByName(scope: Scope, name: string | RegExp, exact: boolean = false): Locator {
   return scope.getByRole('tab', { name, exact }).first();
}

export async function waitForVisible(element: Locator, timeout: number = 2_000): Promise<void> {
   await element.waitFor({ state: 'visible', timeout });
}

export async function assertToBeVisible(element: Locator, timeout: number = 15_000): Promise<void> {
   await expect(element).toBeVisible({ timeout });
}

export function filterElementByOptions(
   element: Locator, 
   options: {
      has?: Locator | undefined;
      hasNot?: Locator;
      hasNotText?: string | RegExp;
      hasText?: string | RegExp;
      visible?: boolean;
   } | undefined
): Locator {
   return element.filter(options);
}

export async function openContextMenuOf(page: Page, root: Locator): Promise<void> {
   await ensureInView(page, root);
   const menu = page.locator('[role="menu"]').first();
   for (let attempt = 0; attempt < 3; attempt++) {
      await hover(root).catch(() => { });
      await rightClick(root);
      try {
         await waitForVisible(menu);
         return;
      } catch {
         await page.keyboard.press('Escape').catch(() => {});
         await menu.waitFor({ state: 'hidden', timeout: 400 }).catch(() => {});
      }
   }
}

export async function runContextMenuAction(page: Page, root: Locator, menuItem: Locator): Promise<void> {
   const target = menuItem.first();
   const maxAttempts = 4;
   let lastError: unknown;
   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await openContextMenuOf(page, root);
      try {
         await waitForVisible(target, 5_000);
         await target.click({ timeout: 5_000 });
         return;
      } catch (err) {
         lastError = err;
         await page.keyboard.press('Escape').catch(() => {});
         await page.locator('[role="menu"]').first()
            .waitFor({ state: 'hidden', timeout: 800 }).catch(() => {});
      }
   }
   throw lastError instanceof Error ? lastError : new Error('runContextMenuAction: failed to click menu item');
}

export async function setOffline(page: PlaywrightPage, offline: boolean): Promise<void> {
   await page.context().setOffline(offline);
   await page.evaluate(off => {
      Object.defineProperty(navigator, 'onLine', { value: !off, configurable: true });
      window.dispatchEvent(new Event(off ? 'offline' : 'online'));
   }, offline);
}

export async function unfocusApp(app: ElectronApplication): Promise<void> {
   await app.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
      win?.blur();
   });
}

export async function minimizeApp(app: ElectronApplication): Promise<void> {
   await app.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
      win?.minimize();
   });
}

export async function restoreApp(app: ElectronApplication): Promise<void> {
   await app.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      if (!win) return;
      if (win.isMinimized()) win.restore();
      win.show();   
      win.focus(); 
   });
}

export async function setToggleState(
  toggle: Locator,
  expected: boolean,
): Promise<void> {
  const current =
    (await toggle.getAttribute('aria-checked')) === 'true';

  if (current !== expected) {
    await toggle.click();
  }
}

export async function takeScreenShot(page: Page, actionName: string, opts?: { waitMs?: number }): Promise<void> {
   if (opts?.waitMs) await page.waitForTimeout(opts.waitMs);
   const buf = await page.screenshot({ path: `./test-screenshots/${actionName}-${Date.now()}.png` });
   try { await allure.attachment(actionName, buf, 'image/png'); } catch { /* ignore */ }
}

// Base test utilities
const ERROR_DIR = './test-screenshots/errors';

export type StepOpts = {
   retries?:   number;
   timeoutMs?: number;
   pages?:     Record<string, Page>;  // e.g. { u1: u1.page, u2: u2.page } — screenshot each on every failed attempt
};

function safeTag(s: string): string {
   return s.replace(/[^\w.-]+/g, '_').slice(0, 80);
}

async function captureFailure(
   name: string,
   totalAttempts: number,
   err: unknown,
   pages?: Record<string, Page>,
): Promise<void> {
   if (!pages) return;
   try { fs.mkdirSync(ERROR_DIR, { recursive: true }); } catch { /* ignore */ }
   const tag    = safeTag(name);
   const errMsg = `[after ${totalAttempts} attempts] ${(err as Error)?.message ?? String(err)}`;

   try { fs.writeFileSync(path.join(ERROR_DIR, `${tag}.txt`), errMsg); } catch { /* ignore */ }
   await test.info().attach(`${tag}.txt`, { body: errMsg, contentType: 'text/plain' }).catch(() => {});

   for (const [who, p] of Object.entries(pages)) {
      const file = path.join(ERROR_DIR, `${tag}-${who}.png`);
      const buf  = await p.screenshot({ fullPage: true, path: file }).catch(() => null);
      if (buf) {
         await test.info()
            .attach(`${tag}-${who}.png`, { body: buf, contentType: 'image/png' })
            .catch(() => {});
      }
   }
}

export async function stepAndRetry(
   name: string,
   fn: () => Promise<void>,
   opts: StepOpts = {},
): Promise<void> {
   const retries   = opts.retries   ?? 3;
   const timeoutMs = opts.timeoutMs ?? 60_000;

   console.log(`▶ [step] "${name}" — start (retries=${retries}, timeout=${timeoutMs}ms)`);
   await test.step(name, async () => {
      let lastErr: unknown;
      for (let attempt = 1; attempt <= retries + 1; attempt++) {
         const t0 = Date.now();
         try {
            await Promise.race([
               fn(),
               new Promise<never>((_, rej) =>
                  setTimeout(() => rej(new Error(`step timeout ${timeoutMs}ms`)), timeoutMs),
               ),
            ]);
            const dur = Date.now() - t0;
            console.log(`✔ [step] "${name}" — PASSED on attempt ${attempt}/${retries + 1} (${dur}ms)\n`);
            return;
         } catch (e) {
            lastErr = e;
            const dur = Date.now() - t0;
            console.warn(`✘ [step] "${name}" — attempt ${attempt}/${retries + 1} FAILED (${dur}ms): ${(e as Error).message}\n`);
         }
      }
      console.warn(`⊘ [step] "${name}" — SKIPPED after ${retries + 1} attempts — last error: ${(lastErr as Error)?.message}\n`);
      await captureFailure(name, retries + 1, lastErr, opts.pages)
      throw lastErr instanceof Error ? lastErr : new Error(`Step "${name}" failed after ${retries + 1} attempts`);
   });
}