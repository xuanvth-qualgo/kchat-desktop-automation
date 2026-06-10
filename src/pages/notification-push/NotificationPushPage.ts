import { Page } from '@playwright/test';
import { SidebarPage } from '../common/SidebarPage';
import { getSidebar } from '../../tenant/TenantContext';

export const APP_BAR_MAX_LEFT_PX = 80;

export class NotificationPushPage {
   readonly sidebar: SidebarPage;

   constructor(protected readonly page: Page) {
      this.sidebar = getSidebar(page);
   }

   /** Sum of unread badges in the left app-bar strip (excludes sidebar conversation rows).
    *  Returns 0 when no badge is rendered — no numeric-text fallback (it was prone to
    *  matching unrelated numbers like avatar initials or timestamps). */
   async readAppBarTotal(): Promise<number> {
      const items = await this.readAppBarBreakdown();
      return items.reduce((s, i) => s + i.count, 0);
   }

   /** Per-tab breakdown of unread badges in the left app-bar strip.
    *  Returns one entry per visible badge with its raw `aria-label` so callers
    *  can attribute counts to the Chat tab / individual Community icons. */
   async readAppBarBreakdown(): Promise<Array<{ label: string; count: number }>> {
      return this.page.evaluate((maxLeft: number) => {
         const items: Array<{ label: string; count: number }> = [];
         document.querySelectorAll<HTMLElement>('[aria-label]').forEach(el => {
            const label = el.getAttribute('aria-label') || '';
            const m = label.match(/(\d+)\s+(unread|non lus|chưa đọc)/i);
            if (!m) return;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            // Only badges inside the left app-bar; exclude sidebar conversation rows.
            if (r.left >= maxLeft) return;
            items.push({ label, count: Number(m[1]) });
         });
         return items;
      }, APP_BAR_MAX_LEFT_PX);
   }
}
