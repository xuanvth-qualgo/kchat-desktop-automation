import { Reaction, Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'MRA-VO';
const NamePrefix = 'Verify that User can react on voice message by';

runCases(
   {
      feature:       '[Main Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipSidebarUnread: true,
      skipPushNotif: true,
      description:   ctx => `[Main Conversation] React on voice to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendVoice(1000, `${RUN_TAG}`);
         return { type: Voice.ROOT.type };
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: Voice.ROOT.type } }),
   ],
);
