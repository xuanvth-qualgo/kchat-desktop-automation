import { test } from '../_shared/base';

/** Mirror of `forward-message-main` but the source bubble lives inside the
 *  thread side panel. */
test.describe('[Thread Conversation] Forward message', () => {
   test.skip('FT-T-01 - Verify that User can forward a text reply from thread to Direct conv', () => {
      // TODO: open thread → seed reply text → forward → pick Direct → submit → assert.
   });

   test.skip('FT-T-02 - Verify that User can forward a text reply from thread to Group conv', () => {
      // TODO: open thread → seed reply text → forward → pick Group → submit → assert.
   });

   test.skip('FT-I-01 - Verify that User can forward an image reply from thread', () => {
      // TODO: open thread → seed reply image → forward → submit → assert.
   });

   test.skip('FT-F-01 - Verify that User can forward a file reply from thread', () => {
      // TODO: open thread → seed reply file → forward → submit → assert.
   });

   test.skip('FT-T-03 - Verify that User can forward a reply to multiple conversations', () => {
      // TODO: open thread → seed reply → forward → pick 2+ convs → submit → assert.
   });
});
