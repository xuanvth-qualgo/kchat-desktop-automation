import { Text } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MS-T';
const NamePrefix = 'Verify that User can send text message by';

runCases(
   {
      feature:       '[Main Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Send text to ${ctx}`,
   },
   [
      Text.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);