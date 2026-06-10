import { File } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TS-F';
const NamePrefix = 'Verify that User can send file message by';

runCases(
   {
      feature:       '[Thread Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] Send file to ${ctx}`,
   },
   [
      File.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);