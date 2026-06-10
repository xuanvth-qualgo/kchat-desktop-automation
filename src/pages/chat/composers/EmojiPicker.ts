import { Locator } from '@playwright/test';
import { getButtonByName, longClick } from '../../../core/utils/actions';
import { EmojiLabels } from '../labels';
import { ComposerScope } from './ComposerScope';

export class EmojiPicker extends ComposerScope {
   private get btn_openEmojiPicker(): Locator { return getButtonByName(this.scope, EmojiLabels.open); }

   async openEmojiPicker(): Promise<void> { await longClick(this.btn_openEmojiPicker); }
}
