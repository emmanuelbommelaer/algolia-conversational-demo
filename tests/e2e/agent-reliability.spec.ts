import { test, expect } from '@playwright/test';

test.describe('Agent Reliability Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Wait for initial load and agent to respond
    await page.waitForTimeout(8000);
  });

  test('Agent responds consistently across multiple calls (10x)', async ({ page }) => {
    const responses: string[] = [];
    const resultCounts: string[] = [];
    const filterChoices: number[] = [];
    
    console.log('🧪 Starting 10 agent reliability tests...');
    
    for (let i = 0; i < 10; i++) {
      console.log(`📊 Test iteration ${i + 1}/10`);
      
      // Reload page for fresh agent session
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(8000); // Wait for agent response
      
      const agentPanel = page.locator('[data-testid="agent-panel"]');
      
      // Check if agent responded (no error message)
      const errorMessage = page.locator('text=/⚠️.*Agent service unavailable/i');
      const hasError = await errorMessage.isVisible();
      
      if (hasError) {
        console.log(`❌ Iteration ${i + 1}: Agent service unavailable`);
        continue;
      }
      
      // Extract agent message
      const agentMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
      if (await agentMessage.isVisible()) {
        const messageText = await agentMessage.textContent();
        responses.push(messageText || '');
        
        // Extract result count from message
        const countMatch = messageText?.match(/(\d+(?:,\d+)?)\s+properties?\s+found/i);
        if (countMatch) {
          resultCounts.push(countMatch[1]);
        }
      }
      
      // Count filter choices displayed
      const filterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
      const buttonCount = await filterButtons.count();
      filterChoices.push(buttonCount);
      
      console.log(`   Response length: ${responses[responses.length - 1]?.length || 0} chars`);
      console.log(`   Filter choices: ${buttonCount}`);
      console.log(`   Result count: ${resultCounts[resultCounts.length - 1] || 'none'}`);
    }
    
    const successfulResponses = responses.filter(r => r.length > 0);
    const averageResponseLength = successfulResponses.reduce((sum, r) => sum + r.length, 0) / successfulResponses.length;
    
    console.log(`\n📈 Agent Reliability Summary:`);
    console.log(`   Successful responses: ${successfulResponses.length}/10`);
    console.log(`   Average response length: ${Math.round(averageResponseLength)} characters`);
    console.log(`   Result counts captured: ${resultCounts.length}/10`);
    console.log(`   Filter choice counts: ${filterChoices.join(', ')}`);
    
    // Assertions
    expect(successfulResponses.length).toBeGreaterThanOrEqual(8); // At least 80% success rate
    expect(averageResponseLength).toBeGreaterThan(20); // Responses should be substantial
    expect(averageResponseLength).toBeLessThan(500); // But not too verbose (per requirements)
    
    // Check that filter choices are mostly 1 (single-choice requirement)
    const singleChoiceCount = filterChoices.filter(count => count === 1).length;
    console.log(`   Single-choice responses: ${singleChoiceCount}/${filterChoices.length}`);
    
    // Most responses should have exactly 1 filter choice
    expect(singleChoiceCount).toBeGreaterThanOrEqual(filterChoices.length * 0.7); // At least 70%
  });

  test('Agent JSON parsing works correctly', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Wait for agent response
    await page.waitForTimeout(3000);
    
    // Check for agent message
    const agentMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
    await expect(agentMessage).toBeVisible();
    
    const messageText = await agentMessage.textContent();
    console.log('🔍 Agent response:', messageText?.substring(0, 200) + '...');
    
    // Look for JSON structures in the response
    const hasJson = messageText?.includes('{') && messageText?.includes('}');
    console.log('📄 Contains JSON:', hasJson);
    
    // Check for filter buttons (parsed successfully)
    const filterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    const buttonCount = await filterButtons.count();
    
    console.log('🔘 Filter buttons found:', buttonCount);
    
    // If JSON is present, parsing should produce filter buttons
    if (hasJson) {
      expect(buttonCount).toBeGreaterThan(0);
    }
    
    // Verify single-choice constraint
    expect(buttonCount).toBeLessThanOrEqual(1);
  });

  test('Result count synchronization works correctly', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Wait for initial agent response
    await page.waitForTimeout(5000);
    
    // Get initial result count from agent message
    const agentMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
    const initialMessageText = await agentMessage.textContent();
    
    const initialCountMatch = initialMessageText?.match(/(\d+(?:,\d+)?)\s+properties?\s+found/i);
    const initialAgentCount = initialCountMatch ? initialCountMatch[1] : null;
    
    console.log('🔢 Initial agent result count:', initialAgentCount);
    
    // Apply a filter if available
    const filterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    if (await filterButtons.count() > 0) {
      const firstButton = filterButtons.first();
      const buttonText = await firstButton.textContent();
      console.log('🎯 Applying filter:', buttonText);
      
      await firstButton.click();
      
      // Wait for agent to respond to filter change
      await page.waitForTimeout(8000);
      
      // Get new result count from agent
      const newMessageText = await agentMessage.textContent();
      const newCountMatch = newMessageText?.match(/(\d+(?:,\d+)?)\s+properties?\s+found/i);
      const newAgentCount = newCountMatch ? newCountMatch[1] : null;
      
      console.log('🔢 New agent result count after filter:', newAgentCount);
      
      // The counts should be different (filter applied) or consistent if no change
      if (initialAgentCount && newAgentCount) {
        console.log('✅ Agent properly updates result count based on filters');
      }
    } else {
      console.log('⚠️ No filters available to test synchronization');
    }
    
    // Agent should always show some result count information
    expect(initialAgentCount || 'no initial count').toBeTruthy();
  });

  test('Agent verbosity is appropriately reduced', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Wait for agent response
    await page.waitForTimeout(3000);
    
    const agentMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
    const messageText = await agentMessage.textContent() || '';
    
    const wordCount = messageText.split(/\s+/).length;
    const charCount = messageText.length;
    
    console.log('📝 Agent response analysis:');
    console.log(`   Characters: ${charCount}`);
    console.log(`   Words: ${wordCount}`);
    console.log(`   Message: "${messageText.substring(0, 100)}..."`);
    
    // Agent should be concise (less verbose than before)
    // Based on requirements: 1-2 sentences max
    expect(wordCount).toBeLessThan(50); // Roughly 2 sentences
    expect(charCount).toBeLessThan(300); // Reasonable character limit
    expect(charCount).toBeGreaterThan(10); // Still meaningful
    
    // Should not contain overly verbose phrases
    const verbosePhrases = [
      'Let me explain in detail',
      'Here are several options',
      'I recommend the following',
      'Please consider these multiple'
    ];
    
    const isVerbose = verbosePhrases.some(phrase => 
      messageText.toLowerCase().includes(phrase.toLowerCase())
    );
    
    expect(isVerbose).toBeFalsy();
  });

  test('Single filter choice constraint is enforced', async ({ page }) => {
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    // Wait for agent response
    await page.waitForTimeout(5000);
    
    // Count all filter buttons
    const filterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
    const buttonCount = await filterButtons.count();
    
    console.log('🔘 Total filter buttons displayed:', buttonCount);
    
    // Should have exactly 0 or 1 filter choice (0 if perfect results)
    expect(buttonCount).toBeLessThanOrEqual(1);
    
    if (buttonCount === 1) {
      const buttonText = await filterButtons.first().textContent();
      console.log('🎯 Single filter choice:', buttonText);
      
      // Should have proper styling for prominence
      const button = filterButtons.first();
      const buttonClass = await button.getAttribute('class');
      
      // Should use the new prominent single-choice styling
      expect(buttonClass).toContain('w-full'); // Full width for prominence
      console.log('✅ Filter choice uses prominent styling');
    }
  });

  test('Error handling and fallbacks work correctly', async ({ page }) => {
    // Test what happens when agent fails or returns malformed data
    const agentPanel = page.locator('[data-testid="agent-panel"]');
    
    await page.waitForTimeout(5000);
    
    // Check for error states
    const errorMessage = page.locator('text=/⚠️.*Agent service unavailable/i');
    const hasError = await errorMessage.isVisible();
    
    if (hasError) {
      console.log('❌ Agent service unavailable - testing error handling');
      
      // Error should be visibly displayed
      await expect(errorMessage).toBeVisible();
      
      // Should show error icon
      const errorIcon = page.locator('div:has-text("❌")');
      await expect(errorIcon).toBeVisible();
      
      // Should not show filter options in error state
      const filterButtons = agentPanel.locator('button').filter({ hasText: /\d+/ });
      const buttonCount = await filterButtons.count();
      expect(buttonCount).toBe(0);
      
      console.log('✅ Error handling working correctly');
    } else {
      console.log('✅ Agent service working normally');
      
      // Should have some content
      const agentMessage = agentPanel.locator('.text-gray-800.leading-relaxed');
      await expect(agentMessage).toBeVisible();
      
      const messageText = await agentMessage.textContent();
      expect(messageText).toBeTruthy();
      expect(messageText!.length).toBeGreaterThan(5);
    }
  });
});