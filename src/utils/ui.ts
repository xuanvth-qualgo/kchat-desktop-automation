import { Locator, Page } from '@playwright/test';

async function settleFrames(page: Page): Promise<void> {
   await page.evaluate(
      () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
   );
}

export async function scrollToElement(
  container: Locator,
  target: Locator,
): Promise<void> {
  const maxScrolls = 50;
  const step = 400;

  const search = async (direction: 1 | -1) => {
    for (let i = 0; i < maxScrolls; i++) {
      if (await target.count()) {
        await target.first().scrollIntoViewIfNeeded().catch(() => {});
        return true;
      }

      await container.evaluate(
        (el, { direction, step }) => {
          el.scrollTop += direction * step;
        },
        { direction, step },
      );
    }

    return false;
  };

  // Current -> Down
  if (await search(1)) return;

  // Top -> Down
  await container.evaluate(el => {
    el.scrollTop = 0;
  });

  if (await search(1)) return;

  // Bottom -> Up
  await container.evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });

  if (await search(-1)) return;

  throw new Error('Target not found after full scan');
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