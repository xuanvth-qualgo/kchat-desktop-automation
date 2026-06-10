import { Locator, Page } from '@playwright/test';
import { ChatPage } from './ChatPage';
import { MessageLabels, MenuLabels } from './labels';
import type { MenuAction } from '../../services/chat/types';
import { 
   click, 
   hover,
   longHover,
   getButtonByName, 
   getMenuItemByName,
   filterElementByOptions,
   openContextMenuOf,
   runContextMenuAction,
} from '../../core/utils/actions';

type Scope = Page | Locator;

const MENU_LABEL_FOR: Record<MenuAction, string> = {
   reply:        MenuLabels.reply,
   createThread: MenuLabels.createThread,
   openThread:   MenuLabels.openThread,
   edit:         MenuLabels.edit,
   forward:      MenuLabels.forward,
   copyText:     MenuLabels.copyText,
   copyLink:     MenuLabels.copyLink,
   copyImage:    MenuLabels.copyImage,
   delete:       MenuLabels.delete,
};

export class ChatMessages {
   constructor(
      protected readonly chat: ChatPage,
      private readonly scopeOverride?: Scope,
   ) {}

   protected get page(): Page { return this.chat.page; }
   protected get scope(): Scope { return this.scopeOverride ?? this.chat.scope; }

   get data_message(): Locator {
      if (this.scopeOverride) return this.scope.locator('[role="article"][data-message-id]');
      return this.scope.locator(
         'xpath=.//*[@role="article" and @data-message-id'
         + ' and not(ancestor::*[@data-rightbar-id])]'
      );
   }

   getMessageById(id: string): Locator {
      if (this.scopeOverride) return this.scope.locator(`[role="article"][data-message-id="${id}"]`);
      return this.scope.locator(
         `xpath=.//*[@role="article" and @data-message-id="${id}"`
         + ` and not(ancestor::*[@data-rightbar-id])]`
      );
   }

   getTextMessage (text: string):  Locator { // text | caption | emoji | mention
      return filterElementByOptions(this.data_message, { hasText: text });
   } 

   getLinkMessage (url: string):   Locator {
      return filterElementByOptions(this.data_message, { has: this.page.getByRole('link', { name: url }) });
   }

   getImageMessage(name: string): Locator {
      return filterElementByOptions(this.data_message, { has: getButtonByName(this.page, name) });
   }

   getVideoMessage(): Locator {
      return filterElementByOptions(this.data_message, { has: this.page.locator('video') });
   }

   getFileMessage(name: string): Locator {
      return filterElementByOptions(this.data_message, { has: getButtonByName(this.page, `Download ${name}`, true) });
   }

   getVoiceMessage(): Locator {
      return filterElementByOptions(this.data_message, { has: getButtonByName(this.page, MessageLabels.playAudio, true) });
   }

   getAnimationMessage(name: string): Locator {
      return filterElementByOptions(this.data_message, { has: this.page.locator(`img[alt^="kchat-sticker-${name}"]`) });
   }

   async clickInContextMenu(root: Locator, action: MenuAction): Promise<void> {
      const item = getMenuItemByName(this.page, MENU_LABEL_FOR[action]);
      await runContextMenuAction(this.page, root, item);
   }

   private bubbleGroupOf(root: Locator): Locator {
      return root.locator('xpath=ancestor::*[contains(@class, "group/bubble")][1]').first();
   }

   async openMoreActionsBtnOf(root: Locator): Promise<void> {
      await hover(root);
      await click(getButtonByName(this.bubbleGroupOf(root), MessageLabels.moreActions, true));
   }

   async openMoreActionsOf(root: Locator): Promise<void> {
      await openContextMenuOf(this.page, root);
   }

   async openFastReactionBarOf(root: Locator): Promise<void> {
      await longHover(root);
      await longHover(getButtonByName(this.bubbleGroupOf(root), MessageLabels.addReaction, true));
   }

   async openMoreReactionsOf(root: Locator): Promise<void> {
      await this.openFastReactionBarOf(root);
      await click(getButtonByName(this.page, MessageLabels.moreReactions, true));
   }   
}
