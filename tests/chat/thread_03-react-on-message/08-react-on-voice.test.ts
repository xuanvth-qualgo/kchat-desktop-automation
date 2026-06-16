import { Reaction, Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'TRA-VO';
const NamePrefix = 'Verify that User can react on voice message by';

runCases(
   {
      feature:       '[Thread Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] React on voice to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendVoice(1000, `${RUN_TAG}`);
         return Voice.ROOT;
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: Voice.ROOT.type } }),
   ],
);
