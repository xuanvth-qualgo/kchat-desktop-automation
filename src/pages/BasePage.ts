import { Page, ElectronApplication, Locator } from '@playwright/test';

export abstract class BasePage {
   constructor(
      protected readonly page: Page,
      protected readonly app?: ElectronApplication,
      protected readonly scope?: Page | Locator,
   ) {}

   public getPage(): Page {
      return this.page;
   }

   public getApp(): ElectronApplication | undefined {
      return this.app;
   }

   public getScope(): Page | Locator | undefined {
      return this.scope;
   }
}