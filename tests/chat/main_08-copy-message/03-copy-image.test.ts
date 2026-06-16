import { Image } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MCO-I';
const NamePrefix = 'Verify that User can copy image message by';

runCases(
   {
      feature:       '[Main Conversation] Copy image',
      severity:      'normal',
      scope:         'once',
      skipPushNotif: true,
      rootType:      'image',
      description:   ctx => `[Main Conversation] Copy image to ${ctx}`,
      seedRoot: async svc => {
         await svc.send.sendMedia(Image.ROOT_PATH, Image.ROOT.value);
         return Image.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('copyImage', { id: shared.rootId, type: Image.ROOT.type, value: Image.ROOT.value });
      },
      verifyQuote: true,
   },
   [
      Image.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);