import { Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MS-VO';
const NamePrefix = 'Verify that User can send voice message by';

runCases(
   {
      feature:       '[Main Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Send voice to ${ctx}`,
   },
   [
      Voice.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);