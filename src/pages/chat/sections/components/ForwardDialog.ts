import { Locator, Page } from '@playwright/test';
import { DialogSelectors, ForwardDialogLabels } from '../../../../_generated/chat.element';

export class ForwardDialog {
   constructor(private readonly page: Page) {}

   private root(): Locator {
      return this.page.locator(DialogSelectors.any).last();
   }

   async waitOpen(timeout: number = 5_000): Promise<void> {
      await this.root().waitFor({ state: 'visible', timeout });
   }

   async waitClosed(timeout: number = 5_000): Promise<void> {
      await this.root().waitFor({ state: 'hidden', timeout });
   }

   search(query: string): Promise<void> {
      return this.root().getByPlaceholder(ForwardDialogLabels.search).fill(query);
   }

   private async expandCommunity(name: string): Promise<void> {
      const group = this.root().locator(`[aria-label="${ForwardDialogLabels.communityPrefix} ${name}"]`);
      if (await group.count()) await group.click().catch(() => {});
   }

   async selectTarget(name: string, parent?: string): Promise<void> {
      if (parent) await this.expandCommunity(parent);
      await this.root().locator(`[aria-label="${ForwardDialogLabels.targetPrefix} ${name}"]`).click();
   }

   async confirm(): Promise<void> {
      await this.root().getByRole('button', { name: ForwardDialogLabels.confirm, exact: true }).click();
   }

   async cancel(): Promise<void> {
      await this.root().getByRole('button', { name: ForwardDialogLabels.cancel, exact: true }).click();
      await this.waitClosed();
   }

   async forwardTo(name: string, parent?: string): Promise<void> {
      await this.waitOpen();
      await this.selectTarget(name, parent);
      await this.confirm();
      await this.waitClosed();
   }
}