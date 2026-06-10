import { Video } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TS-VD';
const NamePrefix = 'Verify that User can send video message by';

runCases(
   {
      feature:       '[Thread Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] Send video to ${ctx}`,
   },
   [
      Video.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);