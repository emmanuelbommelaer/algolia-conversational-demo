import { test, expect } from '@playwright/test';

test.describe('Console Debug', () => {
  test('should check for JavaScript errors', async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => {
      console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`PAGE ERROR: ${error.message}`);
      console.log(`ERROR STACK: ${error.stack}`);
    });

    // Listen for failed requests
    page.on('requestfailed', request => {
      console.log(`FAILED REQUEST: ${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.goto('/');
    
    // Wait longer to see all messages
    await page.waitForTimeout(5000);
    
    // Check if root element exists
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    console.log('Root element exists');
    
    // Check if any React content is rendered
    const rootContent = await root.innerHTML();
    console.log(`Root content length: ${rootContent.length}`);
    console.log('Root content:', rootContent.substring(0, 500));
  });
});