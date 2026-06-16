import { MixTypes } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MS-MX';
const NamePrefix = 'Verify that User can send mix-types message by';

runCases(
   {
      feature:       '[Main Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,
      description:   ctx => `[Main Conversation] Send mix-types to ${ctx}`,
   },
   [
      MixTypes.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);
