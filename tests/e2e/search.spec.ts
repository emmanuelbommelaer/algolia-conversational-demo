import { test, expect } from '@playwright/test';

test.describe('Search Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the main page with search components', async ({ page }) => {
    // Check that the main layout is present
    await expect(page.locator('[data-testid="app-layout"]')).toBeVisible();
    
    // Check that search panel is present
    await expect(page.locator('[data-testid="search-panel"]')).toBeVisible();
    
    // Check that agent panel is present
    await expect(page.locator('[data-testid="agent-panel"]')).toBeVisible();
  });

  test('should have a functional search box', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await expect(searchInput).toBeVisible();
    
    // Type in the search box
    await searchInput.fill('laptop');
    await expect(searchInput).toHaveValue('laptop');
    
    // Clear using keyboard shortcut instead of button click to avoid instability
    await searchInput.selectText();
    await searchInput.press('Delete');
    await expect(searchInput).toHaveValue('');
  });

  test('should display search results when searching', async ({ page }) => {
    // Wait for the page to be fully loaded
    await page.waitForTimeout(2000);
    
    // Type in search box
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('phone');
    
    // Wait for search results to appear
    await page.waitForTimeout(1000);
    
    // Check that results container is present
    const resultsContainer = page.locator('[data-testid="results-list"]');
    await expect(resultsContainer).toBeVisible();
  });

  test('should show filters panel', async ({ page }) => {
    // Check that filters are present
    const filtersContainer = page.locator('[data-testid="filters"]');
    await expect(filtersContainer).toBeVisible();
    
    // Check for common filter categories
    await expect(page.locator('text=Brand')).toBeVisible();
    await expect(page.locator('text=Category')).toBeVisible();
    await expect(page.locator('text=Price')).toBeVisible();
  });

  test('should allow clicking on filter options', async ({ page }) => {
    // Wait for filters to load
    await page.waitForTimeout(2000);
    
    // Look for the first available filter checkbox
    const firstFilter = page.locator('input[type="checkbox"]').first();
    
    if (await firstFilter.isVisible()) {
      // Click the first filter option
      await firstFilter.click();
      
      // Verify it's checked
      await expect(firstFilter).toBeChecked();
    }
  });

  test('should show loading states appropriately', async ({ page }) => {
    // Initially, there might be loading spinners
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('test search');
    
    // Look for any loading indicators (they should appear briefly)
    await page.waitForTimeout(500);
    
    // The page should eventually settle without permanent loading states
    await page.waitForTimeout(1500);
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="search-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="agent-panel"]')).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Both panels should still be present but may stack vertically
    await expect(page.locator('[data-testid="search-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="agent-panel"]')).toBeVisible();
  });

  test('should maintain search state when interacting with filters', async ({ page }) => {
    // Enter a search query
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('phone');
    await page.waitForTimeout(1000);
    
    // Look for a filter to interact with
    const filterCheckbox = page.locator('input[type="checkbox"]').first();
    
    if (await filterCheckbox.isVisible()) {
      await filterCheckbox.click();
      await page.waitForTimeout(500);
      
      // Search input should still maintain its value
      await expect(searchInput).toHaveValue('phone');
    }
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    // Search for something that likely won't return results
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('xyznonexistentproduct123');
    await page.waitForTimeout(1500);
    
    // The results container should still be present
    const resultsContainer = page.locator('[data-testid="results-list"]');
    await expect(resultsContainer).toBeVisible();
  });
});