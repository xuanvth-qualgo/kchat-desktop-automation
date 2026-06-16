import { Reaction } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'TRA-MX';
const NamePrefix = 'Verify that User can react on mix-types message by';

const MIX_ROOT = `Welcome to KChat Desktop https://kchat.com 🎉 ${RUN_TAG}`;

runCases(
   {
      feature:       '[Thread Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,
      description:   ctx => `[Thread Conversation] React on mix-types to ${ctx}`,

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
