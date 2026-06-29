import { Page, Locator } from '@playwright/test';
import { ChatPage } from '../ChatPage';
import { BubbleLabels, BubbleSelectors, MessageLabels } from '../../../_generated/chat.element';
import { 
   getButtonByName, 
   filterElementByOptions,
} from '../../../utils/actions';

type Scope = Page | Locator;

export class ChatMessages {
   constructor(
      protected readonly chat: ChatPage,
      private readonly scopeOverride?: Scope,
   ) {}

   protected get page(): Page { return this.chat.getPage(); }

   protected get scope(): Scope {
      return (
         this.scopeOverride
         ?? this.chat.getScope()
         ?? this.chat.getPage()
      );
   }

   get MsgContainer(): Locator {
      return this.scope.locator(BubbleSelectors.msgContainer);
   }

   get data_message(): Locator {
      if (this.scopeOverride) return this.scope.locator(BubbleSelectors.article);
      return this.scope.locator(BubbleSelectors.articleNoRightbar);
   }

   getMessageById(id: string): Locator {
      if (this.scopeOverride) return this.scope.locator(BubbleSelectors.articleById(id));
      return this.scope.locator(BubbleSelectors.articleByIdXpath(id));
   }

   getTextMessage (text: string):  Locator { // text | caption | emoji | mention
      return filterElementByOptions(this.data_message, { hasText: text });
   } 

   getLinkMessage (url: string):   Locator {
      return filterElementByOptions(this.data_message, { has: this.page.getByRole('link', { name: url }) });
   }

   getMediaMessage(name: string): Locator {
      return filterElementByOptions(this.data_message, { has: getButtonByName(this.page, name) });
   }

   getFileMessage(name: string): Locator {
      return filterElementByOptions(this.data_message, { has: getButtonByName(this.page, `${MessageLabels.downloadPrefix} ${name}`, true) });
   }

   getVoiceMessage(): Locator {
      return filterElementByOptions(this.data_message, { has: getButtonByName(this.page, MessageLabels.playAudio, true) });
   }

   getAnimationMessage(): Locator {
      return filterElementByOptions(this.data_message.locator(BubbleSelectors.stickerImg), { visible: true });
   }

   async getLastMessageId(value?: string, timeout?: number): Promise<string> {
      const last = value 
         ? this.data_message.filter({ hasText: value }).last()
         : this.data_message.last();
      await last.waitFor({ state: 'visible', timeout });
      const id = await last.getAttribute('data-message-id');
      if (!id) throw new Error('getLastMessageId: data-message-id missing on last bubble');
      return id;
   }

   async getAllMessages(): Promise<{id: string; text: string}[]> {
      return this.data_message.evaluateAll(elements =>
         elements.map(el => ({
               id: el.getAttribute('data-message-id') ?? '',
               text: el.textContent?.trim() ?? ''
         }))
      );
   }

   getClusterOf(id: string): Locator {
      return this.getMessageById(id).locator(BubbleSelectors.clusterAncestor).first();
   }

   getReplyCountButton(id: string): Locator {
      return this.getClusterOf(id).getByRole('button', { name: BubbleLabels.viewRepliesRe });
   }

   getReplyPreview(id: string): Locator {
      return this.getMessageById(id).locator(BubbleSelectors.replyPreview);
   }

   getReactionBadge(id: string, emoji: string): Locator {
      return this.getClusterOf(id).locator(`[aria-label^="${emoji} ${BubbleLabels.reactionSuffix} ("]`);
   }
}
