import { Locator, Page } from '@playwright/test';

async function settleFrames(page: Page): Promise<void> {
   await page.evaluate(
      () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
   );
}

export async function scrollToBottom(page: Page): Promise<void> {
   await page.evaluate(() => {
      const article = document.querySelector('[role="article"]');
      let el: HTMLElement | null = article as HTMLElement | null;
      while (el && el.scrollHeight <= el.clientHeight) el = el.parentElement;
      if (el) el.scrollTop = el.scrollHeight;
   });
   await settleFrames(page);
}

export async function ensureInView(page: Page, root: Locator, maxScrolls: number = 40): Promise<void> {
   for (let i = 0; i < maxScrolls; i++) {
      if (await root.count() > 0) {
         try {
            await root.scrollIntoViewIfNeeded({ timeout: 1_500 });
            return;
         } catch { }
      }
      await page.evaluate(() => {
         const article = document.querySelector('[role="article"]');
         let el: HTMLElement | null = article as HTMLElement | null;
         while (el && el.scrollHeight <= el.clientHeight) el = el.parentElement;
         if (el) el.scrollTop = Math.max(0, el.scrollTop - 1200);
      });
      await settleFrames(page);
   }
}