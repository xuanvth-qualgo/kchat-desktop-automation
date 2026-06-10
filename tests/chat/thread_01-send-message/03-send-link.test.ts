import { Link } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TS-L';
const NamePrefix = 'Verify that User can send link message by';

runCases(
   {
      feature:       '[Thread Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] Send link to ${ctx}`,
   },
   [
      Link.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);