import { test } from '../_shared/base';

/** Mirror of `edit-message-main` but the bubble being edited is a reply inside
 *  the thread side panel. */
test.describe('[Thread Conversation] Edit message', () => {
   test.skip('ET-T-01 - Verify that User can edit a text reply in thread', () => {
      // TODO: open thread → seed reply text → edit → submit → assert.
   });

   test.skip('ET-T-02 - Verify that User can clear and replace a text reply in thread', () => {
      // TODO: open thread → seed reply text → edit → clear → fill → submit → assert.
   });

   test.skip('ET-T-03 - Verify that User can cancel edit with Esc in thread', () => {
      // TODO: open thread → seed reply text → edit → Escape → assert unchanged.
   });
});
