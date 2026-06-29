import { Page, ElectronApplication, Locator } from '@playwright/test';
import { scrollToBottom, scrollToElement } from '../../utils/ui';
import { BasePage } from '../BasePage';
import { ChatComposers }   from './sections/ChatComposers';
import { ChatMessages }    from './sections/ChatMessages';
import { ChatThreadPanel } from './sections/ChatThreadPanel';

export class ChatPage extends BasePage {
   readonly composers: ChatComposers;
   readonly messages:  ChatMessages;
   readonly thread:    ChatThreadPanel;

   constructor(
      page: Page,
      app?: ElectronApplication,
      scope?: Page | Locator,
   ) {
      super(page, app, scope);

      this.composers = new ChatComposers(this, scope);
      this.messages = new ChatMessages(this, scope);
      this.thread = new ChatThreadPanel(this);
   }

   scrollToBottom(): Promise<void> {
      return scrollToBottom(this.page);
   }

   scrollTo(target: Locator, opts?: Parameters<typeof scrollToElement>[2]): Promise<void> {
      return scrollToElement(this.page, target, opts);
   }
}