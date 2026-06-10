import { Locator } from '@playwright/test';
import path from 'path';
import { stubFileDialog } from '../../../core/fixtures';
import { click, getButtonByName, getMenuItemByName } from '../../../core/utils/actions';
import { AttachmentLabels } from '../labels';
import { ComposerScope } from './ComposerScope';

export class AttachmentMenu extends ComposerScope {
   private get btn_openAttachments(): Locator { return getButtonByName  (this.scope, AttachmentLabels.open);         }
   private get btn_mediaOption():     Locator { return getMenuItemByName(this.scope, AttachmentLabels.photosVideos); }
   private get btn_fileOption():      Locator { return getMenuItemByName(this.scope, AttachmentLabels.allFiles);     }

   async openAttachments(): Promise<void> { await click(this.btn_openAttachments); }

   private async pickFile(menuItem: Locator, filePath: string): Promise<void> {
      if (!this.app) throw new Error('AttachmentMenu.pickFile requires an ElectronApplication');
      const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
      await stubFileDialog(this.app, absPath);
      await this.openAttachments();
      await click(menuItem);
      await menuItem.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { /* best effort */ });
   }

   async attachMedia(filePath: string): Promise<void> { await this.pickFile(this.btn_mediaOption, filePath); }
   async attachFile (filePath: string): Promise<void> { await this.pickFile(this.btn_fileOption,  filePath); }

}