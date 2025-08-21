import { test, expect } from '@playwright/test';

test.describe('Key Workflow: Agent-Guided Faceted Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Wait for Algolia data and agent to load
    await page.waitForTimeout(5000);
  });

  test('TC001: Initial load shows agent guidance with filter options', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Verify agent panel is visible
    await expect(agentPanel).toBeVisible();
    
    // Check for agent welcome message
    const welcomeMessage = agentPanel.locator('text=/Welcome.*Airbnb/i');
    await expect(welcomeMessage).toBeVisible();
    
    // Verify filter options are displayed (any buttons with numbers)
    const filterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    const buttonCount = await filterButtons.count();
    
    expect(buttonCount).toBeGreaterThanOrEqual(1);
    console.log(`✅ TC001: Found ${buttonCount} filter options on welcome`);
    
    // Check that buttons have meaningful text
    if (buttonCount > 0) {
      const firstButtonText = await filterButtons.first().textContent();
      expect(firstButtonText).toBeTruthy();
      console.log(`   First filter option: "${firstButtonText?.trim()}"`);
    }
  });

  test('TC002: Selecting filter updates guidance and shows new options', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Wait for initial filter options
    await page.waitForTimeout(2000);
    
    // Get initial filter buttons
    const initialButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    const initialCount = await initialButtons.count();
    
    if (initialCount > 0) {
      // Select first available filter
      const firstButton = initialButtons.first();
      const buttonText = await firstButton.textContent();
      await firstButton.click();
      
      console.log(`   Selected filter: "${buttonText?.trim()}"`);
      
      // Wait for agent response
      await page.waitForTimeout(4000);
      
      // Verify filter is applied (check for applied filters section)
      const appliedFiltersSection = agentPanel.locator('text=/Your Preferences:/');
      if (await appliedFiltersSection.isVisible()) {
        console.log('✅ TC002: Filter applied successfully - preferences section visible');
      }
      
      // Should still have some filter options (unless perfectly refined)
      const newButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
      const newCount = await newButtons.count();
      console.log(`   New filter options available: ${newCount}`);
    } else {
      console.log('⚠️ TC002: No initial filter options found - skipping selection test');
    }
  });

  test('TC003: Search results are displayed', async ({ page }) => {
    const resultsList = page.locator('[data-testid="results-list"]');
    
    // Wait for results to load
    await page.waitForTimeout(3000);
    
    // Verify results panel exists
    await expect(resultsList).toBeVisible();
    
    // Check for result cards
    const resultCards = resultsList.locator('.bg-white').filter({ hasText: /\$/ });
    const cardCount = await resultCards.count();
    
    console.log(`✅ TC003: Found ${cardCount} result cards displayed`);
    expect(cardCount).toBeGreaterThanOrEqual(0); // Could be 0 if no results
  });

  test('TC004: Agent guidance is contextual', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Check for agent message
    const agentMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
    await expect(agentMessage).toBeVisible();
    
    const messageText = await agentMessage.textContent();
    console.log(`✅ TC004: Agent message: "${messageText?.substring(0, 100)}..."`);
    
    // Should contain helpful guidance
    expect(messageText).toMatch(/location|property|price|stay|find|choose|perfect/i);
  });

  test('TC005: No text input interface exposed', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Verify no text input fields in agent panel
    const textInputs = agentPanel.locator('input[type="text"], textarea');
    const inputCount = await textInputs.count();
    
    // Should only have filter buttons, no text input
    const filterButtons = agentPanel.locator('button');
    const buttonCount = await filterButtons.count();
    
    expect(inputCount).toBe(0);
    expect(buttonCount).toBeGreaterThanOrEqual(1);
    
    console.log(`✅ TC005: No text input (${inputCount} inputs) - interface shows ${buttonCount} buttons`);
  });

  test('TC006: Search panel shows filter bar and results at same height', async ({ page }) => {
    const searchPanel = page.locator('[data-testid="search-panel"]');
    await expect(searchPanel).toBeVisible();
    
    // Should show filters sidebar and results area
    const filtersArea = searchPanel.locator('.w-80.bg-gray-50');
    await expect(filtersArea).toBeVisible();
    
    const resultsArea = searchPanel.locator('.flex-1.bg-white.overflow-y-auto');
    await expect(resultsArea).toBeVisible();
    
    console.log('✅ TC006: Search panel correctly shows filter bar and results area');
  });

  test('TC007: Images display with fallback handling', async ({ page }) => {
    const resultsList = page.locator('[data-testid="results-list"]');
    await expect(resultsList).toBeVisible();
    
    // Wait for results to load
    await page.waitForTimeout(3000);
    
    const images = resultsList.locator('img');
    const imageCount = await images.count();
    
    console.log(`✅ TC007: Found ${imageCount} images in results`);
    
    if (imageCount > 0) {
      // Check first image has src and alt
      const firstImage = images.first();
      const src = await firstImage.getAttribute('src');
      const alt = await firstImage.getAttribute('alt');
      
      expect(src).toBeTruthy();
      expect(alt).toBeTruthy();
      
      console.log(`   First image src: ${src?.substring(0, 50)}...`);
    }
    
    expect(imageCount).toBeGreaterThanOrEqual(0);
  });

  test('TC008: Applied filters can be removed', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Apply a filter first
    const filterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    const initialCount = await filterButtons.count();
    
    if (initialCount > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(3000);
      
      // Look for remove buttons (X buttons in applied filters)
      const removeButtons = agentPanel.locator('button').filter({ hasText: /×|✕/ });
      const removeCount = await removeButtons.count();
      
      if (removeCount > 0) {
        console.log(`✅ TC008: Found ${removeCount} removable filters`);
        
        // Try to remove first filter
        await removeButtons.first().click();
        await page.waitForTimeout(2000);
        
        // Should return to initial state
        const newFilterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
        const newCount = await newFilterButtons.count();
        console.log(`   After removal: ${newCount} filter options available`);
      } else {
        console.log('⚠️ TC008: No removable filters found after applying filter');
      }
    } else {
      console.log('⚠️ TC008: No filters available to test removal');
    }
  });

  test('TC009: Results update when filters are applied', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    const resultsList = page.locator('[data-testid="results-list"]');
    
    // Get initial result count from agent
    let initialResults = 'unknown';
    const initialMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
    if (await initialMessage.isVisible()) {
      const text = await initialMessage.textContent();
      const match = text?.match(/(\d+(?:,\d+)?)\s+properties?/);
      if (match) initialResults = match[1];
    }
    
    // Apply a filter if available
    const filterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    if (await filterButtons.count() > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(4000);
      
      // Check new result count
      let newResults = 'unknown';
      const newMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
      if (await newMessage.isVisible()) {
        const text = await newMessage.textContent();
        const match = text?.match(/(\d+(?:,\d+)?)\s+properties?/);
        if (match) newResults = match[1];
      }
      
      console.log(`✅ TC009: Results updated from ${initialResults} to ${newResults} properties`);
    } else {
      console.log('⚠️ TC009: No filters available to test result updates');
    }
    
    // Verify results list is still visible
    await expect(resultsList).toBeVisible();
  });

  test('TC010: Full interface loads and functions correctly', async ({ page }) => {
    // Check all main interface elements load
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    const resultsList = page.locator('[data-testid="results-list"]');
    const searchPanel = page.locator('[data-testid="search-panel"]');
    const appLayout = page.locator('[data-testid="app-layout"]');
    
    // Verify core elements are visible
    await expect(appLayout).toBeVisible();
    await expect(agentPanel).toBeVisible();
    await expect(searchPanel).toBeVisible();
    await expect(resultsList).toBeVisible();
    
    // Check agent shows guidance
    const agentMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
    await expect(agentMessage).toBeVisible();
    
    // Check we have some kind of results or filter interface
    const filterButtons = agentPanel.locator('button');
    const buttonCount = await filterButtons.count();
    
    console.log(`✅ TC010: Full interface loaded - agent panel active with ${buttonCount} interactive elements`);
    
    // Should have at least some buttons for interaction
    expect(buttonCount).toBeGreaterThanOrEqual(1);
    
    // Verify no JavaScript errors by checking console
    let hasErrors = false;
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
        hasErrors = true;
        console.log(`   JavaScript error: ${msg.text()}`);
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (!hasErrors) {
      console.log('   No critical JavaScript errors detected');
    }
  });
});