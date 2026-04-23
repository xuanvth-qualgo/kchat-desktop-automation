import { test, expect, _electron as electron } from '@playwright/test';
import { AppLauncher } from '../helpers/app-launcher';
import path from 'path';
import fs from 'fs';

const APP_NAME = 'KChat';
const screenshotsDir = path.join(process.cwd(), 'screenshots/open-app');

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test.describe('Multi-User App Launch', () => {
  const userInfo = AppLauncher.getUserInfo('xuan.vth');  
  const appInfo = AppLauncher.getAppInfo(userInfo?.userPath || 'N/A', APP_NAME);
});

/*
home dir: Users/xuanauto01
app path: home dir/Applications/KChat.app/Contents/MacOS/KChat
session path: home dir/Library/Application Support/KChat/dev
*/