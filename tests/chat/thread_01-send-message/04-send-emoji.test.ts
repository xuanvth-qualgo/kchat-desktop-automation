import { Emoji } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TS-E';
const NamePrefix = 'Verify that User can send emoji message by';

runCases(
   {
      feature:       '[Thread Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] Send emoji to ${ctx}`,
   },
   [
      Emoji.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);