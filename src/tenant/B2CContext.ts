import { Page } from '@playwright/test';
import { ConversationRef, TenantContext, getSidebar } from './TenantContext';

export class B2CContext implements TenantContext {
   readonly kind = 'b2c' as const;

   async openConversation(page: Page, ref: ConversationRef): Promise<void> {
      const sidebar = getSidebar(page);
      if (ref.parent) {
         await sidebar.selectInCommunity(ref.parent, ref.name);
      } else {
         await sidebar.selectDirect(ref.name);
      }
   }
}
