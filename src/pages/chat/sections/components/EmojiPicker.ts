import { Page, Locator } from '@playwright/test';
import { click, press, getButtonByName, longClick, input } from '../../../../utils/actions';
import { EmojiLabels } from '../../../../_generated/chat.element';

export type EmojiObj = { category: string; emojis: string[] };

export type ReactionInfo = {
   emoji: string;
   count: number;
};

export class EmojiPicker  {
   constructor(private readonly page: Page, private readonly scope: Page | Locator) {}

   private get btn_openEmojiPicker(): Locator { return getButtonByName(this.scope, EmojiLabels.open); }

   async openEmojiPicker(): Promise<void> { await longClick(this.btn_openEmojiPicker); }

   async selectEmoji(objs: EmojiObj): Promise<void> {
      await this.openEmojiPicker();
      const emojiDialog = this.page.getByRole('dialog', { name: EmojiLabels.dialog });
      await click(getButtonByName(emojiDialog, objs.category));
      const search = emojiDialog.getByPlaceholder(EmojiLabels.search).first();
      const emojiBtn = getButtonByName(this.page, objs.emojis[0]);
      if (await emojiBtn.isVisible()) {// click emoji right away
         await click(emojiBtn);
         return;
      }
      await click(search);
      await input(search, objs.emojis[0]);
      await press(search, 'Enter');
   }

   async getReactions(messageId: string): Promise<ReactionInfo[]> {
      const buttons = this.btn_openEmojiPicker
         .locator(`[data-message-id="${messageId}"]`)
         .locator('xpath=ancestor::div[contains(@class,"group")]')
         .locator('button[aria-label*="reaction"]');

      const result: ReactionInfo[] = [];

      const total = await buttons.count();

      for (let i = 0; i < total; i++) {
         const label = await buttons.nth(i).getAttribute('aria-label');

         // ❤️ reaction (2)
         const match = label?.match(/^(.+?)\s+reaction\s+\((\d+)\)$/);

         if (match) {
            result.push({
               emoji: match[1],
               count: Number(match[2]),
            });
         }
      }

      return result;
   }
}
/**
const reactions = await getReactions(msgId);
console.log(reactions);
 

async verifyReactionCount(
   messageId: string,
   emoji: string,
   expected: number
): Promise<void> {

   const btn = this.page
      .locator(`[data-message-id="${messageId}"]`)
      .locator(
         `xpath=ancestor::div[contains(@class,"group")]//button[starts-with(@aria-label,"${emoji}")]`
      );

   const label = await btn.getAttribute('aria-label');

   const actual = Number(
      label?.match(/\((\d+)\)/)?.[1] ?? 0
   );

   expect(actual).toBe(expected);
}

await verifyReactionCount(msgId, '❤️', 2);
await verifyReactionCount(msgId, '😂', 5);
await verifyReactionCount(msgId, '👍', 1);


getBubbleByMessageId(messageId: string): Locator {
   return this.page
      .locator(`[data-message-id="${messageId}"][role="article"]`)
      .locator('xpath=ancestor::*[contains(@class,"group")][1]');
}

getAddReactionButton(messageId: string): Locator {
   return this.getBubbleByMessageId(messageId)
      .getByRole('button', { name: 'Add reaction' });
}

getMoreActionsButton(messageId: string): Locator {
   return this.getBubbleByMessageId(messageId)
      .getByRole('button', { name: 'More actions' });
}

await msgId.getBubbleByMessageId(msgId).hover();

await msgId.getAddReactionButton(msgId).click();

await page.pause();

await page.getByRole('button', { name: '👍' }).click();

await page.locator('[aria-label="👍"]').click();
 */