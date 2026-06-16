// Helper test — gửi file report.zip qua kChat cho `xtest01`.
// File này bị `testIgnore` trong playwright.config — chỉ chạy khi truyền path trực tiếp.
// Dùng user1 fixture (sender) để mở DM tới xtest01 và sendFile.

import path from 'path';
import { ChatPage } from '../src/pages/chat/ChatPage';
import { ChatService } from '../src/services/chat/ChatService';
import { test } from './fixtures';

const REPORT_ZIP   = path.resolve('report.zip');
const REPORT_TO    = process.env.REPORT_TO ?? 'KChat Desktop Automation Report';
const REPORT_NOTE  = process.env.REPORT_NOTE ?? `Allure report ${new Date().toISOString()}`;

test('send allure report', async ({ user1 }) => {
   const k = new ChatService(new ChatPage(user1.app, user1.page));
   await k.openConversation(REPORT_TO);
   await k.send.sendFile(REPORT_ZIP, REPORT_NOTE);
});
