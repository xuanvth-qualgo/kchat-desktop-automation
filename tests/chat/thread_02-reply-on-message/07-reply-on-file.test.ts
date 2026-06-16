import { Text, Mention, Link, Emoji, Image, Video, File, Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'TRY-F';
const NamePrefix = 'Verify that User can reply on file message by';

runCases(
   {
      feature:       '[Thread Conversation] Reply on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      rootType:      'file',
      description:   ctx => `[Thread Conversation] Reply on file to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendFile(File.ROOT_PATH, `${RUN_TAG}`);
         return File.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('reply', { id: shared.rootId, type: File.ROOT.type, value: File.ROOT.value });
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
