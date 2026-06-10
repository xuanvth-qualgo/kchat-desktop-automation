import { Locator, Page } from '@playwright/test';
import { ChatPage } from '../../pages/chat/ChatPage';
import { ChatView } from './ChatView';
import { handlerFor } from './ChatTypeHandlers';
import { ChatAction, EmojiObj, MenuAction, MessageActions, MessageTarget } from './types';
import { click, getButtonByName } from '../../core/utils/actions';

async function pickEmojiInFastBar(page: Page, emoji: EmojiObj): Promise<void> {
   const popover = page.locator(
      '[data-radix-popper-content-wrapper], [role="menu"], [role="dialog"]',
   ).last();
   const target = popover.getByText(emoji.emojis[0]).first();
   await target.hover();
   await target.click();
}

async function pickEmojiInFullPicker(page: Page, emoji: EmojiObj): Promise<void> {
   if (emoji.category) {
      await click(getButtonByName(page, emoji.category));
   }
   await click(getButtonByName(page, emoji.emojis[0]));
}

const MENU_SIDE_EFFECTS: Partial<Record<MenuAction, (view: ChatView, target: MessageTarget) => Promise<void>>> = {
   reply: async (view, target) => {
      if (target.type === 'text' || target.type === 'caption' || target.type === 'emoji') {
         await view.verifyReplyPreview(target.value);
      }
   },
};

function requireEmoji(action: ChatAction, opts?: { emoji?: EmojiObj }): EmojiObj {
   if (!opts?.emoji) throw new Error(`ChatMoreActions.do('${action}', …) requires opts.emoji`);
   return opts.emoji;
}

export class ChatMoreActions implements MessageActions {
   constructor(private readonly chat: ChatPage, private readonly view: ChatView) {}

   async do(action: ChatAction, target: MessageTarget, opts?: { emoji?: EmojiObj }): Promise<void> {
      const messages = await this.messagesScope();
      const root     = this.rootOf(messages, target);

      if (action === 'reactFast' || action === 'reactMore') {
         const emoji = requireEmoji(action, opts);
         if (action === 'reactFast') {
            await messages.openFastReactionBarOf(root);
            await pickEmojiInFastBar(this.chat.page, emoji);
         } else {
            await messages.openMoreReactionsOf(root);
            await pickEmojiInFullPicker(this.chat.page, emoji);
         }
         await this.chat.composers.focusMessage();
         return;
      }

      await messages.clickInContextMenu(root, action);
      await MENU_SIDE_EFFECTS[action]?.(this.view, target);
   }

   async reactMany(target: MessageTarget, emojis: readonly EmojiObj[], mode: 'fast' | 'more' = 'fast'): Promise<void> {
      const action: ChatAction = mode === 'fast' ? 'reactFast' : 'reactMore';
      for (const emoji of emojis) await this.do(action, target, { emoji });
   }

   private async messagesScope() {
      return (await this.chat.thread.isOpen())
         ? this.chat.thread.messages
         : this.chat.messages;
   }

   private rootOf(messages: typeof this.chat.messages, t: MessageTarget): Locator {
      if (t.id) return messages.getMessageById(t.id).last();
      return handlerFor(t.type).locator(messages, t.value);
   }
}
