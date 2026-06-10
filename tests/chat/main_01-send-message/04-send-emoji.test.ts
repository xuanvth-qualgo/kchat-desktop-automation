import { Emoji } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MS-E';
const NamePrefix = 'Verify that User can send emoji message by';

runCases(
   {
      feature:       '[Main Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Send emoji to ${ctx}`,
   },
   [
      Emoji.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);