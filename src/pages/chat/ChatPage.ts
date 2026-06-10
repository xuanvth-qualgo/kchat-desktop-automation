import { ElectronApplication, Page, Locator } from '@playwright/test';
import { scrollToBottom } from '../../core/utils/ui';
import { ChatComposers }   from './ChatComposers';
import { ChatMessages }    from './ChatMessages';
import { ChatThreadPanel } from './ChatThreadPanel';

export class ChatPage {
   readonly app: ElectronApplication | null;
   readonly page: Page;
   readonly scope: Page | Locator;
   readonly composers: ChatComposers;
   readonly messages:  ChatMessages;
   readonly thread:    ChatThreadPanel;

   constructor(app: ElectronApplication | null, page: Page, scope?: Page | Locator) {
      this.app = app;
      this.page = page;
      this.scope = scope ?? page;
      this.composers = new ChatComposers(this);
      this.messages  = new ChatMessages(this);
      this.thread    = new ChatThreadPanel(this);
   }

   scrollToBottom(): Promise<void> {
      return scrollToBottom(this.page);
   }
}
