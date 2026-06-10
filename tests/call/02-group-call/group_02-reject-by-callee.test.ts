import { runCallTest } from '../_shared/scenario';

const GROUP = 'Automation Test Group';

runCallTest({
   scenario: {
      id:       'CALL-G-02',
      name:     `Group voice call ends when callee declines after 29s ringing — ${GROUP}`,
      feature:  '[Group] Voice call',
      severity: 'critical',
      context:  'Group',
      hostConv: { name: GROUP },
      incomingTitleNeedle: GROUP,
   },
   kind: 'voice',
   variant: { kind: 'callee-decline-29s' },
});
