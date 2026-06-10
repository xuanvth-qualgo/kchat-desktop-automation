import { ElectronApplication, Page, Locator } from '@playwright/test';
import { ChatPage } from '../ChatPage';

export class ComposerScope {
   constructor(
      protected readonly chat: ChatPage,
      protected readonly scopeOverride?: Page | Locator,
   ) {}

   protected get page():  Page                          { return this.chat.page; }
   protected get app():   ElectronApplication | null    { return this.chat.app;  }
   protected get scope(): Page | Locator                { return this.scopeOverride ?? this.chat.scope; }
}
