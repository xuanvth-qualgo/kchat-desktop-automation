import { runCallTest } from '../_shared/scenario';
import { CALLEE } from '../_shared/base';

runCallTest({
   scenario: {
      id:       'CALL-D-05',
      name:     'Accepted call: callee updates settings (Camera <> Default), callee ends after 60s',
      feature:  '[Direct] Voice call',
      severity: 'normal',
      context:  'Direct',
      hostConv: { name: CALLEE },
      incomingTitleNeedle: 'autotest01',
   },
   kind: 'voice',
   variant: {
      kind:        'accept-settings-end',
      durationMs:  60_000,
      endedBy:     'callee',
      settingNote: 'Camera <> Default',
   },
});
