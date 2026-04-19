import { test, expect } from '@playwright/test';
import { ElectronApplication, Page, Locator } from 'playwright';
import { startSharedApp, stopSharedApp } from '../helpers/shared-electron.ts';
import fs from 'fs';
import path from 'path';

let app!: ElectronApplication;
let win!: Page;

test.describe.configure({ mode: 'serial' });
test.setTimeout(60000);

test.beforeAll(async () => {
  ({ app, page: win } = await startSharedApp());
});

test.afterAll(async () => {
  await stopSharedApp();
});

async function findInputLocator(win: Page): Promise<Locator | null> {
  const candidateSelectors = [
    () => win.getByRole('textbox'),
    () => win.locator('div[contenteditable="true"]'),
    () => win.locator('textarea'),
    () => win.locator('input[type="text"]'),
    () => win.locator('[data-testid="message-input"]'),
  ];

  for (const getLoc of candidateSelectors) {
    try {
      const loc = getLoc();
      const count = await loc.count();
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const candidate = loc.nth(i);
          if (await candidate.isVisible()) return candidate;
        }
      }
    } catch {
    }
  }
  return null;
}

const username = 'xuantest1002';
const contactName = 'Contact xuantest1003';
const messageToSend = 'TEST SINGLE CHAT';

test('Scenario 1: Open conversation and send text to username', async () => {
  const conversation = win
    .getByRole('button', { name: `Conversation with ${username}` })
    .last();

  await expect(conversation.locator('span[data-slot="avatar"]')).toBeVisible();

  await conversation.click();

  const input = await findInputLocator(win);
  await input!.fill(messageToSend);

  await win.getByRole('button', { name: 'Send message' }).click();

  await expect(win.getByText(messageToSend).last()).toBeVisible();
  await expect(win.getByText('just now').last()).toBeVisible();
  await expect(conversation).toContainText(messageToSend);

  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  const screenshotPath = path.join(screenshotsDir, `single-chat-${Date.now()}.png`);
  await win.screenshot({ path: screenshotPath });
  console.log('Saved screenshot:', screenshotPath);       
});


test('Scenario 2: Open conversation and send text to contact name', async () => {
  const conversation = win
    .getByRole('button', { name: `Conversation with ${contactName}` })
    .last();

  await expect(conversation.locator('span[data-slot="avatar"]')).toBeVisible();

  await conversation.click();

  const input = await findInputLocator(win);
  await input!.fill(messageToSend);

  await win.getByRole('button', { name: 'Send message' }).click();

  await expect(win.getByText(messageToSend).last()).toBeVisible();
  await expect(win.getByText('just now').last()).toBeVisible();
  await expect(conversation).toContainText(messageToSend);

  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  const screenshotPath = path.join(screenshotsDir, `single-chat-${Date.now()}.png`);
  await win.screenshot({ path: screenshotPath });
  console.log('Saved screenshot:', screenshotPath);     
});
