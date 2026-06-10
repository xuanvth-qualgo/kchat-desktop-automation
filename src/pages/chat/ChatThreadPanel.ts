import { Locator } from '@playwright/test';
import { ChatPage } from './ChatPage';
import { ChatComposers } from './ChatComposers';
import { ThreadLabels } from './labels';
import { ChatMessages }  from './ChatMessages';
import { click, getButtonByName } from '../../core/utils/actions';

export class ChatThreadPanel {
   readonly composers: ChatComposers;
   readonly messages:  ChatMessages;

   constructor(private readonly chat: ChatPage) {
      const root = this.root;
      this.composers = new ChatComposers(chat, root);
      this.messages  = new ChatMessages(chat, root);
   }

   private get page() { return this.chat.page; }

   private get root(): Locator {
      return this.page.locator('[data-rightbar-id="thread-replies-rightbar"]').last();
   }

   private get btn_closeThread(): Locator {
      return getButtonByName(this.root, ThreadLabels.close);
   }

   async isOpen(): Promise<boolean> {
      return (await this.root.count()) > 0 && (await this.root.first().isVisible().catch(() => false));
   }

   async close(): Promise<void> {
      if (await this.btn_closeThread.count() > 0) {
         await click(this.btn_closeThread);
         await this.root.first().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { });
      }
   }
}
