import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';
import 'dotenv/config';

const APP = path.resolve(process.env.MAC_APP_PATH!);
const WAIT = 30_000;

for (const account of ['autotest01', 'autotest02', 'autotest03']) {
   test(`First login ${account}`, async () => {
      const app = await electron.launch({
         executablePath: APP,
         args: [`--user-data-dir=./user-logs/${account}/kchat-qa`],
      });
      await (await app.firstWindow()).waitForTimeout(WAIT);
      await app.close();
   });
}
