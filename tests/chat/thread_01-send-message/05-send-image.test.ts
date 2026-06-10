import { Image } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TS-I';
const NamePrefix = 'Verify that User can send image message by';

runCases(
   {
      feature:       '[Thread Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Thread Conversation] Send image to ${ctx}`,
   },
   [
      Image.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);