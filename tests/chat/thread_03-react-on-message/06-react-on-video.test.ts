import { Reaction, Video } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'TRA-VD';
const NamePrefix = 'Verify that User can react on video message by';

runCases(
   {
      feature:       '[Thread Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      rootType:      'video',
      description:   ctx => `[Thread Conversation] React on video to ${ctx}`,

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
