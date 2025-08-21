import { test, expect } from '@playwright/test';

test.describe('Console Debug', () => {
  test('Capture console logs to debug filter issue', async ({ page }) => {
    // Listen to console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      console.log('Browser console:', text);
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait long enough for all logs to appear
    await page.waitForTimeout(8000);
    
    // Print all captured messages
    console.log('\n=== ALL CONSOLE MESSAGES ===');
    consoleMessages.forEach((msg, index) => {
      console.log(`${index + 1}: ${msg}`);
    });
  });
});