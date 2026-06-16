import { test } from '@playwright/test';
import { _electron as electron, ElectronApplication, Page } from 'playwright';
import 'dotenv/config';
import path from 'path';
import { ChatPage } from '../src/pages/chat/ChatPage';
import { ChatService } from '../src/services/chat/ChatService';

const APP = path.resolve(process.env.MAC_APP_PATH!);

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
   app = await electron.launch({
      executablePath: APP,
      args: ['--user-data-dir=./user-logs/autotest01/kchat-qa'],
   });
   page = await app.firstWindow();
   await page.waitForTimeout(8_000);
});

test.afterAll(async () => { await app?.close(); });

test.describe.configure({ mode: 'serial' });

test('sendMedia demo.jpeg without caption', async () => {
   const svc = new ChatService(new ChatPage(app, page));
   await svc.openConversation('autotest02');
   await svc.send.sendMedia('test-data/demo.jpeg');
   await svc.view.verifyLastImage('demo.jpeg');
});

test('sendMedia demo.jpeg with caption', async () => {
   const svc = new ChatService(new ChatPage(app, page));
   await svc.openConversation('autotest02');
   await svc.send.sendMedia('test-data/demo.jpeg', 'caption test');
   await svc.view.verifyLastImage('demo.jpeg');
});

test('sendFile demo.txt', async () => {
   const svc = new ChatService(new ChatPage(app, page));
   await svc.openConversation('autotest02');
   await svc.send.sendFile('test-data/demo.txt');
   await svc.view.verifyLastFile('demo.txt');
});

