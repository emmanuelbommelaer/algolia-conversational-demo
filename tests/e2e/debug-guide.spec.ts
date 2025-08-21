import { test, expect } from '@playwright/test';

test.describe('Debug Guided Search', () => {
  test('should show page structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    
    // Log the HTML structure
    const html = await page.locator('body').innerHTML();
    console.log('Page HTML structure (first 2000 chars):');
    console.log(html.substring(0, 2000));
    
    // Check if app is rendered
    const appLayout = page.locator('[data-testid="app-layout"]');
    await expect(appLayout).toBeVisible();
    console.log('App layout is visible');
    
    // Check for any error messages
    const errors = page.locator('text=/error|Error|ERROR/');
    const errorCount = await errors.count();
    console.log(`Found ${errorCount} error elements`);
    
    // Check for agent panel specifically
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    const isVisible = await agentPanel.isVisible();
    console.log(`Agent panel visible: ${isVisible}`);
    
    if (!isVisible) {
      const allDivs = page.locator('div');
      const divCount = await allDivs.count();
      console.log(`Total divs on page: ${divCount}`);
      
      // Look for any element with "agent" in class or text
      const agentElements = page.locator('*').filter({ hasText: /agent|Agent|guide|Guide/ });
      const agentCount = await agentElements.count();
      console.log(`Elements with 'agent' or 'guide': ${agentCount}`);
    }
  });
});