import { expect } from '@playwright/test';
import type { ChatUser } from '../../../_shared/fixtures/chat.fixture';
import { minimizeApp, restoreApp, hover, rightClick, longClick, getMenuItemByName } from '../../../../src/utils/actions';
import { ConversationRef } from '../../../../src/pages/common/SidebarPage';
import { EmojiObj } from '../../../../src/pages/chat/sections/components/EmojiPicker';
import { PASTE_SHORTCUT } from '../../../_shared/data/chat.data';
import { RUN_TAG } from '../../../../src/utils/helpers';
import { scrollToBottom } from '../../../../src/utils/ui';
import { MessageType, MessageActionMap, ActionKey, SendMessageFlow as SEND } from './send-message.flow';
import { ChatFlow as CHAT } from './chat.flow';

const TIMEOUT = 200;

export const MoreActionFlow = {
    prepareForActionOnMsg,
    actionOnMsgInConv,
    copyPasteInConv,
    forwardMsgInConv,
    deleteMsgInConv,
    verifyReceivedActionOnMsg
}


// STEP 1: Receiver: select conv >> send root message >> switch to other conv >> get old unread count >> minimize app
async function prepareForActionOnMsg(
   receiver: ChatUser, 
   sender: ConversationRef, 
   type: MessageType, 
   rootMsg: string | number | EmojiObj, 
   fileName?: string,
   caption?: string,
   tenant?: string,
   timeout: number = TIMEOUT
): Promise<{
   rootMessageId: string;
   oldUnread: number;
}>{
   await CHAT.selectConversation(receiver, sender, tenant);
   console.log(`✅ User2 selected conversation: ${sender.name}`);

   const lastSentMsgId = await SEND.sendAndVerifyAndGetLastMessageId(receiver, type, rootMsg, fileName, caption);
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


/* Reply, Edit, Create thread, Open Thread, Copy text, Copy Image, Copy Link */
async function openActionComposer(
   user: ChatUser, 
   action: ActionKey, 
   rootMsgId: string, 
   timeout = TIMEOUT
): Promise<void> {
   await scrollToBottom(user.page);
   await user.chat.composers.focusMessage();
   if (!MessageActionMap[action] || action === 'forward' || action === 'delete') {
      throw new Error(`Action ${action} not supported in this function`);
   }
   const rootMsg = user.chat.messages.getMessageById(rootMsgId);
   await hover(rootMsg);
   await rightClick(rootMsg);
   const actionMenu = await getMenuItemByName(user.page, MessageActionMap[action]);
   await longClick(actionMenu);
   await user.chat.composers.focusMessage();
   await user.page.waitForTimeout(timeout);
}

// STEP 2.1: Sender: select conv >> Reply, Edit, Create Thread, Open Thread
async function actionOnMsgInConv(
   sender: ChatUser, 
   receiver: ConversationRef, 
   action: ActionKey, 
   rootMsgId: string, 
   type: MessageType,
   message: string | number | EmojiObj, 
   filePath?: string,
   caption?: string,
   tenant?: string
): Promise<string>{// check root cause to lag app??? temporary fix: switch to other conv
   //await CHAT.switchToOtherConv(sender, receiver, tenant);
   await CHAT.selectConversation(sender, receiver, tenant);
   console.log(`✅ User1 selected conversation: ${receiver.name}`);

   await openActionComposer(sender, action, rootMsgId);
   console.log(`✅ User1 ${action} on root message`);

   let lastSentMsgId = '';
   
   if (action === 'createThread' || action === 'openThread') {
      await SEND.sendMessageByType(sender, type, message, filePath, caption);
      await sender.chat.thread.close();
      await CHAT.selectConversation(sender, receiver, tenant);
      await (sender.page.locator('//button[@aria-label="View 1 reply"]').last()).click();
      lastSentMsgId = await SEND.verifyAndGetLastMessageId(sender, type, message, caption, action);
      await sender.chat.thread.close();
   } else { 
      lastSentMsgId = await SEND.sendAndVerifyAndGetLastMessageId(sender, type, message, filePath, caption);
   }
   console.log(`✅ User1 sent and verified message, then got last message ID: ${lastSentMsgId} by action: ${action}`);
   await CHAT.takeChatScreenShot(sender, `${RUN_TAG}-${action}-on-${type} | Verify last message by ${action}`);
   
   return lastSentMsgId;
}

// STEP 2.2: Sender: select conv >> Copy text, Copy Image, Copy Link
async function copyPasteInConv(
   sender: ChatUser, 
   receiver: ConversationRef, 
   pasteTo: ConversationRef, 
   action: ActionKey, 
   rootMsgId: string, 
   type: MessageType,
   message: string, 
   tenant?: string
): Promise<string>{
   //await CHAT.switchToOtherConv(sender, receiver, tenant);
   await CHAT.selectConversation(sender, receiver, tenant);
   console.log(`✅ User1 selected conversation: ${receiver.name}`);

   await openActionComposer(sender, action, rootMsgId);
   console.log(`✅ User1 ${action} on root message`);

   await CHAT.selectConversation(sender, pasteTo, tenant);
   console.log(`✅ User1 selected conversation: ${pasteTo.name} to paste message`);

   await sender.chat.composers.focusMessage();
   if (action === 'copyText') await sender.chat.composers.inputMessage('COPIED ');
   await sender.page.keyboard.press(PASTE_SHORTCUT);
   await sender.chat.composers.clickSend();
   const lastPastedMsgId = await SEND.verifyAndGetLastMessageId(sender, type, message as string ?? '');
   console.log(`2.5. User1 pasted message and verified, got last pasted message ID: ${lastPastedMsgId}`);
   await CHAT.takeChatScreenShot(sender, `${RUN_TAG}-copy-${type}-${RUN_TAG} | Verify last pasted message`);

   return lastPastedMsgId;
}

/* Forward */
async function performForwardTo(
   user: ChatUser, 
   forwardTo: ConversationRef, 
   rootMsgId: string, 
   tenant?: string,
   timeout: number = TIMEOUT
): Promise<string> {
   await scrollToBottom(user.page);
   await user.chat.composers.focusMessage();
   const rootMsg = user.chat.messages.getMessageById(rootMsgId);
   await hover(rootMsg);
   await rightClick(rootMsg);
   const actionMenu = await getMenuItemByName(user.page, MessageActionMap['forward']);
   await longClick(actionMenu);
   await user.chat.composers.forwardTo(forwardTo.name!, forwardTo.parent!);
   await CHAT.selectConversation(user, forwardTo, tenant);
   const lastForwardedMsgId = await user.chat.messages.getLastMessageId();
   await user.page.waitForTimeout(timeout);
   return lastForwardedMsgId;
}

// STEP 2.3: Sender: select conv >> Forward
async function forwardMsgInConv(
   sender: ChatUser, 
   receiver: ConversationRef, 
   forwardTo: ConversationRef, 
   rootMsgId: string, 
   type: MessageType,
   message: string, 
   tenant?: string, 
): Promise<string>{// check root cause to lag app??? temporary fix: switch to other conv
   //await CHAT.switchToOtherConv(sender, receiver, tenant);
   await CHAT.selectConversation(sender, receiver, tenant);
   console.log(`✅ User1 selected conversation: ${receiver.name}`);

   const lastForwardedMsgId = await performForwardTo(sender, forwardTo, rootMsgId, tenant);
   console.log(`✅ User1 forwarded root message to: ${forwardTo.name}`);

   await SEND.verifyAndGetLastMessageId(sender, type, message);
   console.log(`✅ User1 verified message, then got last forwarded message ID: ${lastForwardedMsgId}`);
   await CHAT.takeChatScreenShot(sender, `${RUN_TAG}-forward-on-${type} | Verify last forwarded message`);
   
   return lastForwardedMsgId;
}

/* Delete */ 
async function performDeleteOn(
   user: ChatUser, 
   rootMsgId: string, 
   timeout: number = TIMEOUT
): Promise<string>{
   await scrollToBottom(user.page);
   await user.chat.composers.focusMessage();
   const rootMsg = user.chat.messages.getMessageById(rootMsgId);
   await hover(rootMsg);
   await rightClick(rootMsg);
   const actionMenu = await getMenuItemByName(user.page, MessageActionMap['delete']);
   await longClick(actionMenu);
   await user.chat.composers.confirmDelete();
   const lastDeletedMsg = await user.chat.messages.getLastMessageId();
   await user.page.waitForTimeout(timeout);
   return lastDeletedMsg;
}

// STEP 2.4: Sender: select conv >> Delete
async function deleteMsgInConv(
   sender: ChatUser, 
   receiver: ConversationRef, 
   rootMsgId: string, 
   tenant?: string
): Promise<string>{// check root cause to lag app??? temporary fix: switch to other conv
   //await CHAT.switchToOtherConv(sender, receiver, tenant);
   await CHAT.selectConversation(sender, receiver, tenant);
   console.log(`✅ User1 selected conversation: ${receiver.name}`);

   const lastDeletedMsgId = await performDeleteOn(sender, rootMsgId);
   console.log(`✅ User1 deleted root message`);

   await SEND.verifyAndGetLastMessageId(sender, 'text');
   console.log(`✅ User1 verified message, then got last deleted message ID: ${lastDeletedMsgId}`);
   await CHAT.takeChatScreenShot(sender, `${RUN_TAG}-delete-on-${rootMsgId} | Verify last deleted message`);

   return lastDeletedMsgId;
}

// STEP 3: Receiver: Verify received action on message
async function verifyReceivedActionOnMsg(
   receiver: ChatUser, 
   sender: ConversationRef, 
   action: ActionKey, 
   type: MessageType, 
   message: string, 
   expUnread: number, 
   expLastMsgId: string, 
   caption?: string,
   tenant?: string,
   timeout: number = TIMEOUT
): Promise<void>{
   await restoreApp(receiver.app);
   console.log(`✅ User2 re-opened app`);

   await CHAT.switchToOtherConv(receiver, sender, tenant);

   if (action ==='edit'|| action ==='delete') expUnread = 0;// skip actions because they don't increase unread count
   
   let actualUnread = 0;
   if (action !== 'createThread' && action !== 'openThread' && action !== 'edit' && action !== 'delete') {
      actualUnread = await receiver.bar.getUnreadMessageCount(sender.name);
      await receiver.page.waitForTimeout(timeout);
      expect(actualUnread).toBe(expUnread);
      console.log(`✅ User2 verified actual unread message count from ${sender.name}: ${actualUnread}`);
      await CHAT.takeChatScreenShot(receiver, `${RUN_TAG}-${action}-on-${type} | Verify actual unread message count`);
   } else {
      actualUnread = 0;
   }   

   await CHAT.selectConversation(receiver, sender, tenant);
   console.log(`✅ User2 selected conversation: ${sender.name}`);
   
   let lastReceivedMsgId = '';
   if (action === 'createThread' || action === 'openThread') {
      await CHAT.selectConversation(receiver, sender, tenant);
      await (receiver.page.locator(`//button[@aria-label="View ${expUnread} reply"]`).last()).click();
      lastReceivedMsgId = await SEND.verifyAndGetLastMessageId(receiver, type, message, caption, action);
      await receiver.chat.thread.close();
   } else {
      lastReceivedMsgId = await SEND.verifyAndGetLastMessageId(receiver, type, message, caption, action);
   }
   console.log(`✅ User2 verified message, then got last message ID: ${lastReceivedMsgId} by action: ${action}`);
   expect(lastReceivedMsgId).toBe(expLastMsgId);
   await CHAT.takeChatScreenShot(receiver, `${RUN_TAG}-${action}-on-${type} | Verify last received message`);

   await CHAT.switchToOtherConv(receiver, sender, tenant);
   console.log(`✅ User2 switched to other conversation`);
}