import { Locator, Page } from '@playwright/test';
import { DeleteAlertLabels, DialogSelectors } from '../../../../_generated/chat.element';

export class DeleteAlert {
   constructor(private readonly page: Page) {}

   private root(): Locator {
      return this.page.locator(DialogSelectors.alertContent).last();
   }

   async waitOpen(timeout: number = 5_000): Promise<void> {
      await this.root().waitFor({ state: 'visible', timeout });
   }

   async waitClosed(timeout: number = 5_000): Promise<void> {
      await this.root().waitFor({ state: 'hidden', timeout });
   }

   async confirm(): Promise<void> {
      await this.waitOpen();
      await this.root().getByRole('button', { name: DeleteAlertLabels.confirm, exact: true }).click();
      await this.waitClosed();
   }

   async cancel(): Promise<void> {
      await this.waitOpen();
      await this.root().getByRole('button', { name: DeleteAlertLabels.cancel, exact: true }).click();
      await this.waitClosed();
   }
}
