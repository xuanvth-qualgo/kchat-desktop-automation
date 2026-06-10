import { Locator } from '@playwright/test';
import { click, getButtonByName, getTabByName, getTextboxByName, longClick } from '../../../core/utils/actions';
import { AnimationLabels } from '../labels';
import { ComposerScope } from './ComposerScope';

type AnimationTab = typeof AnimationLabels.tabGifs | typeof AnimationLabels.tabStickers;

export class AnimationPicker extends ComposerScope {
   private get btn_openAnimationPicker(): Locator { return getButtonByName(this.scope, AnimationLabels.open); }

   async openAnimationPicker(): Promise<void> { await longClick(this.btn_openAnimationPicker); }

   private async selectAnimation(tab: AnimationTab, name: string): Promise<void> {
      await this.openAnimationPicker();
      await click(
         getTabByName(this.page, tab).or(getButtonByName(this.page, tab)).first(),
      );
      const search = getTextboxByName(this.page, AnimationLabels.search).first();
      if (await search.count() > 0) await search.fill(name);
      const item = getButtonByName(this.page, name).first()
         .or(this.page.locator(`img[alt*="kchat-sticker-${name}"]`).first());
      await click(item.first());
   }

   async selectGif    (name: string): Promise<void> { await this.selectAnimation(AnimationLabels.tabGifs,     name); }
   async selectSticker(name: string): Promise<void> { await this.selectAnimation(AnimationLabels.tabStickers, name); }
}
