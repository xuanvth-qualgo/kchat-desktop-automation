import { Text, Mention, Link, Emoji, Image, Video, File, Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MRY-M';
const NamePrefix = 'Verify that User can reply on mention message by';

runCases(
   {
      feature:       '[Main Conversation] Reply on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Reply on mention to ${ctx}`,
      rootType:      'mention',

      seedRoot: async svc => {
         await svc.send.sendText(Mention.ROOT.value);
         return Mention.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('reply', { id: shared.rootId, type: Mention.ROOT.type, value: Mention.ROOT.value });
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
