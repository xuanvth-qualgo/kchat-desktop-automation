import { Image } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MS-I';
const NamePrefix = 'Verify that User can send image message by';

runCases(
   {
      feature:       '[Main Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Send image to ${ctx}`,
   },
   [
      Image.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);