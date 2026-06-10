import { Reaction, Text } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TRA-T';
const NamePrefix = 'Verify that User can react on text message by';

runCases(
   {
      feature:       '[Thread Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] React on text to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendText(Text.ROOT.value);
         return Text.ROOT.value;
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: Text.ROOT.type, value: Text.ROOT.value } }),
   ],
);