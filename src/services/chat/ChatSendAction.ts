import { expect, Page } from '@playwright/test';
import { ChatPage } from '../../pages/chat/ChatPage';
import { log } from '../../core/log';
import { click, getButtonByName, waitForVisible } from '../../core/utils/actions';
import { EmojiObj, MessageSender } from './types';

export class ChatSendAction implements MessageSender {
   constructor(private readonly chatPage: ChatPage) {}

   private get page(): Page { return this.chatPage.page; }

   private async composers() {
      return (await this.chatPage.thread.isOpen())
         ? this.chatPage.thread.composers
         : this.chatPage.composers;
   }

   private async commit(opts: { inputTimeoutMs?: number; maxRetries?: number } = {}): Promise<void> {
      const composers     = await this.composers();
      const inputDeadline = Date.now() + (opts.inputTimeoutMs ?? 6_000);
      const maxRetries    = opts.maxRetries ?? 3;

      await composers.clickSend();

      let retries = 0;
      while (true) {
         const value = await composers.inputValue();
         if (value && value.trim() !== '') {
            if (Date.now() > inputDeadline) {
               throw new Error('[commitSend] input never cleared — Send button did not register.');
            }
            await composers.clickSend();
            await expect.poll(() => composers.inputValue(), {
               timeout: 500, intervals: [50, 100, 150],
            }).toBe('').catch(() => { /* loop will re-check */ });
            continue;
         }
         if (!(await composers.hasFailedBubble())) {
            await composers.waitForSettled(15_000);
            if (retries > 0) log.info(`[commitSend] recovered after ${retries} Retry click(s)`);
            return;
         }
         if (retries >= maxRetries) {
            throw new Error(`[commitSend] gave up after ${retries} Retry click(s) — failed bubble still present.`);
         }
         retries++;
         log.info(`[commitSend] failed bubble detected — clicking "Retry" (attempt ${retries}/${maxRetries})`);
         await composers.clickRetryOnFailedBubble();
         await composers.waitForFailedBubbleGone(1_000);
      }
   }

   private async pickEmoji(obj: EmojiObj): Promise<void> {
      if (!obj.category) throw new Error('sendEmoji requires obj.category');
      const categoryBtn = getButtonByName(this.page, obj.category);
      const emojiBtn    = getButtonByName(this.page, obj.emojis[0]);

      await (await this.composers()).openEmojiPicker();
      try {
         await waitForVisible(categoryBtn);
      } catch (err) {
         const dump = await this.page.evaluate(() => {
            const roots = Array.from(document.querySelectorAll(
               '[data-radix-popper-content-wrapper], [role="dialog"], [role="menu"], [role="tablist"], [class*="emoji"]',
            ));
            return roots.map(r => (r as HTMLElement).outerHTML.slice(0, 3000));
         }).catch(() => ['<eval-failed>']);
         log.error('[pickEmoji] picker not found. DOM dump (truncated):\n' + dump.join('\n---\n'));
         throw err;
      }
      await click(categoryBtn);
      await click(emojiBtn);
   }

   /* ---- text / mention ---- */
   async sendText(text: string): Promise<void> { // text | caption | emoji | link
      await (await this.composers()).inputMessage(text);
      await this.commit();
   }
   async sendTexts(texts: string[]): Promise<void> {
      for (const text of texts) await this.sendText(text);
   }
   async sendMultilineText(lines: string[]): Promise<void> {
      await (await this.composers()).writeLines(lines);
      await this.commit();
   }
   async selectMention(text: string): Promise<void> {
      await (await this.composers()).typeMessage(text);
      await this.commit();
   }
   async selectMentions(texts: string[]): Promise<void> {
      for (const text of texts) await this.selectMention(text);
   }
   async selectMultilineMention(lines: string[]): Promise<void> {
      await (await this.composers()).writeLines(lines);
      await this.commit();
   }

   /* ---- emoji ---- */
   async sendEmoji(obj: EmojiObj): Promise<void> {
      await this.pickEmoji(obj);
      await this.commit();
   }
   async sendEmojis(objs: EmojiObj[]): Promise<void> {
      for (const obj of objs) {
         for (const emoji of obj.emojis) {
            await this.sendEmoji({ category: obj.category, emojis: [emoji] });
         }
      }
   }
   async sendEmojisInOneTime(objs: EmojiObj[]): Promise<void> {
      for (const obj of objs) {
         for (const emoji of obj.emojis) {
            await this.pickEmoji({ category: obj.category, emojis: [emoji] });
         }
      }
      await this.commit();
   }

   /* ---- media (image / video) ---- */
   async attachMedia(path: string, caption?: string): Promise<void> {
      if (caption) await (await this.composers()).inputMessage(caption);
      await (await this.composers()).attachMedia(path);
   }
   async sendMedia(path: string, caption?: string): Promise<void> {
      await this.attachMedia(path, caption);
      await this.commit();
   }
   async sendMedias(paths: string[], captions?: string[]): Promise<void> { // N rounds
      for (let i = 0; i < paths.length; i++) await this.sendMedia(paths[i], captions?.[i]);
   }
   async sendMediasInOneTime(paths: string[], caption?: string): Promise<void> { // 1 round
      if (caption) await (await this.composers()).inputMessage(caption);
      for (const path of paths) await (await this.composers()).attachMedia(path);
      await this.commit();
   }

   /* ---- file ---- */
   async attachFile(path: string, caption?: string): Promise<void> {
      if (caption) await (await this.composers()).inputMessage(caption);
      await (await this.composers()).attachFile(path);
   }
   async sendFile(path: string, caption?: string): Promise<void> {
      await this.attachFile(path, caption);
      await this.commit();
   }
   async sendFiles(paths: string[], captions?: string[]): Promise<void> { // N rounds
      for (let i = 0; i < paths.length; i++) await this.sendFile(paths[i], captions?.[i]);
   }
   async sendFilesInOneTime(paths: string[], caption?: string): Promise<void> { // 1 round
      for (const path of paths) await (await this.composers()).attachFile(path);
      if (caption) await (await this.composers()).inputMessage(caption);
      await this.commit();
   }

   /* ---- voice ---- */
   async attachVoice(duration: number, caption?: string): Promise<void> {
      await (await this.composers()).openVoiceOption();
      await (await this.composers()).startVoice();
      await this.page.waitForTimeout(duration);
      await (await this.composers()).pauseVoice();
      await (await this.composers()).submitVoice();
      if (caption) await (await this.composers()).inputMessage(caption);
   }
   async sendVoice(duration: number, caption?: string): Promise<void> {
      await this.attachVoice(duration, caption);
      await this.commit();
   }
   async sendVoices(durations: number[], captions?: string[]): Promise<void> { // N rounds
      for (let i = 0; i < durations.length; i++) {
         await this.attachVoice(durations[i], captions?.[i]);
         await this.commit();
      }
   }
   async sendVoicesInOneTime(durations: number[], caption?: string): Promise<void> { // 1 round
      for (const duration of durations) await this.attachVoice(duration);
      if (caption) await (await this.composers()).inputMessage(caption);
      await this.commit();
   }

   /* ---- gif / sticker (no commit — picker self-commits) ---- */
   async sendGif(name: string): Promise<void> {
      await (await this.composers()).selectGif(name);
   }
   async sendGifs(names: string[]): Promise<void> {
      for (const name of names) await this.sendGif(name);
   }
   async sendSticker(name: string): Promise<void> {
      await (await this.composers()).selectSticker(name);
   }
   async sendStickers(names: string[]): Promise<void> {
      for (const name of names) await this.sendSticker(name);
   }
}
