import { Text, Mention, Link, Emoji, Image, Video, File, Voice, MixTypes } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'TRY-MX';
const NamePrefix = 'Verify that User can reply on mix-types message by';

// Mention-free root so Direct context can run too.
const MIX_ROOT = `Welcome to KChat Desktop https://kchat.com 🎉 ${RUN_TAG}`;

runCases(
   {
      feature:       '[Thread Conversation] Reply on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,
      description:   ctx => `[Thread Conversation] Reply on mix-types to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendText(MIX_ROOT);
         return MIX_ROOT;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('reply', { id: shared.rootId, type: 'text', value: MIX_ROOT });
      },
      verifyQuote: true,
   },
   [
      Text    .buildCases({ idPrefix: `${IDPrefix}-T`,  namePrefix: NamePrefix }),
      Mention .buildCases({ idPrefix: `${IDPrefix}-M`,  namePrefix: NamePrefix }),
      Link    .buildCases({ idPrefix: `${IDPrefix}-L`,  namePrefix: NamePrefix }),
      Emoji   .buildCases({ idPrefix: `${IDPrefix}-E`,  namePrefix: NamePrefix }),
      Image   .buildCases({ idPrefix: `${IDPrefix}-I`,  namePrefix: NamePrefix }),
      Video   .buildCases({ idPrefix: `${IDPrefix}-VD`, namePrefix: NamePrefix }),
      File    .buildCases({ idPrefix: `${IDPrefix}-F`,  namePrefix: NamePrefix }),
      Voice   .buildCases({ idPrefix: `${IDPrefix}-VO`, namePrefix: NamePrefix }),
      MixTypes.buildCases({ idPrefix: `${IDPrefix}-MX`, namePrefix: NamePrefix }),
   ],
);
