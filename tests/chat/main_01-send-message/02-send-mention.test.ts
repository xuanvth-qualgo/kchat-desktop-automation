import { Mention } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MS-M';
const NamePrefix = 'Verify that User can send mention message by';

runCases(
   {
      feature:       '[Main Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Send mention to ${ctx}`,
   },
   [
      Mention.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);