import { Text } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TS-T';
const NamePrefix = 'Verify that User can send text message by';

runCases(
   {
      feature:       '[Thread Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] Send text to ${ctx}`,
   },
   [
      Text.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);