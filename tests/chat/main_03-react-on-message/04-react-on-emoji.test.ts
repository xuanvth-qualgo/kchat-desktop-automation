import { Emoji, Reaction } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix    = 'MRA-E';
const NamePrefix  = 'Verify that User can react on emoji message by';

runCases(
   {
      feature:       '[Main Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipSidebarUnread: true,
      skipPushNotif: true,
      description:   ctx => `[Main Conversation] React on emoji to ${ctx}`,

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
