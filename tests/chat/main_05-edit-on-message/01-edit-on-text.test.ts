import { Text, Mention, Link, Emoji, Image, Video, File, Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';

const IDPrefix   = 'ME-T';
const NamePrefix = 'Verify that User can edit on text message by';

runCases(
   {
      feature:       '[Main Conversation] Edit on message',
      severity:      'normal',
      scope:         'once',
      skipPushNotif:     true,
      skipSidebarUnread: true, // edit mutates an existing message, no new unread
      seedFromHost:      true, // edit only works on own message
      seedPerCase:       true, // each case needs a fresh, unmutated root
      description:   ctx => `[Main Conversation] Edit on text to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendText(Text.ROOT.value);
         return Text.ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('edit', { id: shared.rootId, type: Text.ROOT.type, value: Text.ROOT.value });
      },
      verifyQuote: false, // edit mutates root in place, no quote
   },
   [
      Text   .buildCases({ idPrefix: `${IDPrefix}-T`,  namePrefix: NamePrefix }),
      Mention.buildCases({ idPrefix: `${IDPrefix}-M`,  namePrefix: NamePrefix }),
      Link   .buildCases({ idPrefix: `${IDPrefix}-L`,  namePrefix: NamePrefix }),
      Emoji  .buildCases({ idPrefix: `${IDPrefix}-E`,  namePrefix: NamePrefix }),
      Image  .buildCases({ idPrefix: `${IDPrefix}-I`,  namePrefix: NamePrefix }),// only edit caption
      Video  .buildCases({ idPrefix: `${IDPrefix}-VD`,  namePrefix: NamePrefix }),// only edit caption
      File   .buildCases({ idPrefix: `${IDPrefix}-F`,  namePrefix: NamePrefix }),// only edit caption
      Voice  .buildCases({ idPrefix: `${IDPrefix}-VO`, namePrefix: NamePrefix }),// only edit caption
   ],
);
