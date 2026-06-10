import { test } from '../_shared/base';

/**
 * Copy a message via context menu → verify the system clipboard receives the
 * expected payload. Run with the kChat window focused so the clipboard
 * permission prompt is suppressed.
 *
 * Implementation notes:
 *  - Seed a root via `svc.send.sendText/sendMedia(...)` in `beforeAll`.
 *  - Trigger copy with `svc.actions.do('copyText' | 'copyLink' | 'copyImage', target)`.
 *  - Read clipboard via `page.evaluate(() => navigator.clipboard.readText())`
 *    (for images, compare via `clipboard.read()` blob type).
 */
test.describe('[Main Conversation] Copy message', () => {
   test.skip('C-T-01 - Verify that User can copy a plain text message', () => {
      // TODO: seed text root → copyText → assert clipboard === text.
   });

   test.skip('C-L-01 - Verify that User can copy a link from a message', () => {
      // TODO: seed link root → copyLink → assert clipboard === url.
   });

   test.skip('C-I-01 - Verify that User can copy an image from a message', () => {
      // TODO: seed image root → copyImage → assert clipboard image blob is present.
   });
});
