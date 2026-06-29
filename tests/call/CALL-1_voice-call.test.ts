import { test } from '../_shared/call.fixture';
import { stepAndRetry } from '../../src/utils/actions';
import { CallUtils } from '../_shared/call.helper';

export const ALLURE_BASE = {
   feature:     'Direct Call / Voice Call',
   severity:    'normal' as const,
   description: 'User1 initiates a voice call to User2. User2 verifies the incoming call notification and answers the call. Both users stay connected.',
};

test.describe('[Direct Call][Voice Call]', () => {
   test.describe.configure({ mode: 'serial' });

   test('[Direct Call][Voice Call] Start voice call → Reject right away', { tag: '@smoke' }, async ({ callUser1: u1, callUser2: u2 }) => {
      await CallUtils.defineAllureInfo({ ...ALLURE_BASE, story: 'Start voice call → Reject right away', tags: ['smoke'] });
      await stepAndRetry('1. User1 starts voice call', async () => { 
        
      });
      await stepAndRetry('2. User2 verifies incoming popup and rejects it', async () => { 
       
      });
      await stepAndRetry('3. User1, User2 verify history call in conversation', async () => { 
       
      });
   });

   test('[Direct Voice][Voice Call] Start voice call → Reject after 20s', async ({ callUser1: u1, callUser2: u2 }) => {
      await CallUtils.defineAllureInfo({ ...ALLURE_BASE, story: 'Start voice call → Reject after 20s', tags: ['smoke'] });
      await stepAndRetry('1. User1 starts voice call', async () => { 
        
      });
      await stepAndRetry('2. User2 verifies incoming popup, waits 20s then rejects it', async () => { 
       
      });
      await stepAndRetry('3. User1, User2 verify history call in conversation', async () => { 
       
      });
   });

   test('[Direct Voice][Voice Call] Start voice call → Accept right away → Action on microphone → End after 60s', async ({ callUser1: u1, callUser2: u2 }) => {
      await CallUtils.defineAllureInfo({ ...ALLURE_BASE, story: 'Start voice call → Accept right away → Action on microphone → End after 60s', tags: ['smoke'] });
      await stepAndRetry('1. User1 starts voice call', async () => { 
        
      });
      await stepAndRetry('2. User2 verifies incoming popup and accepts it', async () => { 
       
      });
      await stepAndRetry('3. User1, User2 verify call is active, then they turn off microphone', async () => { 
       
      });
      await stepAndRetry('4. After 60s active, User1 ends call', async () => { 
       
      });
      await stepAndRetry('5. User1, User2 verify history call in conversation', async () => { 
       
      });
   });

   test('[Direct Voice][Voice Call] Start voice call → Accept after 20s → Action on camera → End after 60s', async ({ callUser1: u1, callUser2: u2 }) => {
      await CallUtils.defineAllureInfo({ ...ALLURE_BASE, story: 'Start voice call → Accept after 20s → Action on camera → End after 60s', tags: ['smoke'] });
      await stepAndRetry('1. User1 starts voice call', async () => { 
        
      });
      await stepAndRetry('2. User2 verifies incoming popup and accepts it', async () => { 
       
      });
      await stepAndRetry('3. User1, User2 verify call is active, then they turn on camera', async () => { 
       
      });
      await stepAndRetry('4. After 60s active, User1 ends call', async () => { 
       
      });
      await stepAndRetry('5. User1, User2 verify history call in conversation', async () => { 
       
      });
   });

   test('[Direct Voice][Voice Call] Start voice call → Accept right away → Action on share screen → End after 60s', async ({ callUser1: u1, callUser2: u2 }) => {
      await CallUtils.defineAllureInfo({ ...ALLURE_BASE, story: 'Start voice call → Accept right away → Action on share screen → End after 60s', tags: ['smoke'] });
      await stepAndRetry('1. User1 starts voice call', async () => { 
        
      });
      await stepAndRetry('2. User2 verifies incoming popup and accepts it', async () => { 
       
      });
      await stepAndRetry('3. User1, User2 verify call is active, then they turn off microphone', async () => { 
       
      });
      await stepAndRetry('4. After 60s active, User1 ends call', async () => { 
       
      });
      await stepAndRetry('5. User1, User2 verify history call in conversation', async () => { 
       
      });
   });

   test('[Direct Voice][Voice Call] Start voice call → Accept after 20s → Action on settings → End after 60s', async ({ callUser1: u1, callUser2: u2 }) => {
      await CallUtils.defineAllureInfo({ ...ALLURE_BASE, story: 'Start voice call → Accept after 20s → Action on settings → End after 60s', tags: ['smoke'] });
      await stepAndRetry('1. User1 starts voice call', async () => { 
        
      });
      await stepAndRetry('2. User2 verifies incoming popup, waits 20s then accepts it', async () => { 
       
      });
      await stepAndRetry('3. User1, User2 verify call is active, then User1 updates microphone setting and User2 updates speaker setting', async () => { 
       
      });
      await stepAndRetry('4. After 60s active, User1 ends call', async () => { 
       
      });
      await stepAndRetry('5. User1, User2 verify history call in conversation', async () => { 
       
      });
   });
});
