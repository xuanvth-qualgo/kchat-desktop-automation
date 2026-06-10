import { runCallTest } from '../_shared/scenario';
import { CALLEE } from '../_shared/base';

runCallTest({
   scenario: {
      id:       'CALL-D-04',
      name:     'Accepted call: caller turns camera on, callee mutes mic, callee ends after 60s',
      feature:  '[Direct] Voice call',
      severity: 'critical',
      context:  'Direct',
      hostConv: { name: CALLEE },
      incomingTitleNeedle: 'autotest01',
   },
   kind: 'voice',
   variant: {
      kind:       'accept-toggle-end',
      callerCam:  'on',
      calleeMic:  'off',
      durationMs: 60_000,
      endedBy:    'callee',
   },
});
