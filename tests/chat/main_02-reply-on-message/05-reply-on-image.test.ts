import { Text, Mention, Link, Emoji, Image, Video, File, Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'MRY-I';
const NamePrefix = 'Verify that User can reply on image message by';

runCases(
   {
      feature:       '[Main Conversation] Reply on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,   
      rootType:      'image',
      description:   ctx => `[Main Conversation] Reply on image to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendMedia(Image.ROOT_PATH, `${RUN_TAG}`);
         return Image.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('reply', { id: shared.rootId, type: Image.ROOT.type, value: Image.ROOT.value });
      },
      verifyQuote: true,
   },
   [
      Text   .buildCases({ idPrefix: `${IDPrefix}-T`,  namePrefix: NamePrefix }),
      Mention.buildCases({ idPrefix: `${IDPrefix}-M`,  namePrefix: NamePrefix }),
      Link   .buildCases({ idPrefix: `${IDPrefix}-L`,  namePrefix: NamePrefix }),
      Emoji  .buildCases({ idPrefix: `${IDPrefix}-E`,  namePrefix: NamePrefix }),
      Image  .buildCases({ idPrefix: `${IDPrefix}-I`,  namePrefix: NamePrefix }),
      Video  .buildCases({ idPrefix: `${IDPrefix}-VD`,  namePrefix: NamePrefix }),
      File   .buildCases({ idPrefix: `${IDPrefix}-F`,  namePrefix: NamePrefix }),
      Voice  .buildCases({ idPrefix: `${IDPrefix}-VO`, namePrefix: NamePrefix }),
   ],
);
