import { Reaction, Mention } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TRA-M';
const NamePrefix = 'Verify that User can react on mention message by';

runCases(
   {
      feature:       '[Thread Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] React on mention to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendText(Mention.ROOT.value);
         return Mention.ROOT.value;
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: Mention.ROOT.type, value: Mention.ROOT.value } }),
   ],
);
