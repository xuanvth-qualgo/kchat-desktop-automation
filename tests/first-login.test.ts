/*
CLI input
   ↓
detect existing folder state
   ↓
login by single sccount: npm run login 
(must remove old 'user' folder before to make sure get latest data)
*/

import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { moveFolder, sanitize, RUN_TAG, deleteAllByPathAndPrefix } from '../src/utils/helpers';
import path from 'path';
import 'dotenv/config';

const APP = path.resolve(process.env.MAC_APP_PATH!);
const RETRY = 3;

test(`Run first login for account`, async () => {
   const username = await run();
   console.log(
      username
      ? `=====RESULT: Account ${username} login SUCCESS`
      : `=====RESULT: Account ${username} login FAIL`
   );
});

async function run(): Promise<string> {
   const baseFolder = `./user-logs/undefined-${RUN_TAG}/kchat-qa`;

   try {
      for (let attempt = 1; attempt <= RETRY; attempt++) {
         let app;

         try {
            console.log(`\nStep 1. Start login and receive data from Mobile device at attempt ${attempt}`);
            app = await electron.launch({
               executablePath: APP,
               args: [`--user-data-dir=${baseFolder}`],
            });
            const page = await app.firstWindow();
            await page.waitForLoadState('domcontentloaded');

            console.log(`Step 2. Collect current username from profile settings`);
            await page.getByRole('button', { name: 'Settings' }).click();
            await page.getByRole('button', { name: 'Profile & Account' }).click();
            const username = await page.getByPlaceholder('Choose a username').inputValue();// if username is updated
            await page.waitForTimeout(1000);

            const newFolder = `./user-logs/${sanitize(username)}/kchat-qa`;

            console.log(`Step 3. Move user logs from ${baseFolder} to ${newFolder}`);
            await moveFolder(baseFolder, newFolder);
            await app.close();

            console.log(`=====LOGIN STATUS: SUCCESS`);
            return username;
         } catch (e) {
            console.log(`=====LOGIN STATUS: FAIL (at attempt ${attempt})`);
            try { await app?.close(); } catch {}

            if (attempt < RETRY) {
               console.log(`=====LOGIN STATUS: RETRYING...`);
            }
         }
      }
      console.log(`\n=====LOGIN STATUS: FAILED`);
      return '';
   } finally {
      deleteAllByPathAndPrefix('./user-logs', `undefined-${RUN_TAG}`);
      console.log(`=====CLEANUP: Removed temp folder`);
   }
}