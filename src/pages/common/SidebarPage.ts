import { Locator, Page } from '@playwright/test';
import { click } from '../../core/utils/actions';
import { escapeRegex } from '../../core/utils/helpers';

export class SidebarPage {
   constructor(protected readonly page: Page) {}

   getPage(): Page { return this.page; }

   // ---- Shared locators ----

   /** Top-level "Chat" tab. Pressing it exits any active parent (community/org) context. */
   chatTab(): Locator {
      return this.page.getByRole('button', { name: 'Chat', exact: true });
   }

   /** Matches "N unread messages" (EN), "N non lus" (FR), "N chưa đọc" (VI). */
   private static readonly UNREAD_LABEL_SUFFIX = '(?:unread messages?|non lus?|chưa đọc)';

   /** Sidebar conversation row.
    *  count=undefined → matches with or without an unread badge
    *  count=N         → matches only when aria-label advertises exactly N unread */
   conversationButton(name: string, count?: number): Locator {
      const namePart = escapeRegex(name);
      const suffix   = SidebarPage.UNREAD_LABEL_SUFFIX;
      const re = count === undefined
         ? new RegExp(`^Conversation with ${namePart}(?:, \\d+ ${suffix})?$`)
         : new RegExp(`^Conversation with ${namePart}, ${count} ${suffix}$`);
      return this.page.getByRole('button', { name: re });
   }

   /** Parse the unread count out of a sidebar aria-label, e.g.
    *  "Conversation with Alice, 3 unread messages" → 3 (returns 0 if absent). */
   static unreadCountFromLabel(label: string): number {
      const m = label.match(new RegExp(`, (\\d+) ${SidebarPage.UNREAD_LABEL_SUFFIX}$`));
      return m ? Number(m[1]) : 0;
   }

   /** Reset to top-level Chat sidebar (exits community/organization context). */
   async resetToChatTab(): Promise<void> {
      const tab = this.chatTab();
      if (await tab.count()) await click(tab.first());
   }

   // -----------------------------------------------------------------
   // B2C surface
   // -----------------------------------------------------------------

   /** B2C community entry by visible title. */
   communityButton(title: string): Locator {
      return this.page.locator(`button[title="${title}"]`);
   }

   /** B2C: select a direct user or group from the flat Chat tab. */
   async selectDirect(name: string): Promise<void> {
      await this.resetToChatTab();
      await click(this.conversationButton(name));
   }

   /** B2C: enter a community, then select a channel inside it. */
   async selectInCommunity(community: string, channel: string): Promise<void> {
      await this.resetToChatTab();
      await click(this.communityButton(community));
      await click(this.conversationButton(channel));
   }

   // -----------------------------------------------------------------
   // B2B surface (TODO: locators + flow pending real UI)
   // -----------------------------------------------------------------

   /** B2B organization entry. Selector is a placeholder until the B2B sidebar ships. */
   organizationButton(title: string): Locator {
      // TODO(b2b): replace with the real selector once kChat B2B UI is available.
      // Current value mirrors the B2C community selector so type signatures compile.
      return this.page.locator(`[data-org-title="${title}"]`);
   }

   /** B2B: enter an organization, then select a channel inside it. */
   async selectInOrganization(organization: string, channel: string): Promise<void> {
      // TODO(b2b): wire to real flow once UI is implemented.
      throw new Error(
         `selectInOrganization("${organization}", "${channel}") not implemented — B2B sidebar UI is pending.`,
      );
   }
}
