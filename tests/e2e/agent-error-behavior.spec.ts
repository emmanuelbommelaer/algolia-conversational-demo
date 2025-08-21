import { test, expect } from '@playwright/test';

test.describe('Agent Error Behavior', () => {
  test('App visibly fails when agent API is unreachable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for the agent to fail and show error state
    await page.waitForTimeout(5000);
    
    // Check that the app shows error state instead of fallback
    const agentPanel = page.locator('[data-testid="agent-panel"]').first();
    await expect(agentPanel).toBeVisible();
    
    // Look for error indicators in the agent message
    const agentMessage = page.locator('text=/⚠️ Agent service unavailable/i');
    await expect(agentMessage).toBeVisible({ timeout: 8000 });
    
    // Check that error icon (❌) is displayed in the header
    const errorIcon = page.locator('div:has-text("❌")');
    await expect(errorIcon).toBeVisible();
    
    // Verify that no filter options are provided in error state
    const filterButtons = page.locator('button[class*="bg-"], button[class*="border-"]').filter({ hasText: /San Francisco|Berlin|Chicago|Paris|Houston|New York/ });
    await expect(filterButtons).toHaveCount(0);
    
    // Check that progress indicator shows error state
    const progressText = page.locator('text=Service unavailable');
    await expect(progressText).toBeVisible();
    
    // Verify search results still work (Algolia search independent of agent)
    const resultCards = page.locator('div[class*="card"], div[class*="result"]').filter({ hasText: /\$|bed|bath/ });
    await expect(resultCards.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✅ App correctly fails visibly when agent is unreachable');
  });

  test('Error state displays proper styling and messaging', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for error state
    await page.waitForTimeout(5000);
    
    // Check for error styling in progress bar (specifically target the progress bar)
    const progressBar = page.locator('[data-testid="agent-panel"] .bg-gradient-to-r.from-red-500');
    await expect(progressBar).toBeVisible();
    
    // Verify it has red gradient class
    const progressBarStyles = await progressBar.getAttribute('class');
    expect(progressBarStyles).toContain('from-red-500');
    
    // Check that stage shows 'error'
    const errorIcon = page.locator('div').filter({ hasText: '❌' });
    await expect(errorIcon).toBeVisible();
    
    console.log('✅ Error state displays proper styling and messaging');
  });
});