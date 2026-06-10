export type EmojiObj = { category?: string; emojis: string[] };

export type MessageTarget =
   | { type: 'text';    value: string;  id?: string }
   | { type: 'caption'; value: string;  id?: string }
   | { type: 'emoji';   value: string;  id?: string }
   | { type: 'mention'; value: string;  id?: string }
   | { type: 'link';    value: string;  id?: string }
   | { type: 'image';   value: string;  id?: string }
   | { type: 'video';   value?: string; id?: string }
   | { type: 'file';    value: string;  id?: string }
   | { type: 'voice';   value?: string; id?: string }
   | { type: 'gif';     value: string;  id?: string }
   | { type: 'sticker'; value: string;  id?: string };

export type MessageType = MessageTarget['type'];

export type ChatAction =
   | 'reply'
   | 'forward'
   | 'edit'
   | 'delete'
   | 'copyText'
   | 'copyLink'
   | 'copyImage'
   | 'createThread'
   | 'openThread'
   | 'reactFast'
   | 'reactMore';

export type MenuAction = Exclude<ChatAction, 'reactFast' | 'reactMore'>;

export interface MessageSender {
   sendText            (text: string):                                     Promise<void>;
   sendTexts           (texts: string[]):                                  Promise<void>;
   sendMultilineText   (lines: string[]):                                  Promise<void>;
   selectMention          (text: string):                                  Promise<void>;
   selectMentions         (texts: string[]):                               Promise<void>;
   selectMultilineMention (lines: string[]):                               Promise<void>;

   sendEmoji           (obj: EmojiObj):                                    Promise<void>;
   sendEmojis          (objs: EmojiObj[]):                                 Promise<void>;
   sendEmojisInOneTime (objs: EmojiObj[]):                                 Promise<void>;

   sendMedia           (path: string, caption?: string):                   Promise<void>;
   sendMedias          (paths: string[], captions?: string[]):             Promise<void>;
   sendMediasInOneTime (paths: string[], caption?: string):                Promise<void>;

   sendFile            (path: string, caption?: string):                   Promise<void>;
   sendFiles           (paths: string[], captions?: string[]):             Promise<void>;
   sendFilesInOneTime  (paths: string[], caption?: string):                Promise<void>;

   sendVoice           (duration: number, caption?: string):               Promise<void>;
   sendVoices          (durations: number[], captions?: string[]):         Promise<void>;
   sendVoicesInOneTime (durations: number[], caption?: string):            Promise<void>;

   sendGif             (name: string):                                     Promise<void>;
   sendGifs            (names: string[]):                                  Promise<void>;
   sendSticker         (name: string):                                     Promise<void>;
   sendStickers        (names: string[]):                                  Promise<void>;
}

export interface MessageVerifier {
   verifyLastMessage   (expected?: string, type?: MessageType, quoteOf?: string, timeout?: number): Promise<void>;
   verifyMessageById   (id: string, timeout?: number):                     Promise<void>;
   verifyReplyPreview  (rootText?: string, timeout?: number):              Promise<void>;
}

export interface MessageActions {
   do(action: ChatAction, target: MessageTarget, opts?: { emoji?: EmojiObj }): Promise<void>;
   reactMany(target: MessageTarget, emojis: readonly EmojiObj[], mode?: 'fast' | 'more'): Promise<void>;
}
