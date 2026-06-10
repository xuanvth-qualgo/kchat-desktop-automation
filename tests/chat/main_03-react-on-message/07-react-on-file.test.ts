import { Reaction, File } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'MRA-F';
const NamePrefix = 'Verify that User can react on file message by';

runCases(
   {
      feature:       '[Main Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipSidebarUnread: true,
      skipPushNotif: true,
      description:   ctx => `[Main Conversation] React on file to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendFile(File.ROOT_PATH, `${RUN_TAG}`);
         return File.ROOT.value;
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: File.ROOT.type, value: File.ROOT.value } }),
   ],
);
