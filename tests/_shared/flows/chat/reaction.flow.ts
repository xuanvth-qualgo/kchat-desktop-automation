import { expect } from '@playwright/test';
import type { ChatUser } from '../../../_shared/fixtures/chat.fixture';
import { minimizeApp, hover, getButtonByName, click, longHover } from '../../../../src/utils/actions';
import { ConversationRef } from '../../../../src/pages/common/SidebarPage';
import { EmojiObj } from '../../../../src/pages/chat/sections/components/EmojiPicker';
import type { MessageReaction } from '../../../_shared/data/chat.data';
import { RUN_TAG } from '../../../../src/utils/helpers';
import { MessageLabels } from '../../../../src/_generated/chat.element';
import { scrollToBottom } from '../../../../src/utils/ui';
import { MessageType, SendMessageFlow as SEND } from './send-message.flow';
import { ChatFlow as CHAT } from './chat.flow';

const TIMEOUT = 200;

export const ReactionFlow = {
    prepareForReactionOnMsg,
    reactOnMsgAndVerifyInConv,
    verifyReceivedReactionOnMsg
}

// STEP 1: Receiver: select conv >> send root message >> switch to other conv >> get old unread count >> minimize app
async function prepareForReactionOnMsg(
   receiver: ChatUser, 
   sender: ConversationRef, 
   type: MessageType, 
   rootMsg: string | number | EmojiObj, 
   tenant?: string,
   timeout: number = TIMEOUT
): Promise<{
   rootMessageId: string;
   oldUnread: number;
}>{
   await CHAT.selectConversation(receiver, sender, tenant);
   console.log(`✅ User2 selected conversation: ${sender.name}`);

   const lastSentMsgId = await SEND.sendAndVerifyAndGetLastMessageId(receiver, type, rootMsg);
   console.log(`✅ User2 sent and verified root message, then got last root message ID: ${lastSentMsgId}`);

   const oldUnread = await receiver.bar.getUnreadMessageCount(sender.name!);
   console.log(`✅ User2 got old unread message count from ${sender.name}: ${oldUnread}`);
   await receiver.page.waitForTimeout(timeout);   

   await CHAT.switchToOtherConv(receiver, sender, tenant);
   console.log(`✅ User2 switched to other conversation`);

   await minimizeApp(receiver.app);
   console.log('✅ User2 minimized app');
   
   return { rootMessageId: lastSentMsgId, oldUnread };
}

async function performReactOnMsg(
   user: ChatUser, 
   action: MessageReaction, 
   emojiObj: EmojiObj, 
   emojiIdx: number,
   rootMsgId: string,
   timeout: number = TIMEOUT
): Promise<string>{
   await scrollToBottom(user.page);
   await user.chat.composers.focusMessage();
   const emoji = emojiObj.emojis[emojiIdx];
   const rootMsg = user.chat.messages.getMessageById(rootMsgId);
   // Bubble when hover on root message
   const bubbleGroupOf = rootMsg.locator('xpath=ancestor::*[contains(@class, "group/bubble")][1]').first();
   // Fast reaction button
   const popover = user.page.locator('[data-radix-popper-content-wrapper], [role="menu"], [role="dialog"]');
   const fastReactBtn = getButtonByName(bubbleGroupOf, MessageLabels.addReaction, true);
   // More Reaction button
   const moreReactBtn = getButtonByName(user.page, MessageLabels.moreReactions, true);

   rootMsg.scrollIntoViewIfNeeded();
   if (action == 'reactFast'){
      await longHover(rootMsg);
      await longHover(fastReactBtn);
      popover.last();
      const target = popover.getByText(emoji).first();
      await target.hover();
      await target.click();
   } else {
      await longHover(rootMsg);
      await longHover(fastReactBtn);
      await click(moreReactBtn);
      await user.chat.composers.selectEmoji(emojiObj);
   }
   await user.chat.composers.focusMessage();
   //assertToBeVisible(rootMsg.locator(`button[aria-label*="${emoji}"]`));
   user.page.waitForTimeout(timeout);
   return emoji;
}

async function reactOnMsgAndVerifyInConv(// need to flexible count reaction
   sender: ChatUser, 
   receiver: ConversationRef, 
   action: MessageReaction, 
   emojiObj: EmojiObj,
   emojiIdx: number,
   rootMsgId: string, 
   tenant?: string
): Promise<string>{// check root cause to lag app??? temporary fix: switch to other conv
   await CHAT.switchToOtherConv(sender, receiver, tenant);
   await CHAT.selectConversation(sender, receiver, tenant);
   console.log(`✅ User1 selected conversation: ${receiver.name}`);

   let lastEmoji = await performReactOnMsg(sender, action, emojiObj, emojiIdx, rootMsgId);
   console.log(`✅ User1 reacted on root message`);
   await CHAT.takeChatScreenShot(sender, `${RUN_TAG}-react-on-${rootMsgId} | Verify last emoji on message`);

   return lastEmoji;
}

async function verifyReceivedReactionOnMsg(
   receiver: ChatUser, 
   sender: ConversationRef, 
   rootMsgId: string,
   lastEmoji: string,
   expEmoji: string,
   tenant?: string
): Promise<void>{
   await CHAT.switchToOtherConv(receiver, sender, tenant);

   await CHAT.selectConversation(receiver, sender, tenant);
   console.log(`✅ User2 selected conversation: ${sender.name}`);

   await scrollToBottom(receiver.page);
   await receiver.chat.composers.focusMessage();

   const rootMsg = receiver.chat.messages.getMessageById(rootMsgId);
   await hover(rootMsg);
   expect(lastEmoji).toBe(expEmoji);
   console.log(`✅ User2 verified last emoji: ${lastEmoji}`);
   await CHAT.takeChatScreenShot(receiver, `${RUN_TAG}-react-on-${rootMsgId} | Verify last received emoji`);

   await CHAT.switchToOtherConv(receiver, sender, tenant);
   console.log(`✅ User2 switched to other conversation`);
}