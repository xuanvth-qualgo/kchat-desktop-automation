import { Page, Locator, expect } from '@playwright/test';
import { ensureInView } from './ui';

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
   return element.filter(options).last();
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