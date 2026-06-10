import { Mention } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TS-M';
const NamePrefix = 'Verify that User can send mention message by';

runCases(
   {
      feature:       '[Thread Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] Send mention to ${ctx}`,
   },
   [
      Mention.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);