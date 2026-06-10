import { test } from '../src/core/fixtures';

test('First Login and save app storage', async ({ mainWindow }) => {
  await mainWindow.waitForTimeout(120000);
});