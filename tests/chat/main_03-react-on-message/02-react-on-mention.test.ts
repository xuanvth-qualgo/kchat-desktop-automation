import { Reaction, Mention } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MRA-M';
const NamePrefix = 'Verify that User can react on mention message by';

runCases(
   {
      feature:       '[Main Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipSidebarUnread: true,
      skipPushNotif: true,
      description:   ctx => `[Main Conversation] React on mention to ${ctx}`,
      rootType:      'mention',

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
