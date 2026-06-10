import { Page } from '@playwright/test';
import { allure } from 'allure-playwright';

export async function attachScreenshot(page: Page, name: string): Promise<void> {
   const buf = await page.screenshot();
   await allure.attachment(name, buf, 'image/png');
}