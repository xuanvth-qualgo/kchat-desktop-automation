import { Reaction, Video } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'MRA-VD';
const NamePrefix = 'Verify that User can react on video message by';

runCases(
   {
      feature:       '[Main Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipSidebarUnread: true,
      skipPushNotif: true,
      rootType:      'video',
      description:   ctx => `[Main Conversation] React on video to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendMedia(Video.ROOT_PATH, `${RUN_TAG}`);
         return Video.ROOT.value;
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: Video.ROOT.type, value: Video.ROOT.value } }),
   ],
);
