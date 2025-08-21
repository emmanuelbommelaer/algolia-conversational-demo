import { test, expect } from '@playwright/test';

test.describe('Search Stability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should not have infinite loops or flickering during search', async ({ page }) => {
    // Monitor console for excessive warnings or errors
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push(msg.text());
      }
    });

    // Find the search input
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await expect(searchInput).toBeVisible();
    
    // Type in the search box and wait for any re-renders to settle
    await searchInput.fill('phone');
    await page.waitForTimeout(2000);
    
    // Change search term to trigger more updates
    await searchInput.fill('laptop');
    await page.waitForTimeout(2000);
    
    // Clear and type again
    await searchInput.selectText();
    await searchInput.press('Delete');
    await page.waitForTimeout(1000);
    
    await searchInput.fill('tablet');
    await page.waitForTimeout(2000);

    // Check that we don't have an excessive number of console errors/warnings
    // (some InstantSearch warnings are normal, but excessive re-rendering would generate many)
    expect(consoleMessages.length).toBeLessThan(10);
  });

  test('should maintain stable state during filter interactions', async ({ page }) => {
    // Type a search query
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('electronics');
    await page.waitForTimeout(1500);
    
    // Click on a filter if available
    const firstFilter = page.locator('input[type="checkbox"]').first();
    
    if (await firstFilter.isVisible()) {
      await firstFilter.click();
      await page.waitForTimeout(1000);
      
      // Verify the search input still has the same value
      await expect(searchInput).toHaveValue('electronics');
      
      // Unclick the filter
      await firstFilter.click();
      await page.waitForTimeout(1000);
      
      // Search input should still be stable
      await expect(searchInput).toHaveValue('electronics');
    }
  });

  test('should not cause infinite network requests', async ({ page }) => {
    let requestCount = 0;
    
    // Monitor network requests to Algolia
    page.on('request', (request) => {
      if (request.url().includes('algolia')) {
        requestCount++;
      }
    });

    // Type in search box
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('test');
    
    // Wait for search to settle
    await page.waitForTimeout(3000);
    
    const initialRequestCount = requestCount;
    
    // Wait some more to see if there are any additional unexpected requests
    await page.waitForTimeout(2000);
    
    // Should not have significantly more requests (a few more is acceptable due to debouncing)
    expect(requestCount).toBeLessThanOrEqual(initialRequestCount + 3);
  });

  test('should handle rapid input changes gracefully', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search products..."]');
    
    // Rapidly type different queries
    const queries = ['a', 'ap', 'app', 'appl', 'apple'];
    
    for (const query of queries) {
      await searchInput.fill(query);
      await page.waitForTimeout(100); // Short delay between inputs
    }
    
    // Wait for final state to settle
    await page.waitForTimeout(2000);
    
    // Should end up with the final query
    await expect(searchInput).toHaveValue('apple');
    
    // Results should be visible and stable
    const resultsContainer = page.locator('[data-testid="results-list"]');
    await expect(resultsContainer).toBeVisible();
  });
});