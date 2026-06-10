import { Page } from '@playwright/test';
import { ConversationRef, MissingTenantParentError, TenantContext, getSidebar } from './TenantContext';

export class B2BContext implements TenantContext {
   readonly kind = 'b2b' as const;

   async openConversation(page: Page, ref: ConversationRef): Promise<void> {
      if (!ref.parent) throw new MissingTenantParentError(this.kind, ref.name);
      const sidebar = getSidebar(page);
      await sidebar.selectInOrganization(ref.parent, ref.name);
   }
}
