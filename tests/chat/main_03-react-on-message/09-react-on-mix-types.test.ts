import { Reaction } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'MRA-MX';
const NamePrefix = 'Verify that User can react on mix-types message by';

// Mention-free root so Direct context can run too.
const MIX_ROOT = `Welcome to KChat Desktop https://kchat.com 🎉 ${RUN_TAG}`;

runCases(
   {
      feature:       '[Main Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipSidebarUnread: true,
      skipPushNotif:     true,
      description:   ctx => `[Main Conversation] React on mix-types to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendText(MIX_ROOT);
         return MIX_ROOT;
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: 'text', value: MIX_ROOT } }),
   ],
);
