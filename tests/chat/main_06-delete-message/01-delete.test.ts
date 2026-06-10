import { test } from '../_shared/base';

/**
 * Delete a previously-sent message via context menu → confirm dialog → assert
 * bubble vanishes for both sender and receiver.
 *
 * Implementation notes:
 *  - `actions.do('delete', target)` clicks the menu item. The follow-up
 *    confirmation dialog needs a helper (e.g. `chatPage.deleteDialog.confirm()`).
 *  - Verify via `chatPage.messages.getMessageById(id)` resolves to 0 / hidden,
 *    and on receiver via `view.verifyMessageById(id)` with `assertHidden`.
 */
test.describe('[Main Conversation] Delete message', () => {
   test.skip('D-T-01 - Verify that User can delete a text message', () => {
      // TODO: seed text root → delete → confirm → assert bubble gone on both users.
   });

   test.skip('D-I-01 - Verify that User can delete an image message', () => {
      // TODO: seed image root → delete → confirm → assert bubble gone.
   });

   test.skip('D-F-01 - Verify that User can delete a file message', () => {
      // TODO: seed file root → delete → confirm → assert bubble gone.
   });

   test.skip('D-VO-01 - Verify that User can delete a voice message', () => {
      // TODO: seed voice root → delete → confirm → assert bubble gone.
   });

   test.skip('D-T-02 - Verify that User can cancel deletion from confirm dialog', () => {
      // TODO: seed text root → delete → cancel dialog → assert bubble still present.
   });
});
