import { Reaction, Image } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';
import { RUN_TAG } from '../_shared/base';

const IDPrefix   = 'MRA-I';
const NamePrefix = 'Verify that User can react on image message by';

runCases(
   {
      feature:       '[Main Conversation] React on message',
      severity:      'critical',
      scope:         'once',
      skipSidebarUnread: true,
      skipPushNotif: true,
      rootType:      'image',
      description:   ctx => `[Main Conversation] React on image to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendMedia(Image.ROOT_PATH, `${RUN_TAG}`);
         return Image.ROOT.value;
      },
      verifyOverride: async (svc, tc, shared) => {
         await svc.view.verifyReactionOnMessage(shared.rootId!, tc.expected!);
      },
   },
   [
      Reaction.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix, root: { type: Image.ROOT.type, value: Image.ROOT.value } }),
   ],
);
