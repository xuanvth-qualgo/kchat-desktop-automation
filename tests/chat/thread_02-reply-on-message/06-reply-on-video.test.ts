import { Text, Mention, Link, Emoji, Image, Video, File, Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'TRY-VD';
const NamePrefix = 'Verify that User can reply on video message by';

runCases(
   {
      feature:       '[Thread Conversation] Reply on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      rootType:      'video',
      description:   ctx => `[Thread Conversation] Reply on video to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendMedia(Video.ROOT_PATH, `${RUN_TAG}`);
         return Video.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('reply', { id: shared.rootId, type: Video.ROOT.type, value: Video.ROOT.value });
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
