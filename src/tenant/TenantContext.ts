import { Page } from '@playwright/test';
import { SidebarPage } from '../pages/common/SidebarPage';

const sidebarCache = new WeakMap<Page, SidebarPage>();
export function getSidebar(page: Page): SidebarPage {
   let sidebar = sidebarCache.get(page);
   if (!sidebar) {
      sidebar = new SidebarPage(page);
      sidebarCache.set(page, sidebar);
   }
   return sidebar;
}

export type TenantKind = 'b2c' | 'b2b';

export type ConversationRef = {
   name:    string;
   parent?: string;
};

export class MissingTenantParentError extends Error {
   constructor(kind: TenantKind, name: string) {
      super(`${kind.toUpperCase()} tenant requires a parent (organization/community) for "${name}".`);
      this.name = 'MissingTenantParentError';
   }
}

export interface TenantContext {
   readonly kind: TenantKind;

   openConversation(page: Page, ref: ConversationRef): Promise<void>;
}