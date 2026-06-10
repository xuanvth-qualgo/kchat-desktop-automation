import { test } from '../_shared/base';

/**
 * Edit a previously-sent message via context menu → re-type new content → save.
 *
 * Implementation notes:
 *  - `actions.do('edit', target)` only opens the menu item. The composer then
 *    needs to switch to "edit mode" — extend `ChatComposers` with helpers like
 *    `clearMessage()`, `submitEdit()` and verify the bubble exposes the
 *    "(edited)" badge.
 *  - Sender + receiver verification should both observe the new text on the
 *    same `data-message-id` (no new bubble appears).
 */
test.describe('[Main Conversation] Edit message', () => {
   test.skip('E-T-01 - Verify that User can edit a text message', () => {
      // TODO: seed text root → edit → type new text → submit → assert bubble updated.
   });

   test.skip('E-T-02 - Verify that User can clear and replace text in 1 round', () => {
      // TODO: seed text root → edit → clear → fill new value → submit → assert.
   });

   test.skip('E-T-03 - Verify that User can cancel edit with Esc', () => {
      // TODO: seed text root → edit → press Escape → assert bubble unchanged.
   });
});
