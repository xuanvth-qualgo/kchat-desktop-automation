export const CallLabels = {
   startVoiceBtn:        'Voice call',
   startVideoBtn:        'Video call',
   searchParticipantInput:   'Search participant',
   partcipantItemBtn:      'Open conversation with',
   confirmCallBtn:         'Call',

   cancelCallBtn: 'Cancel call',
   acceptCallBtn: 'Accept call',
   rejectCallBtn: 'Decline call',
   endCallBtn:     'End call',

   microBtn:        'Mute microphone',
   cameraBtn:       'Turn on camera',
   shareScreenBtn:  'Share screen',

   settingsBtn:     'Call settings',
   micDropdown:     'Microphone',
   cameraDropdown:  'Camera',
   speakerDropdown: 'Speaker',
   
   inviteParticipant: 'Add participants',
} as const;

export const CallSelectors = {
   urlOutgoing: /#\/call\/[^/]+\/outgoing\?/,
   urlIncoming: /#\/call\/[^/]+\/incoming\?/,
   urlInCall:   /#\/call\/[^/]+\/(active|joined|room)/,
} as const;
