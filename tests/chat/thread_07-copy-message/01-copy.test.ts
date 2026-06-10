import { test } from '../_shared/base';

/**
 * Same as `copy-message-main` but the source bubble lives inside the thread
 * side panel. Re-open the thread before copying so the context menu is opened
 * on the panel's copy of the message (not the main-chat copy).
 */
test.describe('[Thread Conversation] Copy message', () => {
   test.skip('CT-T-01 - Verify that User can copy a plain text message in thread', () => {
      // TODO: open thread → seed reply text → copyText → assert clipboard.
   });

   test.skip('CT-L-01 - Verify that User can copy a link from a message in thread', () => {
      // TODO: open thread → seed reply link → copyLink → assert clipboard.
   });

   test.skip('CT-I-01 - Verify that User can copy an image from a message in thread', () => {
      // TODO: open thread → seed reply image → copyImage → assert clipboard image blob.
   });
});
