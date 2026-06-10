import { Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TS-VO';
const NamePrefix = 'Verify that User can send voice message by';

runCases(
   {
      feature:       '[Thread Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] Send voice to ${ctx}`,
   },
   [
      Voice.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);