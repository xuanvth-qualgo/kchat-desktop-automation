import { File } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MS-F';
const NamePrefix = 'Verify that User can send file message by';

runCases(
   {
      feature:       '[Main Conversation] Send message',
      severity:      'critical',
      scope:         'all',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Send file to ${ctx}`,
   },
   [
      File.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);