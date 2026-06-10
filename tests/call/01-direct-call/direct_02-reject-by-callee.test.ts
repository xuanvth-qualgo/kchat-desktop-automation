import { runCallTest } from '../_shared/scenario';
import { CALLEE } from '../_shared/base';

runCallTest({
   scenario: {
      id:       'CALL-D-02',
      name:     'Voice call ends when callee declines after 29s ringing',
      feature:  '[Direct] Voice call',
      severity: 'critical',
      context:  'Direct',
      hostConv: { name: CALLEE },
      incomingTitleNeedle: 'autotest01',
   },
   kind: 'voice',
   variant: { kind: 'callee-decline-29s' },
});
