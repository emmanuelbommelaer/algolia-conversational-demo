import { test, expect } from '@playwright/test';

test('Quick error message check', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for error to occur
  await page.waitForTimeout(8000);
  
  // Check agent panel content
  const agentPanel = page.locator('[data-testid="agent-panel"]');
  const content = await agentPanel.textContent();
  console.log('Agent panel content:', content);
  
  // Look for error message specifically
  const errorMessage = page.locator('text=/⚠️.*Agent service unavailable/i');
  const found = await errorMessage.isVisible();
  console.log('Error message visible:', found);
  
  if (found) {
    const errorText = await errorMessage.textContent();
    console.log('Error message text:', errorText);
  }
});