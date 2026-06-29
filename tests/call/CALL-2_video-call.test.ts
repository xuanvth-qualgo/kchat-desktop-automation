import { allure } from 'allure-playwright';
import { stepAndRetry } from '../../../_shared/retry';
import { test } from '../_shared/base';

const EPIC = 'B2C / Call';

test.describe('[Direct Video Call][V02]', () => {
   test.describe.configure({ mode: 'serial' });

   test('[Direct Video][TC001] start → cancel outgoing', { tag: '@smoke' }, async ({ callUser1: u1, callUser2: u2 }) => {
      await allure.epic(EPIC); await allure.feature('Direct / Video'); await allure.story('Start then cancel');
      await stepAndRetry('1. open conv', () => u1.bar.openB2CConversation(u1.page, { name: u2.username }), { pages: { u1: u1.page } });
      let caller: Awaited<ReturnType<typeof u1.call.start>>;
      await stepAndRetry('2. start video', async () => { caller = await u1.call.start('video'); }, { pages: { u1: u1.page } });
      await stepAndRetry('3. cancel outgoing', () => caller!.cancelOutgoing(), { pages: { u1: u1.page } });
   });

   test('[Direct Video][TC002] start → callee rejects', async ({ callUser1: u1, callUser2: u2 }) => {
      await allure.epic(EPIC); await allure.feature('Direct / Video'); await allure.story('Callee declines');
      await stepAndRetry('1. open conv', () => u1.bar.openB2CConversation(u1.page, { name: u2.username }), { pages: { u1: u1.page } });
      let caller: Awaited<ReturnType<typeof u1.call.start>>;
      const incomingPromise = u2.call.waitIncoming(30_000);
      await stepAndRetry('2. user1 start video', async () => { caller = await u1.call.start('video'); }, { pages: { u1: u1.page } });
      let callee: Awaited<typeof incomingPromise>;
      await stepAndRetry('3. user2 receives incoming', async () => { callee = await incomingPromise; }, { pages: { u2: u2.page } });
      await stepAndRetry('4. user2 rejects',           () => callee!.rejectCall(),                       { pages: { u1: u1.page, u2: u2.page } });
   });

   test('[Direct Video][TC003] accept → toggle mic → toggle cam → share screen → end', async ({ callUser1: u1, callUser2: u2 }) => {
      await allure.epic(EPIC); await allure.feature('Direct / Video'); await allure.story('Accept → full toggles → end');
      await stepAndRetry('1. open conv', () => u1.bar.openB2CConversation(u1.page, { name: u2.username }), { pages: { u1: u1.page } });
      let caller: Awaited<ReturnType<typeof u1.call.start>>;
      const incomingPromise = u2.call.waitIncoming(30_000);
      await stepAndRetry('2. user1 start video', async () => { caller = await u1.call.start('video'); }, { pages: { u1: u1.page } });
      let callee: Awaited<typeof incomingPromise>;
      await stepAndRetry('3. user2 receives incoming', async () => { callee = await incomingPromise; }, { pages: { u2: u2.page } });
      await stepAndRetry('4. user2 accepts',           () => callee!.acceptCall(),                       { pages: { u1: u1.page, u2: u2.page } });
      await stepAndRetry('5. user1 mutes mic',         () => caller!.muteMic(),                          { pages: { u1: u1.page } });
      await stepAndRetry('6. user1 unmutes mic',       () => caller!.unmuteMic(),                        { pages: { u1: u1.page } });
      await stepAndRetry('7. user1 turns camera on',   () => caller!.cameraOn(),                         { pages: { u1: u1.page } });
      await stepAndRetry('8. user1 turns camera off',  () => caller!.cameraOff(),                        { pages: { u1: u1.page } });
      await stepAndRetry('9. user1 starts share screen', () => caller!.shareScreen(),                    { pages: { u1: u1.page } });
      await stepAndRetry('10. user1 stops share screen', () => caller!.stopScreen(),                     { pages: { u1: u1.page } });
      await stepAndRetry('11. user1 ends call',        () => caller!.endCall(),                          { pages: { u1: u1.page, u2: u2.page } });
   });
});
