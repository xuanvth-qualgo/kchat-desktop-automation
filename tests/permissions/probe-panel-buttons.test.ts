// Manual probe to populate src/domain/permissions.ts panelButtonsByRole.
//
// Workflow:
//   1. Login as the role you want to probe (owner / admin / member / guest).
//   2. Run only this test: npx playwright test tests/permissions/probe-panel-buttons.test.ts --headed
//   3. Open allure-report → see the "Visible buttons" parameter for that run.
//   4. Copy the printed list into panelButtonsByRole[<role>] in
//      src/domain/permissions.ts.
//
// This is a probe, not a regression test — it always passes.

import { test } from '../../src/core/fixtures';
import { allure } from 'allure-playwright';
import { ConversationPanelPage } from '../../src/pages/common/ConversationPanelPage';
import { log } from '../../src/core/log';

test('probe: list visible toolbar buttons in the current conversation', async ({ mainWindow }) => {
   const panel = new ConversationPanelPage(mainWindow);
   const visible = await panel.availableButtons();
   const sorted = [...visible].sort();
   log.info('[probe] panel buttons:', JSON.stringify(sorted));
   await allure.parameter('Visible buttons', JSON.stringify(sorted));
});
