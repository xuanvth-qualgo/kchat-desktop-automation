import { test } from '../_shared/base';

test.describe('[Main Conversation] Create thread', () => {
   test.skip('CR-T-01 - Verify that User can create a thread from a text root', () => {
      // TODO: seed text root → createThread → assert panel open + header.
   });

   test.skip('CR-I-01 - Verify that User can create a thread from an image root', () => {
      // TODO: seed image root → createThread → assert panel open.
   });

   test.skip('CR-F-01 - Verify that User can create a thread from a file root', () => {
      // TODO: seed file root → createThread → assert panel open.
   });

   test.skip('CR-T-02 - Verify that the thread persists after sending the first reply', () => {
      // TODO: seed text root → createThread → send reply → close panel → reopen → assert reply still present.
   });
});
