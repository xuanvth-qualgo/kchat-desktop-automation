import { Link } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MS-L';
const NamePrefix = 'Verify that User can send link message by';

runCases(
   {
      feature:       '[Main Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Send link to ${ctx}`,
   },
   [
      Link.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);