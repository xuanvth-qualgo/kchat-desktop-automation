import { test, expect } from '../src/core/fixtures';
import { log } from '../src/core/log';

// Test mo app tren 2 may (host + VM), verify ca 2 load duoc app voi state da save (KHONG o /auth)
// Run: npx playwright test open-two-machines.test.ts --reporter=list

test('host + vm: open app va keep state (KHONG o /auth)', async ({ user1, user2 }) => {
   // ----- HOST -----
   expect(user1.page, 'host page must exist').toBeTruthy();
   const hostUrl = user1.page.url();
   log.info(`[host] account=${user1.displayName} url=${hostUrl}`);
   expect(hostUrl, 'host URL must be valid').toMatch(/^kchat:\/\//);
   expect(hostUrl, 'host phai LOGIN, KHONG o /auth').not.toMatch(/\/(auth|login)\b/);

   // ----- VM -----
   expect(user2.page, 'vm page must exist').toBeTruthy();
   const vmUrl = user2.page!.url();
   log.info(`[vm]   account=${user2.displayName} url=${vmUrl}`);
   expect(vmUrl, 'vm URL must be valid').toMatch(/^kchat:\/\//);
   expect(vmUrl, 'vm phai LOGIN, KHONG o /auth').not.toMatch(/\/(auth|login)\b/);

   // Giu app mo 5s de quan sat (optional)
   await user1.page.waitForTimeout(5000);
});
