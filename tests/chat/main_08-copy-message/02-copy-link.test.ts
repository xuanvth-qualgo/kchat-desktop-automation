import { Link } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'MCO-L';
const NamePrefix = 'Verify that User can copy link message by';

runCases(
   {
      feature:       '[Main Conversation] Copy link',
      severity:      'normal',
      scope:         'once',
      skipPushNotif: true,      
      description:   ctx => `[Main Conversation] Copy link to ${ctx}`,
      seedRoot: async svc => {
         await svc.send.sendText(Link.ROOT.value);
         return Link.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('copyLink', { id: shared.rootId, type: Link.ROOT.type, value: Link.ROOT.value });
      },
      verifyQuote: true,
   },
   [
      Link.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);