import { test, expect } from '@playwright/test';

test.describe('Always Show Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Wait for agent response
  });

  test('should always show filter options on initial load', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Check for filter options (buttons with counts)
    const filterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    const buttonCount = await filterButtons.count();
    
    console.log(`Found ${buttonCount} filter option buttons on welcome`);
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should continue showing filter options after selecting one', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Click first filter option
    const firstButton = agentPanel.locator('button').filter({ hasText: /\d+/ }).first();
    if (await firstButton.isVisible()) {
      await firstButton.click();
      
      // Wait for response
      await page.waitForTimeout(4000);
      
      // Should still have filter options
      const newFilterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
      const newButtonCount = await newFilterButtons.count();
      
      console.log(`Found ${newButtonCount} filter option buttons after first selection`);
      expect(newButtonCount).toBeGreaterThan(0);
    }
  });

  test('should keep showing filters until search is refined', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Make multiple filter selections
    for (let i = 0; i < 2; i++) {
      const filterButton = agentPanel.locator('button').filter({ hasText: /\d+/ }).first();
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Should still have some filter options (unless we have very few results)
    const finalFilterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    const finalButtonCount = await finalFilterButtons.count();
    
    console.log(`Found ${finalButtonCount} filter option buttons after multiple selections`);
    
    // Check result count to see if we expect filters
    const resultText = agentPanel.locator('text=/\\d+ properties/').first();
    if (await resultText.isVisible()) {
      const text = await resultText.textContent();
      const resultCount = parseInt(text?.match(/(\d+) properties/)?.[1] || '0');
      
      console.log(`Current result count: ${resultCount}`);
      
      // If more than 5 results, we should definitely have filters
      if (resultCount > 5) {
        expect(finalButtonCount).toBeGreaterThan(0);
      }
    }
  });
});