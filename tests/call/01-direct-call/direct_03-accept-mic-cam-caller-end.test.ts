import { runCallTest } from '../_shared/scenario';
import { CALLEE } from '../_shared/base';

runCallTest({
   scenario: {
      id:       'CALL-D-03',
      name:     'Accepted call: caller mutes mic, callee turns camera on, caller ends after 60s',
      feature:  '[Direct] Voice call',
      severity: 'critical',
      context:  'Direct',
      hostConv: { name: CALLEE },
      incomingTitleNeedle: 'autotest01',
   },
   kind: 'voice',
   variant: {
      kind:       'accept-toggle-end',
      callerMic:  'off',
      calleeCam:  'on',
      durationMs: 60_000,
      endedBy:    'caller',
   },
});
