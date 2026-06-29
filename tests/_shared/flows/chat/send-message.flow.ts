import { expect, Locator } from '@playwright/test';
import type { ChatUser } from '../../../_shared/fixtures/chat.fixture';
import { minimizeApp, restoreApp, assertToBeVisible } from '../../../../src/utils/actions';
import { ConversationRef } from '../../../../src/pages/common/SidebarPage';
import { EmojiObj } from '../../../../src/pages/chat/sections/components/EmojiPicker';
import type { MessageObj, MessageAction } from '../../../_shared/data/chat.data';
import { RUN_TAG } from '../../../../src/utils/helpers';
import { MessageActionLabels } from '../../../../src/_generated/chat.element';
import { scrollToBottom } from '../../../../src/utils/ui';
import { ChatFlow as CHAT } from './chat.flow';

const TIMEOUT = 200;

export type MessageType = MessageObj['type'];

export const MessageActionMap: Record<MessageAction, string> = {
   'reply': MessageActionLabels.reply,
   'forward': MessageActionLabels.forward,
   'edit': MessageActionLabels.edit,
   'delete': MessageActionLabels.delete,
   'copyText': MessageActionLabels.copyText,
   'copyLink': MessageActionLabels.copyLink,
   'copyImage': MessageActionLabels.copyImage,
   'createThread': MessageActionLabels.createThread,
   'openThread': MessageActionLabels.openThread,
};

export type ActionKey = keyof typeof MessageActionMap;

export const SendMessageFlow = {
    verifyAndGetLastMessageId,
    sendMessageByType,
    sendAndVerifyAndGetLastMessageId,
    prepareForSendMsg,
    sendMsgInConv,
    verifyReceivedMsg
}

async function verifyAndGetLastMessageId(// only send one time, one row, default TEXT
   user: ChatUser, 
   type: MessageType = 'text',
   message?: string | number | EmojiObj, 
   caption?: string,
   action?: ActionKey,
   timeout: number = TIMEOUT
): Promise<string>{
   await scrollToBottom(user.page); 
   await user.chat.composers.focusMessage();

   let lastMessage: Locator = user.page.locator('div').last();
   let messageStr = message as string;
   if (type === 'emoji') messageStr = '';
   if ((type === 'image' || type === 'video' || type === 'file') && caption) {
         messageStr = caption;
         lastMessage = user.chat.messages.getTextMessage(messageStr).last();
   } else {
      switch (type){
         case 'text':
         case 'mention':
         case 'emoji':
            lastMessage = user.chat.messages.getTextMessage(messageStr).last();
            break;
         case 'link':
            lastMessage = user.chat.messages.getLinkMessage(messageStr).last();
            break;
         case 'image':
         case 'video':
            lastMessage = user.chat.messages.getMediaMessage(messageStr).last();// fileName
            break;
         case 'file':
            lastMessage = user.chat.messages.getFileMessage(messageStr).last();// fileName
            break;
         case 'voice':
            lastMessage = user.chat.messages.getVoiceMessage().last();
            break;
         case 'gif':
         case 'sticker':     
            lastMessage = user.chat.messages.getAnimationMessage().last();
            break;
      }
   }
   if (action === 'createThread' || action === 'openThread') {
      lastMessage = user.page.locator(`//span[normalize-space(.)="${messageStr}"]/ancestor::div[@data-message-id][1]`).last();
   } 

   if (type !== 'emoji' ) await assertToBeVisible(lastMessage, timeout);

   let messageId = undefined;
   if (type === 'gif' || type === 'sticker'){
      messageId = await lastMessage.locator('xpath=ancestor::*[@data-message-id][1]').getAttribute('data-message-id');
   } else { 
      messageId = await lastMessage.getAttribute('data-message-id');
   }

   await user.page.waitForTimeout(timeout);
   return messageId ?? '';
}

async function sendMessageByType(// only send one time, one row, default TEXT
   sender: ChatUser, 
   type: MessageType = 'text',
   message: string | number | EmojiObj, 
   filePath?: string,
   caption?: string,// only media, file, voice
   timeout: number = TIMEOUT
): Promise<void>{   
   const ipMessage = ['image', 'video', 'file'].includes(type) ? filePath : message;
   switch (type) {
      case 'text':
      case 'link':
         await sender.chat.composers.inputMessage(ipMessage as string);
         break;
      case 'mention':
         await sender.chat.composers.typeMessage(ipMessage as string);
         break;
       case 'emoji':
         await sender.chat.composers.selectEmoji(ipMessage as EmojiObj);
         break;
      case 'image':
      case 'video':
         await sender.chat.composers.attachMedia(ipMessage as string);
         if (caption) await sender.chat.composers.inputMessage(caption);
         break;
      case 'file':
         await sender.chat.composers.attachFile(ipMessage as string);
         if (caption) await sender.chat.composers.inputMessage(caption);
         break;
      case 'voice':
         await sender.chat.composers.openVoiceOption();
         await sender.chat.composers.startVoice();
         await sender.page.waitForTimeout(ipMessage as number);
         await sender.chat.composers.pauseVoice();
         await sender.chat.composers.sendVoice();
         break;
      case 'gif':
         await sender.chat.composers.sendGif(ipMessage as string);
         break;
      case 'sticker':
         await sender.chat.composers.sendSticker(ipMessage as string);
         break;
   }
   if (type !== 'voice' && type !== 'gif' && type !== 'sticker' ) await sender.chat.composers.clickSend();
   if (await sender.chat.composers.hasFailedBubble()) {
      await CHAT.takeChatScreenShot(sender, 'failed_bubble_before_retry');
      await sender.chat.composers.clickRetryOnFailedBubble();
   }
   sender.page.waitForTimeout(timeout!);
}

