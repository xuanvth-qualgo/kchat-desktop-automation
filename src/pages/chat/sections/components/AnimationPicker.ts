import { Page, Locator } from '@playwright/test';
import { click, getButtonByName, getTabByName, getTextboxByName, longClick } from '../../../../utils/actions';
import { AnimationLabels } from '../../../../_generated/chat.element';

type AnimationTab = typeof AnimationLabels.tabGifs | typeof AnimationLabels.tabStickers;

export class AnimationPicker {
   constructor(private readonly page: Page, private readonly scope: Page | Locator) {}

   private get btn_openAnimationPicker(): Locator { return getButtonByName(this.scope, AnimationLabels.open); }

   async openAnimationPicker(): Promise<void> { await longClick(this.btn_openAnimationPicker); }

   private async sendAnimation(tab: AnimationTab, name: string): Promise<void> {
      await this.openAnimationPicker();
      await click(
         getTabByName(this.page, tab).or(getButtonByName(this.page, tab)).first(),
      );
      const searchLabel = tab === AnimationLabels.tabGifs
         ? AnimationLabels.searchGifs
         : AnimationLabels.searchStickers;
      const search = getTextboxByName(this.page, searchLabel).first();
      if (await search.count() > 0) await search.fill(name);
      const item = getButtonByName(this.page, name).first()
         .or(this.page.locator(`img[alt*="kchat-sticker-${name}"]`).first());
      await click(item.first());
   }  

   async sendGif    (name: string): Promise<void> { await this.sendAnimation(AnimationLabels.tabGifs,     name); }
   async sendSticker(name: string): Promise<void> { await this.sendAnimation(AnimationLabels.tabStickers, name); }
}
