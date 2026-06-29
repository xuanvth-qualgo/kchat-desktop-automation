import { Page, Locator } from '@playwright/test';
import path from 'path';
import { click, getButtonByName, getMenuItemByName } from '../../../../utils/actions';
import { AttachmentLabels } from '../../../../_generated/chat.element';

export class AttachmentMenu {
   constructor(private readonly page: Page, private readonly scope: Page | Locator) {}

   private get btn_openAttachments(): Locator { return getButtonByName  (this.scope, AttachmentLabels.open);         }
   private get btn_mediaOption():     Locator { return getMenuItemByName(this.scope, AttachmentLabels.photosVideos); }
   private get btn_fileOption():      Locator { return getMenuItemByName(this.scope, AttachmentLabels.files);     }

   async openAttachments(): Promise<void> { await click(this.btn_openAttachments); }

   private async pickFile(menuItem: Locator, filePath: string): Promise<void> {
      const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

      await this.openAttachments();

      const [chooser] = await Promise.all([
         this.page.waitForEvent('filechooser', { timeout: 10_000 }),
         menuItem.click(),
      ]);
      await chooser.setFiles(absPath);

      await menuItem.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { });
   }

   async attachMedia(filePath: string): Promise<void> { await this.pickFile(this.btn_mediaOption, filePath); }
   async attachFile (filePath: string): Promise<void> { await this.pickFile(this.btn_fileOption,  filePath); }

}