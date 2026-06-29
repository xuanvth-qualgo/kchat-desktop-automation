import { Page, Locator } from '@playwright/test';
import { ChatPage } from '../ChatPage';
import { MessageInput }    from '../sections/components/MessageInput';
import { AttachmentMenu }  from '../sections/components/AttachmentMenu';
import { VoiceRecorder }   from '../sections/components/VoiceRecorder';
import { EmojiPicker, EmojiObj }     from '../sections/components/EmojiPicker';
import { AnimationPicker } from '../sections/components/AnimationPicker';
import { ForwardDialog }   from '../sections/components/ForwardDialog';
import { DeleteAlert }     from '../sections/components/DeleteAlert';
import { MessageLabels, BubbleSelectors } from '../../../_generated/chat.element';
import { hover, click, longHover, getButtonByName } from '../../../utils/actions';

type Scope = Page | Locator;

export class ChatComposers {

   constructor(
      protected readonly chat: ChatPage,
      private readonly scopeOverride?: Scope,
   ) { }

   protected get page(): Page { return this.chat.getPage(); }

   protected get scope(): Scope {
      return (
         this.scopeOverride
         ?? this.chat.getScope()
         ?? this.chat.getPage()
      );
   } 

   /* ---- Message Input ---- */
   async inputMessage(m: string): Promise<void> { await new MessageInput(this.scope).inputMessage(m); }
   async focusMessage():          Promise<void> { await new MessageInput(this.scope).focusMessage();   }
   async unfocusMessage():        Promise<void> { await new MessageInput(this.scope).unfocusMessage(); }
   async clickSend():             Promise<void> { await new MessageInput(this.scope).clickSend();     }
   async typeMessage(m: string): Promise<void> { await new MessageInput(this.scope).typeMessage(m);  }
   async inputValue():            Promise<string> { return new MessageInput(this.scope).inputValue(); }
   async writeLines(lines: string[]): Promise<void> { await new MessageInput(this.scope).writeLines(lines); }
   async hasFailedBubble():           Promise<boolean> { return new MessageInput(this.scope).hasFailedBubble(); }
   async clickRetryOnFailedBubble():  Promise<void>    { return new MessageInput(this.scope).clickRetryOnFailedBubble(); }
   async waitForFailedBubbleGone(t: number): Promise<boolean> { return new MessageInput(this.scope).waitForFailedBubbleGone(t); }
   async retryUntilSent(maxAttempts?: number, perAttemptTimeout?: number): Promise<boolean> { return new MessageInput(this.scope).retryUntilSent(maxAttempts, perAttemptTimeout); }
   async waitForSettled(t?: number):  Promise<boolean> { return new MessageInput(this.scope).waitForSettled(t); }

   /* ---- Attachment Menu: Image, Video, File ---- */
   async openAttachments():               Promise<void> { await new AttachmentMenu(this.page, this.scope).openAttachments();      }
   async attachMedia(filePath: string):   Promise<void> { await new AttachmentMenu(this.page, this.scope).attachMedia(filePath);  }
   async attachFile (filePath: string):   Promise<void> { await new AttachmentMenu(this.page, this.scope).attachFile(filePath);   }

   /* ---- Voice Recorder ---- */
   async openVoiceOption(): Promise<void> { await new VoiceRecorder(this.page, this.scope).openVoiceOption(); }
   async startVoice():      Promise<void> { await new VoiceRecorder(this.page, this.scope).startVoice();      }
   async pauseVoice():      Promise<void> { await new VoiceRecorder(this.page, this.scope).pauseVoice();      }
   async sendVoice():     Promise<void> { await new VoiceRecorder(this.page, this.scope).sendVoice();     }

   /* ---- Emoji Picker ---- */
   async openEmojiPicker(): Promise<void> { await new EmojiPicker(this.page, this.scope).openEmojiPicker(); }
   async selectEmoji(obj: EmojiObj): Promise<void> { await new EmojiPicker(this.page, this.scope).selectEmoji(obj); }
   //async pickEmoji (obj: EmojiObj): Promise<void> { await new EmojiPicker(this.page, this.scope).openEmojiPicker(); await new EmojiPicker(this.page, this.scope).selectEmoji(obj.category, obj.emojis[0]);}

   /* ---- Animation Picker: Gif, Sticker ---- */
   async sendGif    (name: string): Promise<void> { await new AnimationPicker(this.page, this.scope).sendGif(name);     }
   async sendSticker(name: string): Promise<void> { await new AnimationPicker(this.page, this.scope).sendSticker(name); }
   /* ---- Forward Dialog ---- */
   async forwardTo    (name: string, parent?: string): Promise<void> { await new ForwardDialog(this.page).forwardTo(name, parent); }

   /* ---- Delete Confirmation Alert ---- */
   async confirmDelete(): Promise<void> { await new DeleteAlert(this.page).confirm(); }
   async cancelDelete():  Promise<void> { await new DeleteAlert(this.page).cancel();  }


   private bubbleGroupOf(root: Locator): Locator {
      return root.locator(BubbleSelectors.bubbleGroup).first();
   }

   async opeActionsMenuBtnOf(root: Locator): Promise<void> {
      await hover(root);
      await click(getButtonByName(this.bubbleGroupOf(root), MessageLabels.moreActions, true));
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