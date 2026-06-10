import { test } from '../_shared/base';

/** Mirror of `delete-message-main` but for replies living inside the thread. */
test.describe('[Thread Conversation] Delete message', () => {
   test.skip('DT-T-01 - Verify that User can delete a text reply in thread', () => {
      // TODO: open thread → seed reply text → delete → confirm → assert gone in panel.
   });

   test.skip('DT-I-01 - Verify that User can delete an image reply in thread', () => {
      // TODO: open thread → seed reply image → delete → confirm → assert gone.
   });

   test.skip('DT-F-01 - Verify that User can delete a file reply in thread', () => {
      // TODO: open thread → seed reply file → delete → confirm → assert gone.
   });

   test.skip('DT-VO-01 - Verify that User can delete a voice reply in thread', () => {
      // TODO: open thread → seed reply voice → delete → confirm → assert gone.
   });

   test.skip('DT-T-02 - Verify that deleting the root reply in thread keeps the bubble in main chat', () => {
      // TODO: seed text reply → delete root → assert main-chat bubble retained.
   });
});
