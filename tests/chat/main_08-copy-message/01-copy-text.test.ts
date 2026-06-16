import { Text } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MCO-T';
const NamePrefix = 'Verify that User can copy text message by';

runCases(
   {
      feature:       '[Main Conversation] Copy message',
      severity:      'normal',
      scope:         'once',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Copy text to ${ctx}`,
      seedRoot: async svc => {
         await svc.send.sendText(Text.ROOT.value);
         return Text.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('copyText', { id: shared.rootId, type: Text.ROOT.type, value: Text.ROOT.value });
      },
      verifyQuote: true,
   },
   [
      Text.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);