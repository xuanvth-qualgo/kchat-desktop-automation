import { Page, Locator } from '@playwright/test';
import { click, getButtonByName, getTextboxByName, input } from '../../../../utils/actions';
import { ComposerLabels, MentionSelectors } from '../../../../_generated/chat.element';


export class MessageInput {
   constructor(private readonly scope: Page | Locator) {}
   
   private get ip_message():      Locator { return getTextboxByName(this.scope, ComposerLabels.messageInput).first(); }
   private get btn_sendMessage(): Locator { return getButtonByName (this.scope, ComposerLabels.sendMessage).first();  }

   async inputMessage(message: string): Promise<void> { await input(this.ip_message, message); }
   async focusMessage():   Promise<void> { await click(this.ip_message); }
   async unfocusMessage(): Promise<void> {
      await this.ip_message.evaluate((el: HTMLElement) => el.blur()).catch(() => { /* not focused / detached */ });
   }

   async clickSend(): Promise<void> { await click(this.btn_sendMessage); }

   async inputValue(): Promise<string> {
      return await this.ip_message.inputValue().catch(() => '');
   }

   async isSendDisabled(): Promise<boolean> {
      return await this.btn_sendMessage.isDisabled().catch(() => false);
   }

   async waitForSettled(timeoutMs: number = 15_000): Promise<boolean> {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
         if (await this.isSendDisabled()) return true;
         await this.ip_message.page().waitForTimeout(150);
      }
      return await this.isSendDisabled();
   }

   async typeMessage(text: string): Promise<void> {
      await click(this.ip_message);
      await this.ip_message.clear();
      await this.appendWithMentions(text);
   }

   private async appendWithMentions(text: string): Promise<void> {
      const re = /@[\w.\-]+/g;
      const page = this.ip_message.page();
      let cursor = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
         if (m.index > cursor) {
            await page.keyboard.type(text.slice(cursor, m.index), { delay: 20 });
         }
         await page.keyboard.type(m[0], { delay: 80 });
         const option = page
            .locator(MentionSelectors.option)
            .filter({ hasText: m[0] })
            .first();
         await option.waitFor({ state: 'visible', timeout: 5_000 });
         await option.click();
         cursor = m.index + m[0].length;
      }
      if (cursor < text.length) {
         await page.keyboard.type(text.slice(cursor), { delay: 20 });
      }
   }

   async writeLines(lines: string[]): Promise<void> {
      await input(this.ip_message, '');
      await click(this.ip_message);
      for (let i = 0; i < lines.length; i++) {
         if (lines[i]) await this.appendWithMentions(lines[i]);
         if (i < lines.length - 1) await this.ip_message.press('Shift+Enter');
      }
   }

   private retryButton(): Locator {
      return this.scope.getByRole('button', { name: ComposerLabels.retryRe });
   }

   async hasFailedBubble(): Promise<boolean> {
      return (await this.retryButton().count().catch(() => 0)) > 0;
   }

   async clickRetryOnFailedBubble(): Promise<void> {
      await click(this.retryButton().last());
   }

   async waitForFailedBubbleGone(timeout: number): Promise<boolean> {
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
         if (!(await this.hasFailedBubble())) return true;
         await this.retryButton().last().waitFor({ state: 'detached', timeout: 200 }).catch(() => {});
      }
      return !(await this.hasFailedBubble());
   }

   async retryUntilSent(maxAttempts: number = 5, perAttemptTimeout: number = 5_000): Promise<boolean> {
      for (let i = 0; i < maxAttempts; i++) {
         if (!(await this.hasFailedBubble())) return true;
         await this.clickRetryOnFailedBubble();
         if (await this.waitForFailedBubbleGone(perAttemptTimeout)) return true;
      }
      return !(await this.hasFailedBubble());
   }
}
