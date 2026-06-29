/*
update test file: username = X
   ↓
detect existing folder state
   ↓
update setting: ON (visibily, gif), OFF (update version): npm run upd-setting
*/

import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { scrollToElement } from '../src/utils/ui';
import { setToggleState } from '../src/utils/actions';
import path from 'path';
import 'dotenv/config';

const APP = path.resolve(process.env.MAC_APP_PATH!);
const RETRY = 3;
const USERNAME = 'autotest04';

test(`Run update setting for account`, async () => {
   const username = await run();
   console.log(
      username
      ? `=====RESULT: Account ${username} update setting SUCCESS`
      : `=====RESULT: Account ${username} update setting FAIL`
   );
});

async function run(): Promise<string> {
   const baseFolder = `./user-logs/${USERNAME}/kchat-qa`;

      for (let attempt = 1; attempt <= RETRY; attempt++) {
         let app;

         try {
            console.log(`\nStep 1. Open app with input username at ${attempt}`);
            app = await electron.launch({
               executablePath: APP,
               args: [`--user-data-dir=${baseFolder}`],
            });
            const page = await app.firstWindow();
            await page.waitForLoadState('domcontentloaded');

            await page.waitForTimeout (60000);
            
            await page.getByRole('button', { name: 'Settings' }).click();
            const profMenu =  await page.getByRole('button', { name: 'Profile & Account' });
            const prefMenu =  await page.getByRole('button', { name: 'Preferences' });
            const toolMenu =  await page.getByRole('button', { name: 'Developer Tools' });
            const aboutMenu =  await page.getByRole('button', { name: 'About KChat' });

            const container = await page.locator('div[data-slot="stack"].\\@container\\/settings');

            console.log(`Step 2. Turn on Account Visibility`);
            await profMenu.click();
            const visibleBtn = page.getByRole( 'switch', {name: 'Account visibility'});
            await scrollToElement( container, visibleBtn );
            await setToggleState(visibleBtn, true);
            await page.waitForTimeout(1000);

            console.log(`Step 3. Turn off Updates Version`);
            await prefMenu.click();
            const updateBtn = page.getByRole( 'switch', {name: 'Automatic updates'});
            await scrollToElement(container, updateBtn);
            await setToggleState(updateBtn, false);
            await page.waitForTimeout(1000);

            console.log(`Step 4. Turn on GIF & Sticker`);
            await toolMenu.click();
            const gifBtn = page.getByRole( 'switch', {name: 'GIFs & stickers'});
            await scrollToElement(container, gifBtn);
            await setToggleState(gifBtn, true);
            await page.waitForTimeout(1000);

            await app.close();
            console.log(`=====UPDATE PROFILE STATUS: SUCCESS`);

            return USERNAME;
            
         } catch (e) {
            console.log(`=====UPDATE PROFILE STATUS: FAIL (at attempt ${attempt})`);
            try { await app?.close(); } catch {}

            if (attempt < RETRY) {
               console.log(`=====UPDATE PROFILE STATUS: RETRYING...`);
            }
        }
    }
    console.log(`\n=====UPDATE PROFILE STATUS: FAILED`);
    return '';
}
