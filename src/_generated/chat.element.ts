export const ComposerLabels = {
   messageInput: 'Message input',
   sendMessage:  'Send message',
   retryRe:      /^Retry$/i,
} as const;

export const AttachmentLabels = {
   open:         'Attach files',
   photosVideos: 'Photos & Videos',
   files:        'Files',
   voiceRecord:  'Voice Recording',
} as const;

export const VoiceLabels = {
   start:  'Start recording',
   pause:  'Pause recording',
   send:   'Send',
} as const;

export const EmojiLabels = {
   open:   'Open emoji picker',
   dialog: 'Emoji picker',
   search: 'Search',
} as const;

export const AnimationLabels = {
   open:           'Open GIF & sticker picker',
   tabGifs:        'GIFs',
   tabStickers:    'Stickers',
   searchGifs:     'Search GIFs',
   searchStickers: 'Search stickers',
} as const;

export const MessageLabels = {
   moreActions:    'More actions',
   addReaction:    'Add reaction',
   moreReactions:  'Add more reactions',
   playAudio:      'Play audio',
   downloadPrefix: 'Download',
   forwarded:      'Forwarded',
   edited:         'edited',
   deleted:        'This message was deleted',
} as const;

export const BubbleSelectors = {
   article:           '[role="article"][data-message-id]',
   articleNoRightbar: 'xpath=.//*[@role="article" and @data-message-id and not(ancestor::*[@data-rightbar-id])]',
   bubbleGroup:       'xpath=ancestor::*[contains(@class, "group/bubble")][1]',
   clusterAncestor:   'xpath=ancestor::*[starts-with(@aria-label, "Message cluster from ")][1]',
   replyPreview:      '[role="button"][aria-label^="Reply to "]',
   timeElem:          'time[datetime]',
   tooltip:           '[role="tooltip"]',
   stickerImg:        'img[alt^="kchat-sticker"]',
   articleById:       (id: string)   => `[role="article"][data-message-id="${id}"]`,
   articleByIdXpath:  (id: string)   => `xpath=.//*[@role="article" and @data-message-id="${id}" and not(ancestor::*[@data-rightbar-id])]`,
   msgContainer:      '[aria-label^="Messages for conversation"] [data-testid="virtuoso-scroller"]',
} as const;

export const BubbleLabels = {
   clusterPrefix:   'Message cluster from',
   replyToPrefix:   'Reply to',
   reactionSuffix:  'reaction',
   viewRepliesRe:   /^View \d+ replies?$/,
   mentionPrefix:   'Mention',
} as const;

export const AvatarSelectors = {
   wrapper:  '[data-slot="avatar"]',
   image:    '[data-slot="avatar"] img',
   fallback: '[data-slot="avatar-fallback"]',
} as const;

export const MentionLabels = {
   suggestions: 'Mention suggestions',
} as const;

export const MentionSelectors = {
   listbox: '[role="listbox"][aria-label="Mention suggestions"]',
   option:  '[role="listbox"][aria-label="Mention suggestions"] [role="option"]',
} as const;

export const ThreadSelectors = {
   panelRoot: '[data-rightbar-id="thread-replies-rightbar"]',
   rightbar:  '[data-rightbar-id]',
} as const;

export const ThreadLabels = {
   close: 'Close',
} as const;

export const MessageActionLabels = {
   reply:        'Reply',
   createThread: 'Create thread',
   openThread:   'Open thread',
   edit:         'Edit',
   forward:      'Forward',
   copyText:     'Copy text',
   copyLink:     'Copy link',
   copyImage:    'Copy image',
   delete:       'Delete',
} as const;

export const DialogSelectors = {
   any:            '[role="dialog"]',
   alertContent:   '[role="dialog"][data-slot="dialog-content"]',
   popover:        '[data-radix-popper-content-wrapper], [role="menu"], [role="dialog"]',
} as const;

export const ForwardDialogLabels = {
   title:           'Forward to',
   search:          'Search',
   cancel:          'Cancel',
   confirm:         'Forward',
   targetPrefix:    'Forward message to',
   communityPrefix: 'Community:',
} as const;

export const DeleteAlertLabels = {
   title: 'Delete this message?',
   cancel: 'Cancel',
   confirm: 'Delete Message',
} as const;