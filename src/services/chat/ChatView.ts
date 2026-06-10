import { expect, Page } from '@playwright/test';
import { ChatPage } from '../../pages/chat/ChatPage';
import { MessageType, MessageVerifier } from './types';
import { handlerFor } from './ChatTypeHandlers';
import { assertToBeVisible } from '../../core/utils/actions';

const IMAGE_EXT = new Set([
   'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'heic', 'heif', 'ico', 'tiff', 'tif', 'avif', 'svg',
]);
const VIDEO_EXT = new Set([
   'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'mpg', 'mpeg', 'm4v', '3gp',
]);

const LINK_TLDS = new Set([
   'com', 'net', 'org', 'io', 'co', 'dev', 'app', 'vn', 'edu', 'gov', 'info', 'me', 'xyz', 'ai',
]);
const URL_PREFIX_RE = /^(https?:\/\/|www\.)/i;

export function detectMessageType(expected?: string): MessageType {
   if (!expected) return 'voice';
   const m = expected.match(/\.([a-zA-Z0-9]+)$/);
   if (!m || /\s/.test(expected)) return 'text';
   if (/@\S/.test(expected)) return 'mention';
   const ext = m[1].toLowerCase();
   if (URL_PREFIX_RE.test(expected) || LINK_TLDS.has(ext)) return 'link';
   if (IMAGE_EXT.has(ext)) return 'image';
   if (VIDEO_EXT.has(ext)) return 'video';
   return 'file';
}

export class ChatView implements MessageVerifier {
   constructor(private readonly chatPage: ChatPage) {}

   private get page(): Page { return this.chatPage.page; }

   private async messages() {
      return (await this.chatPage.thread.isOpen())
         ? this.chatPage.thread.messages
         : this.chatPage.messages;
   }

   async verifyLastText(message: string, timeout?: number): Promise<void> { // text | caption | emoji | mention
      await assertToBeVisible((await this.messages()).getTextMessage(message).last(), timeout);
   }

   async verifyLastLink(url: string, timeout?: number): Promise<void> {
      await assertToBeVisible((await this.messages()).getLinkMessage(url).last(), timeout);
   }

   async verifyLastImage(name: string, timeout?: number): Promise<void> {
      await assertToBeVisible((await this.messages()).getImageMessage(name).last(), timeout);
   }

   async verifyLastVideo(timeout?: number): Promise<void> {
      await assertToBeVisible((await this.messages()).getVideoMessage().last(), timeout);
   }

   async verifyLastFile(filename: string, timeout?: number): Promise<void> {
      await assertToBeVisible((await this.messages()).getFileMessage(filename).last(), timeout);
   }

   async verifyLastVoice(timeout?: number): Promise<void> {
      await assertToBeVisible((await this.messages()).getVoiceMessage().last(), timeout);
   }

   async verifyLastAnimation(name: string, timeout?: number): Promise<void> { // gif | sticker
      await assertToBeVisible((await this.messages()).getAnimationMessage(name).last(), timeout);
   }

   async verifyReplyPreview(rootText?: string, timeout: number = 5_000): Promise<void> {
      await expect.poll(
         async () => this.page.getByText(rootText!).count(),
         {
            timeout,
            message: `expected root text "${rootText}" to appear in bubble + reply preview`,
         },
      ).toBeGreaterThanOrEqual(2);
   }

   async verifyLastMessage(
      expected?: string,
      type?: MessageType,
      quoteOf?: string,
      timeout?: number,
   ): Promise<void> {
      const total    = timeout ?? 15_000;
      const stepTo   = 1_500;
      const deadline = Date.now() + total;
      await this.withDecryptFallback(expected, async () => {
         let lastErr: unknown;
         while (Date.now() < deadline) {
            await this.chatPage.scrollToBottom();
            try {
               if (quoteOf && expected) {
                  await this.assertQuotePresent(expected, stepTo);
               }
               await this.dispatchVerifyByType(expected, type, stepTo);
               return;
            } catch (err) {
               lastErr = err;
            }
         }
         throw lastErr ?? new Error('verifyLastMessage: timed out');
      });
   }

   private async assertQuotePresent(expected: string, timeout?: number): Promise<void> {
      await expect.poll(
         async () => this.page.getByText(expected).count(),
         {
            timeout,
            message: `expected "${expected}" in both the original bubble and the reply quote`,
         },
      ).toBeGreaterThanOrEqual(2);
   }

   private async dispatchVerifyByType(
      expected: string | undefined,
      type: MessageType | undefined,
      timeout?: number,
   ): Promise<void> {
      await handlerFor(type ?? detectMessageType(expected)).verify(this, expected, timeout);
   }

   private async withDecryptFallback(
      expected: string | undefined,
      run: () => Promise<void>,
   ): Promise<void> {
      try {
         await run();
      } catch (err) {
         const placeholder = this.page.getByText(/This message can'?t be displayed/i).last();
         if (await placeholder.isVisible().catch(() => false)) {
            throw new Error(
               `MSG_DECRYPT_FAIL: receiver could not decrypt (expected: ${JSON.stringify(expected)})`,
            );
         }
         throw err;
      }
   }

   async verifyMessageById(id: string, timeout?: number): Promise<void> {
      await assertToBeVisible((await this.messages()).getMessageById(id), timeout);
   }

   async verifyReactionOnMessage(id: string, emoji: string, timeout: number = 20_000): Promise<void> {
      const messages = await this.messages();
      const bubble   = messages.getMessageById(id).first();
      const wrapper  = bubble
         .locator('xpath=ancestor::*[contains(@class, "group/bubble")][1]')
         .first();
      await assertToBeVisible(wrapper.getByText(emoji, { exact: false }).first(), timeout);
   }

   async takeScreenShot(actionName: string, opts?: { waitMs?: number }): Promise<void> {
      if (opts?.waitMs) await this.page.waitForTimeout(opts.waitMs);
      await this.page.screenshot({ path: `./screenshots/${actionName}-${Date.now()}.png` });
   }
}
