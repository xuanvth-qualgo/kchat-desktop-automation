import { expect } from '@playwright/test';
import { NotificationPushPage } from '../../pages/notification-push/NotificationPushPage';
import { SidebarPage } from '../../pages/common/SidebarPage';

export class NotificationPushService {
   constructor(readonly pushPage: NotificationPushPage) {}

   async expectUnreadCount(name: string, expected: number = 1, timeout: number = 10_000): Promise<void> {
      const btn = this.pushPage.sidebar.conversationButton(name).first();
      await expect.poll(
         async () => {
            const label = await btn.getAttribute('aria-label').catch(() => '') ?? '';
            return SidebarPage.unreadCountFromLabel(label);
         },
         {
            message:   `expected ${expected} unread on sidebar conversation "${name}"`,
            timeout,
            intervals: [200, 400, 600, 1000],
         },
      ).toBe(expected);
   }

   async getUnreadCount(name: string, timeout: number = 5_000): Promise<number> {
      const btn = this.pushPage.sidebar.conversationButton(name).first();
      await btn.waitFor({ state: 'visible', timeout });
      const label = await btn.getAttribute('aria-label') ?? '';
      return SidebarPage.unreadCountFromLabel(label);
   }

   async expectAppBarUnreadCount(expected: number, timeout: number = 10_000): Promise<void> {
      await expect.poll(
         () => this.pushPage.readAppBarTotal(),
         { message: `expected app-bar total unread = ${expected}`, timeout, intervals: [200] },
      ).toBe(expected);
   }

   /** Assert that the app-bar badge belonging to the scenario's tab equals
    *  `expected`. The tab is identified by `match(label)` returning true
    *  for a single badge (Chat tab, or a specific Community icon).
    *  When no badge matches, the current value is treated as 0. */
   async expectAppBarTabUnread(
      match: (label: string) => boolean,
      expected: number,
      timeout: number = 10_000,
   ): Promise<void> {
      await expect.poll(
         async () => {
            const items = await this.pushPage.readAppBarBreakdown();
            const hit = items.find(i => match(i.label));
            return hit ? hit.count : 0;
         },
         {
            message:   `expected scenario-tab app-bar unread = ${expected}`,
            timeout,
            intervals: [200, 400, 600, 1000],
         },
      ).toBe(expected);
   }

   /** Assert that the SUM of app-bar badges whose label matches `match`
    *  equals `expected`. Use this to combine, e.g., the Chat tab plus a
    *  specific Community icon — excluding bleed from unrelated tabs. */
   async expectAppBarTabsSumUnread(
      match: (label: string) => boolean,
      expected: number,
      timeout: number = 10_000,
   ): Promise<void> {
      await expect.poll(
         async () => {
            const items = await this.pushPage.readAppBarBreakdown();
            return items.filter(i => match(i.label)).reduce((s, i) => s + i.count, 0);
         },
         {
            message:   `expected scenario-tabs sum app-bar unread = ${expected}`,
            timeout,
            intervals: [200, 400, 600, 1000],
         },
      ).toBe(expected);
   }
}
