import { runCallTest } from '../_shared/scenario';

const GROUP = 'Automation Test Group';

runCallTest({
   scenario: {
      id:       'CALL-G-03',
      name:     `Accepted group call: caller mutes mic, callee turns camera on, caller ends after 60s — ${GROUP}`,
      feature:  '[Group] Voice call',
      severity: 'critical',
      context:  'Group',
      hostConv: { name: GROUP },
      incomingTitleNeedle: GROUP,
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
