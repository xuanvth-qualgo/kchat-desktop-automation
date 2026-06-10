import { Reaction, Link } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TRA-L';
const NamePrefix = 'Verify that User can react on link message by';

runCases(
   {
      feature:       '[Thread Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] React on link to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendText(Link.ROOT.value);
         return Link.ROOT.value;
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: Link.ROOT.type, value: Link.ROOT.value } }),
   ],
);
