import { Text } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MF-T';
const NamePrefix = 'Verify that User can forward text message by';

runCases(
   {
      feature:       '[Main Conversation] Forward message',
      severity:      'normal',
      scope:         'once',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Forward text to ${ctx}`,
      seedRoot: async svc => {
         await svc.send.sendText(Text.ROOT.value);
         return Text.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('forward', { id: shared.rootId, type: Text.ROOT.type, value: Text.ROOT.value });
      },
      verifyQuote: true,
   },
   [
      Text.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);