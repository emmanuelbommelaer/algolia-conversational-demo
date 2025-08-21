import { test, expect } from '@playwright/test';

test.describe('Debug Filter Display', () => {
  test('Debug why filter buttons are not showing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(6000);

    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Check agent message
    const agentMessage = agentPanel.locator('.text-gray-800');
    const messageText = await agentMessage.textContent();
    console.log('Agent message:', messageText);
    
    // Check for any buttons in agent panel
    const allButtons = agentPanel.locator('button');
    const allButtonCount = await allButtons.count();
    console.log(`Total buttons in agent panel: ${allButtonCount}`);
    
    // Check each button
    for (let i = 0; i < allButtonCount; i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      console.log(`Button ${i}: "${buttonText}"`);
    }
    
    // Check for filter options container
    const filterContainer = agentPanel.locator('.bg-white.rounded-lg.shadow-sm');
    const containerCount = await filterContainer.count();
    console.log(`Filter containers: ${containerCount}`);
    
    // Check entire agent panel HTML structure
    const agentHTML = await agentPanel.innerHTML();
    console.log('Agent panel HTML (first 1000 chars):');
    console.log(agentHTML.substring(0, 1000));
    
    // Check if loading indicator is showing
    const loadingIndicator = agentPanel.locator('.animate-bounce');
    const isLoading = await loadingIndicator.isVisible();
    console.log(`Agent is loading: ${isLoading}`);
    
    // Check for facet options specifically
    const facetOptions = agentPanel.locator('.space-y-2 button, .grid button, [data-testid="facet-options"] button');
    const facetCount = await facetOptions.count();
    console.log(`Facet option buttons: ${facetCount}`);
  });
});