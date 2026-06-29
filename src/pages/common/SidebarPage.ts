import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { click, input, takeScreenShot } from '../../utils/actions';
import { scrollToElement } from '../../utils/ui';
import { SidebarLabels, SidebarSelectors } from '../../_generated/common.element';
import { escapeRegex } from '../../utils/helpers';

export type ConversationRef = { name: string; parent?: string };

export class SidebarPage extends BasePage {
   constructor(readonly page: Page) {
      super(page);
   }

   getPage(): Page { return this.page; }

   chatTab(): Locator {
      return this.page.getByRole('button', { name: SidebarLabels.chatTab, exact: true });
   }

   searchBtn(): Locator {
      return this.page.locator(SidebarLabels.searchConvBtn);
   }

   searchInput(): Locator {
      return this.page.locator(SidebarLabels.searchConvInput);
   }

   convContainer(){
      return this.page.locator(SidebarLabels.convContainer);
   }

   async resetToChatTab(): Promise<void> {
      const tab = this.page.locator('//button[@title="Chat"]'); // this.chatTab();
      if (await tab.count()) await click(tab.first());
   }

   async globalSearch(convName: string): Promise<void> {
      await click(this.searchBtn());
      await click(this.searchInput());
      await input(this.searchInput(), convName);
   }

   async clearGlobalSearch(): Promise<void> {
      await click(this.searchBtn());
      const searchInput = await this.searchInput();
      await click(searchInput);
      if (await searchInput.count()) await input(searchInput, '');
   }

   // Conversation and unread message count
   conversationButton(title: string): Locator {// use for all conversation after select personal/organization
      return this.page.getByRole('button', { name: SidebarSelectors.conversationBtn(title) });
   }

   communityButton(title: string): Locator {
      return this.page.locator(`button[title="${title}"]`);
   }

   organizationButton(title: string): Locator {
      return this.page.locator(`button[title="${title}"]`);
   }

   async getConversationId(conversationName: string): Promise<string> {
      const conv = this.conversationButton(conversationName);
      return (await conv.getAttribute(SidebarLabels.conversationId)) || '';
   }

   async getUnreadMessageCount(conversationName: string): Promise<number> {
      const conv = this.conversationButton(conversationName);
      const badge = conv.locator(SidebarLabels.unreadBadge);
      if ((await badge.count()) === 0) return 0;
      return Number(await badge.first().getAttribute(SidebarLabels.unreadCount)) || 0;
   }

   async selectDirectConv(title: string, isBySearch: boolean = false, timeout?: number): Promise<void> {// B2C Conversation
      await this.resetToChatTab(); 
      if (isBySearch) { await this.globalSearch(title); }
      await scrollToElement(this.convContainer(), this.conversationButton(title));
      await click(this.conversationButton(title).first());
      if (timeout) await this.page.waitForTimeout(timeout);
   }

   async selectCommunityChannel(community: string, channel: string, timeout?: number): Promise<void> {// B2C Community Channel
      await scrollToElement(this.convContainer(), this.communityButton(community));
      await click(this.communityButton(community).first());
      await click(this.conversationButton(channel).first());
      if (timeout) await this.page.waitForTimeout(timeout);      
   }

   async selectOrganizationChannel(organization: string, channel: string, timeout?: number): Promise<void> {// B2B Organization Channel
      await scrollToElement(this.convContainer(), this.organizationButton(organization));
      await click(this.organizationButton(organization).first());
      await click(this.conversationButton(channel).first());
      if (timeout) await this.page.waitForTimeout(timeout);      
   }
}