async function sendAndVerifyAndGetLastMessageId(// only send one time, one row, default TEXT
   sender: ChatUser, 
   type: MessageType = 'text',
   message: string | number | EmojiObj,
   filePath?: string,
   caption?: string,// only media, file
   action?: ActionKey,
   timeout: number = TIMEOUT
): Promise<string>{   
   await sendMessageByType(sender, type, message, filePath, caption);
   const sentMessageId = await verifyAndGetLastMessageId(sender, type, message, caption!, action!, timeout);
   return sentMessageId;
}

// STEP 1: Receiver: select conv >> switch to other conv >> get old unread >> minimize app
async function prepareForSendMsg(
   receiver: ChatUser, 
   sender: ConversationRef, 
   tenant?: string,
   timeout: number = TIMEOUT
): Promise<number>{
   await CHAT.selectConversation(receiver, sender, tenant);
   console.log(`✅ User2 selected conversation: ${sender.name}`);

   const oldUnread = await receiver.bar.getUnreadMessageCount(sender.name!);
   console.log(`✅ User2 got old unread message count from ${sender.name}: ${oldUnread}`);
   await receiver.page.waitForTimeout(timeout);   

   await CHAT.switchToOtherConv(receiver, sender, tenant);
   console.log(`✅ User2 switched to other conversation`);

   console.log(`✅ User2 minimized app`);
   await minimizeApp(receiver.app);

   return oldUnread;
}

// STEP 2: Sender: select conv >> send message >> assert message visible >> return last sent message id
async function sendMsgInConv(
   sender: ChatUser, 
   receiver: ConversationRef, 
   type: MessageType, 
   message: string | number | EmojiObj, 
   filePath?: string, 
   caption?: string,
   tenant?: string
): Promise<string>{// check root cause to lag app??? temporary fix: switch to other conv
   //await CHAT.switchToOtherConv(sender, receiver, tenant);
   await CHAT.selectConversation(sender, receiver, tenant);
   console.log(`✅ User1 selected conversation: ${receiver.name}`);

   const lastSentMsgId = await sendAndVerifyAndGetLastMessageId(sender, type, message, filePath, caption);
   console.log(`✅ User1 sent and verified message, then got last sent message ID: ${lastSentMsgId}`);
   await CHAT.takeChatScreenShot(sender, `${RUN_TAG}-send-${type} | Verify last sent message`);

   return lastSentMsgId;
}

// STEP 3: Receiver: restore app >> take screenshot >> assert actual unread count >> click conv >> take screenshot
async function verifyReceivedMsg(
   receiver: ChatUser, 
   sender: ConversationRef, 
   type: MessageType, 
   message: string | '', 
   expUnread: number, 
   expLastMsgId: string, 
   caption?: string,
   tenant?: string
): Promise<void>{
   await restoreApp(receiver.app);
   console.log(`✅ User2 re-opened app`);

   await CHAT.switchToOtherConv(receiver, sender, tenant);
   
   let actualUnread = 0;
   actualUnread = await receiver.bar.getUnreadMessageCount(sender.name!);
   expect(actualUnread).toBe(expUnread);
   console.log(`✅ User2 verified actual unread message count from ${sender.name}: ${actualUnread}`);
   await CHAT.takeChatScreenShot(receiver, `${RUN_TAG}-send-${type} | Verify actual unread message count`);

   await CHAT.selectConversation(receiver, sender, tenant);
   console.log(`✅ User2 selected conversation: ${sender.name}`);

   let lastReceivedMsgId = '';
   lastReceivedMsgId = await verifyAndGetLastMessageId(receiver, type, message, caption);
   expect(lastReceivedMsgId).toBe(expLastMsgId);
   
   console.log(`✅ User2 verified message, then got last received message ID: ${lastReceivedMsgId}`);
   await CHAT.takeChatScreenShot(receiver, `${RUN_TAG}-send-${type} | Verify last received message`);

   await CHAT.switchToOtherConv(receiver, sender, tenant);
   console.log(`✅ User2 switched to other conversation`);
}