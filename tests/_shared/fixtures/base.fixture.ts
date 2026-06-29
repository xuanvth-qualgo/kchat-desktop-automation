import { test as base } from '@playwright/test';
import { _electron as electron, ElectronApplication, Page } from 'playwright';
import path from 'path';
import 'dotenv/config';

const APP = path.resolve(process.env.MAC_APP_PATH!);
const USER1 = 'autotest01';
const USER2 = 'autotest02';
const USER3 = 'autotest03';
const USER4 = 'autotest04';//mls
const USER5 = 'autotest05';//mls
const USER6 = 'autotest06';//mls
const USER7 = 'autotest07';//mls
const USER8 = 'autotest08';//mls
const USER9 = 'autotest09';//mls
const USER10 = 'autotest10';//mls

export type UserApp = {
   username: string;
   app:  ElectronApplication;
   page: Page;
};

type WorkerFixtures = {
   user1: UserApp;
   user2: UserApp;
   user3: UserApp;
   user4: UserApp;
   user5: UserApp;
   user6: UserApp;
   user7: UserApp;
   user8: UserApp;
   user9: UserApp;
   user10: UserApp;
};

async function launchApp(username: string): Promise<UserApp> {
   const app = await electron.launch({
      executablePath: APP,
      args: [`--user-data-dir=./user-logs/${username}/kchat-qa`],
   });
   const page = await app.firstWindow();
   return { username, app, page };
}

export function userFixture(username: string) {
   return async ({}, use: (s: UserApp) => Promise<void>) => {
      let app: UserApp | null = null;

      try {
         console.log(`[fixture] launching app for user: ${username}`);
         app = await launchApp(username);
         console.log(`[fixture] app started: ${username}`);
         await use(app);

      } catch (err) {
         console.error(
            `[fixture ERROR] failed to launch app for user: ${username}`
         );
         console.error(err);

         throw err; // vẫn fail test
      } finally {
         if (app) {
            try {
               await app.app.close();
               console.log(`[fixture] closed app: ${username}`);
            } catch (e) {
               console.error(`[fixture] failed to close app: ${username}`, e);
            }
         }
      }
   };
}

export const test = base.extend<{}, WorkerFixtures>({
   user1: [userFixture(USER1), { scope: 'worker' }],
   user2: [userFixture(USER2), { scope: 'worker' }],
   user3: [userFixture(USER3), { scope: 'worker' }], 
   user4: [userFixture(USER4), { scope: 'worker' }],
   user5: [userFixture(USER5), { scope: 'worker' }],
   user6: [userFixture(USER6), { scope: 'worker' }], 
   user7: [userFixture(USER7), { scope: 'worker' }], 
   user8: [userFixture(USER8), { scope: 'worker' }],
   user9: [userFixture(USER9), { scope: 'worker' }],
   user10: [userFixture(USER10), { scope: 'worker' }], 
});

export { expect } from '@playwright/test';
