import { Reaction, File } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'TRA-F';
const NamePrefix = 'Verify that User can react on file message by';

runCases(
   {
      feature:       '[Thread Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipPushNotif: true,      
      rootType:      'file',
      description:   ctx => `[Thread Conversation] React on file to ${ctx}`,

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
