import { runCallTest } from '../_shared/scenario';

const GROUP = 'Automation Test Group';

runCallTest({
   scenario: {
      id:       'CALL-G-04',
      name:     `Accepted group call: caller turns camera on, callee mutes mic, callee ends after 60s — ${GROUP}`,
      feature:  '[Group] Voice call',
      severity: 'critical',
      context:  'Group',
      hostConv: { name: GROUP },
      incomingTitleNeedle: GROUP,
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
