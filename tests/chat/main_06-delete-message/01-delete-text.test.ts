import { Text } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MD-T';
const NamePrefix = 'Verify that User can delete on text message by';

runCases(
   {
      feature:       '[Main Conversation] Delete on message',
      severity:      'normal',
      scope:         'once',
      skipPushNotif:     true,
      skipSidebarUnread: true, // delete removes message, no new unread
      seedFromHost:      true, // delete only works on own message
      seedPerCase:       true, // each case needs a fresh root (prior was deleted)
      description:   ctx => `[Main Conversation] Delete on text to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendText(Text.ROOT.value);
         return Text.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('delete', { id: shared.rootId, type: Text.ROOT.type, value: Text.ROOT.value });
      },
      verifyQuote: false, // delete removes root, no quote
   },
   [
      Text   .buildCases({ idPrefix: `${IDPrefix}-T`,  namePrefix: NamePrefix }),
   ],
);
