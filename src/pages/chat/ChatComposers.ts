import { Locator, Page } from '@playwright/test';
import { ChatPage } from './ChatPage';
import { MessageInput }     from './composers/MessageInput';
import { AttachmentMenu }   from './composers/AttachmentMenu';
import { VoiceRecorder }    from './composers/VoiceRecorder';
import { EmojiPicker }      from './composers/EmojiPicker';
import { AnimationPicker } from './composers/AnimationPicker';

export class ChatComposers {
   private readonly message:     MessageInput;
   private readonly attachments: AttachmentMenu;
   private readonly voice:       VoiceRecorder;
   private readonly emoji:       EmojiPicker;
   private readonly picker:      AnimationPicker;

   constructor(chat: ChatPage, scopeOverride?: Page | Locator) {
      this.message     = new MessageInput    (chat, scopeOverride);
      this.attachments = new AttachmentMenu  (chat, scopeOverride);
      this.voice       = new VoiceRecorder   (chat, scopeOverride);
      this.emoji       = new EmojiPicker     (chat, scopeOverride);
      this.picker      = new AnimationPicker(chat, scopeOverride);
   }

   /* ---- Message Input ---- */
   async inputMessage(m: string): Promise<void> { await this.message.inputMessage(m); }
   async focusMessage():          Promise<void> { await this.message.focusMessage();  }
   async clickSend():             Promise<void> { await this.message.clickSend();     }
   async typeMessage(m: string): Promise<void> { await this.message.typeMessage(m);  }
   async inputValue():            Promise<string> { return this.message.inputValue(); }
   async writeLines(lines: string[]): Promise<void> { await this.message.writeLines(lines); }
   async hasFailedBubble():           Promise<boolean> { return this.message.hasFailedBubble(); }
   async clickRetryOnFailedBubble():  Promise<void>    { return this.message.clickRetryOnFailedBubble(); }
   async waitForFailedBubbleGone(t: number): Promise<boolean> { return this.message.waitForFailedBubbleGone(t); }
   async waitForSettled(t?: number):  Promise<boolean> { return this.message.waitForSettled(t); }

   /* ---- Attachment Menu: Image, Video, File ---- */
   async openAttachments():               Promise<void> { await this.attachments.openAttachments();      }
   async attachMedia(filePath: string):   Promise<void> { await this.attachments.attachMedia(filePath);  }
   async attachFile (filePath: string):   Promise<void> { await this.attachments.attachFile(filePath);   }

   /* ---- Voice Recorder ---- */
   async openVoiceOption(): Promise<void> { await this.voice.openVoiceOption(); }
   async startVoice():      Promise<void> { await this.voice.startVoice();      }
   async pauseVoice():      Promise<void> { await this.voice.pauseVoice();      }
   async submitVoice():     Promise<void> { await this.voice.submitVoice();     }

   /* ---- Emoji Picker ---- */
   async openEmojiPicker(): Promise<void> { await this.emoji.openEmojiPicker(); }

   /* ---- Animation Picker: Gif, Sticker ---- */
   async selectGif    (name: string): Promise<void> { await this.picker.selectGif(name);     }
   async selectSticker(name: string): Promise<void> { await this.picker.selectSticker(name); }
}