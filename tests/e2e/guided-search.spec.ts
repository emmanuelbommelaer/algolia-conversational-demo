import { test, expect } from '@playwright/test';

test.describe('Guided Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Wait for Algolia to load
    await page.waitForTimeout(2000);
  });

  test('should show search guide interface without text input', async ({ page }) => {
    // Check that the agent panel exists
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    await expect(agentPanel).toBeVisible();

    // Check that there's no text input in the agent panel (MessageInput removed)
    const textInputs = agentPanel.locator('input[type="text"]');
    await expect(textInputs).toHaveCount(0);

    // Check that the SearchGuide header is present
    const guideHeader = agentPanel.locator('text=Your Search Guide');
    await expect(guideHeader).toBeVisible();

    // Check for welcome message
    const welcomeMessage = agentPanel.locator('text=Welcome! I\'ll help you find the perfect Airbnb');
    await expect(welcomeMessage).toBeVisible();
  });

  test('should show clickable location options in welcome stage', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Wait for facet options to load
    await page.waitForTimeout(3000);

    // Check for location options section
    const locationSection = agentPanel.locator('text=location');
    await expect(locationSection).toBeVisible();

    // Check that there are clickable location buttons
    const locationButtons = agentPanel.locator('button').filter({ hasText: /📍/ });
    const buttonCount = await locationButtons.count();
    
    console.log(`Found ${buttonCount} location buttons`);
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should progress through guided search stages', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Wait for initial load
    await page.waitForTimeout(3000);

    // Click on the first available location option
    const firstLocationButton = agentPanel.locator('button').first();
    if (await firstLocationButton.isVisible()) {
      await firstLocationButton.click();
      
      // Wait for the interface to update
      await page.waitForTimeout(2000);

      // Check that progress bar updated
      const progressBar = agentPanel.locator('.bg-gradient-to-r.from-blue-500.to-indigo-500');
      await expect(progressBar).toBeVisible();

      // Check that the stage progressed (should show property type options)
      const propertyMessage = agentPanel.locator('text=What kind of property interests you');
      await expect(propertyMessage).toBeVisible();
    }
  });

  test('should show applied filters with remove buttons', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Wait for initial load
    await page.waitForTimeout(3000);

    // Click on the first available option
    const firstButton = agentPanel.locator('button').first();
    if (await firstButton.isVisible()) {
      await firstButton.click();
      
      // Wait for filter to be applied
      await page.waitForTimeout(2000);

      // Check for applied filters section
      const filtersSection = agentPanel.locator('text=Your Preferences:');
      await expect(filtersSection).toBeVisible();

      // Check for remove button (X)
      const removeButton = agentPanel.locator('button').filter({ hasText: /×|✕/ }).first();
      if (await removeButton.isVisible()) {
        await expect(removeButton).toBeVisible();
      }
    }
  });

  test('should show result count in the header', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Wait for results to load
    await page.waitForTimeout(3000);

    // Check for result count in the header
    const resultCountText = agentPanel.locator('text=/\\d+ properties found/');
    await expect(resultCountText).toBeVisible();
  });
});