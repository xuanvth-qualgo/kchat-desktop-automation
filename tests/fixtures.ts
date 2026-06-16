import { test as base } from '@playwright/test';
import { _electron as electron, ElectronApplication, Page } from 'playwright';
import path from 'path';
import 'dotenv/config';

const APP = path.resolve(process.env.MAC_APP_PATH!);
const USER1 = process.env.USER1!;
const USER2 = process.env.USER2!;
const USER3 = process.env.USER3!;

export type UserApp = {
   app:  ElectronApplication;
   page: Page;
};

type WorkerFixtures = {
   user1: UserApp;
   user2: UserApp;
   user3: UserApp;
};

async function launchApp(user: string): Promise<UserApp> {
   const app = await electron.launch({
      executablePath: APP,
      args: [`--user-data-dir=./user-logs/${user}/kchat-qa`],
   });
   const page = await app.firstWindow();
   return { app, page };
}

function userFixture(user: string) {
   return async ({}, use: (s: UserApp) => Promise<void>) => {
      const s = await launchApp(user);
      await use(s);
      await s.app.close();
   };
}

export const test = base.extend<{}, WorkerFixtures>({
   user1: [userFixture(USER1), { scope: 'worker' }],
   user2: [userFixture(USER2), { scope: 'worker' }],
   user3: [userFixture(USER3), { scope: 'worker' }],
});

export { expect } from '@playwright/test';
