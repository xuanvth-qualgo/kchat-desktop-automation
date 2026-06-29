import { Locator } from '@playwright/test';
import { ChatPage } from '../ChatPage';
import { ChatComposers } from './ChatComposers';
import { MessageActionLabels, ThreadLabels, ThreadSelectors } from '../../../_generated/chat.element';
import { ChatMessages }  from './ChatMessages';
import { click, getButtonByName, getMenuItemByName, hover, rightClick, longClick } from '../../../utils/actions';

export class ChatThreadPanel {
   readonly composers: ChatComposers;
   readonly messages:  ChatMessages;

   constructor(protected readonly chat: ChatPage) {
      const root = this.root;
      this.composers = new ChatComposers(chat, root);
      this.messages  = new ChatMessages(chat, root);
   }

   protected get page() { return this.chat.getPage; }

   protected get root(): Locator {
      return this.chat.getPage().locator(ThreadSelectors.panelRoot).last();
   }

   async getRoot(): Promise<Locator>{
      return this.root;
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
