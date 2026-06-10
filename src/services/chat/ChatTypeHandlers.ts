import { Locator } from '@playwright/test';
import { ChatMessages } from '../../pages/chat/ChatMessages';
import { ChatView }     from './ChatView';
import { MessageType }  from './types';

export interface MessageTypeHandler {
   locator(messages: ChatMessages, value: string | undefined): Locator;
   verify(view: ChatView, value: string | undefined, timeout?: number): Promise<void>;
}

const textHandler: MessageTypeHandler = {
   locator: (m, v) => m.getTextMessage(v!),
   verify:  (v, val, t) => v.verifyLastText(val!, t),
};

const animationHandler: MessageTypeHandler = {
   locator: (m, v) => m.getAnimationMessage(v!),
   verify:  (v, val, t) => v.verifyLastAnimation(val!, t),
};

const HANDLERS: Record<MessageType, MessageTypeHandler> = {
   text:    textHandler,
   caption: textHandler,
   emoji:   textHandler,
   mention: textHandler,
   link:    { locator: (m, v) => m.getLinkMessage(v!),    verify: (v, val, t) => v.verifyLastLink   (val!, t) },
   image:   { locator: (m, v) => m.getImageMessage(v!),   verify: (v, val, t) => v.verifyLastImage  (val!, t) },
   video:   { locator: (m)    => m.getVideoMessage(),     verify: (v, _v,  t) => v.verifyLastVideo  (t)       },
   file:    { locator: (m, v) => m.getFileMessage(v!),    verify: (v, val, t) => v.verifyLastFile   (val!, t) },
   voice:   { locator: (m)    => m.getVoiceMessage(),     verify: (v, _v,  t) => v.verifyLastVoice  (t)       },
   gif:     animationHandler,
   sticker: animationHandler,
};

export const handlerFor = (type: MessageType): MessageTypeHandler => HANDLERS[type];
