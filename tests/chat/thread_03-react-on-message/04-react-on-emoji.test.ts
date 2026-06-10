import { Reaction, Emoji } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix    = 'TRA-E';
const NamePrefix  = 'Verify that User can react on emoji message by';

runCases(
   {
      feature:       '[Thread Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] React on emoji to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendEmoji(Emoji.ROOT_PICKER);
         return Emoji.ROOT.value;
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: Emoji.ROOT.type, value: Emoji.ROOT.value } }),
   ],
);
