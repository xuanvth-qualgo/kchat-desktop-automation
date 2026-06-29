import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { SidebarPage } from '../common/SidebarPage';

export const APP_BAR_MAX_LEFT_PX = 80;

export class NotificationPushPage extends BasePage{
   readonly sidebar: SidebarPage;

   constructor(readonly page: Page) {
      super(page);
      this.sidebar = new SidebarPage(page);
   }

   async readAppBarTotal(): Promise<number> {
      const items = await this.readAppBarBreakdown();
      return items.reduce((s, i) => s + i.count, 0);
   }

   async readAppBarBreakdown(): Promise<Array<{ label: string; count: number }>> {
      return this.page.evaluate((maxLeft: number) => {
         const items: Array<{ label: string; count: number }> = [];
         document.querySelectorAll<HTMLElement>('[aria-label]').forEach(el => {
            const label = el.getAttribute('aria-label') || '';
            const m = label.match(/(\d+)\s+(unread|non lus|chưa đọc)/i);
            if (!m) return;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            if (r.left >= maxLeft) return;
            items.push({ label, count: Number(m[1]) });
         });
         return items;
      }, APP_BAR_MAX_LEFT_PX);
   }
}
