import { runCallTest } from '../_shared/scenario';

const GROUP = 'Automation Test Group';

runCallTest({
   scenario: {
      id:       'CALL-G-05',
      name:     `Accepted group call: callee updates settings (Default <> Default), callee ends after 60s — ${GROUP}`,
      feature:  '[Group] Voice call',
      severity: 'normal',
      context:  'Group',
      hostConv: { name: GROUP },
      incomingTitleNeedle: GROUP,
   },
   kind: 'voice',
   variant: {
      kind:        'accept-settings-end',
      durationMs:  60_000,
      endedBy:     'callee',
      settingNote: 'Default <> Default',
   },
});
