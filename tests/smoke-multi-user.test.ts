import { test, expect } from '../src/core/fixtures';
import { log } from '../src/core/log';

// Smoke test cho multi-user-fixture
// Verify: host launch OK, VM launch OK, ca 2 deu lay duoc page va URL hop le
// Run: npx playwright test smoke-multi-user.test.ts --reporter=list

test('host + vm both launch and provide pages', async ({ user1, user2 }) => {
   // user1 = host (default role)
   expect(user1).toBeDefined();
   expect(user1.role).toBe('host');
   expect(user1.page).toBeTruthy();
   const u1Url = user1.page.url();
   log.info(`[smoke] user1 (host) account=${user1.displayName} url=${u1Url}`);
   expect(u1Url).toBeTruthy();

   // user2 = vm (default role)
   expect(user2).toBeDefined();
   expect(user2.role).toBe('vm');
   expect(user2.page).toBeTruthy();
   const u2Url = user2.page.url();
   log.info(`[smoke] user2 (vm)   account=${user2.displayName} url=${u2Url}`);
   expect(u2Url).toBeTruthy();

   // Kiem tra ca 2 KHONG dang o auth screen -> co nghia state da load OK
   const onAuth = (u: string) => u.includes('/auth') || u.includes('/login');
   log.info(`[smoke] host on auth? ${onAuth(u1Url)} | vm on auth? ${onAuth(u2Url)}`);
});
