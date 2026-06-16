import { MixTypes } from '../_shared/cases/_index';
import { runCases } from '../_shared/thread';

const IDPrefix   = 'TS-MX';
const NamePrefix = 'Verify that User can send mix-types message by';

runCases(
   {
      feature:       '[Thread Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,
      description:   ctx => `[Thread Conversation] Send mix-types to ${ctx}`,
   },
   [
      MixTypes.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);
