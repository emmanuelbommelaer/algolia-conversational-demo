import { test, expect } from '@playwright/test';

test.describe('Agent Integration', () => {
  test('should load agent guidance on page load', async ({ page }) => {
    // Listen for console messages to debug
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for initial agent response
    await page.waitForTimeout(5000);
    
    // Check that agent panel exists
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    await expect(agentPanel).toBeVisible();
    
    // Check for agent message (should not be "Loading..." after 5 seconds)
    const agentMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
    const messageText = await agentMessage.textContent();
    console.log('Agent message:', messageText);
    
    // The message should not be the initial loading state
    expect(messageText).not.toBe('Loading...');
    
    // Check if there are facet options displayed
    const facetButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    const buttonCount = await facetButtons.count();
    console.log(`Found ${buttonCount} facet option buttons`);
    
    // Should have at least some facet options
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should update guidance when clicking a facet', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Get initial message
    const initialMessage = await agentPanel.locator('.text-gray-800.leading-relaxed').textContent();
    console.log('Initial message:', initialMessage);
    
    // Click the first facet option
    const firstButton = agentPanel.locator('button').filter({ hasText: /\d+/ }).first();
    if (await firstButton.isVisible()) {
      await firstButton.click();
      
      // Wait for agent to respond
      await page.waitForTimeout(5000);
      
      // Check that message changed
      const newMessage = await agentPanel.locator('.text-gray-800.leading-relaxed').textContent();
      console.log('New message:', newMessage);
      
      expect(newMessage).not.toBe(initialMessage);
    }
  });
});