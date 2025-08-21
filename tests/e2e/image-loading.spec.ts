import { test, expect } from '@playwright/test';

test.describe('Image Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should check if product images are loading correctly', async ({ page }) => {
    // Wait a bit for the page to load
    await page.waitForTimeout(3000);
    
    // Type a search to get some results
    const searchInput = page.locator('input[placeholder*="Search products"]');
    await searchInput.fill('suite');
    
    // Wait for results to appear
    await page.waitForTimeout(3000);
    
    // Check HTML structure
    const resultsHtml = await page.locator('[data-testid="results-list"]').innerHTML();
    console.log('Results HTML structure (first 500 chars):');
    console.log(resultsHtml.substring(0, 500));
    
    // Check if there are any product cards
    const productCards = page.locator('[data-testid="results-list"] div.bg-white');
    const cardCount = await productCards.count();
    
    console.log(`Found ${cardCount} product cards with bg-white class`);
    
    if (cardCount > 0) {
      // Check the first product card
      const firstCard = productCards.first();
      
      // Get the entire HTML of the first card
      const cardHtml = await firstCard.innerHTML();
      console.log('First card HTML:');
      console.log(cardHtml.substring(0, 1000));
      
      // Look for images in the first card
      const images = firstCard.locator('img');
      const imageCount = await images.count();
      
      console.log(`Found ${imageCount} images in first card`);
      
      if (imageCount > 0) {
        const firstImage = images.first();
        
        // Get image attributes
        const src = await firstImage.getAttribute('src');
        const alt = await firstImage.getAttribute('alt');
        
        console.log(`Image src: ${src}`);
        console.log(`Image alt: ${alt}`);
        
        // Check if image actually loaded
        const naturalWidth = await firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
        const naturalHeight = await firstImage.evaluate((img: HTMLImageElement) => img.naturalHeight);
        const complete = await firstImage.evaluate((img: HTMLImageElement) => img.complete);
        
        console.log(`Image naturalWidth: ${naturalWidth}`);
        console.log(`Image naturalHeight: ${naturalHeight}`);
        console.log(`Image complete: ${complete}`);
        
        // Log if image failed to load
        if (naturalWidth === 0 && complete) {
          console.log('Image failed to load');
        } else if (naturalWidth > 0) {
          console.log('Image loaded successfully');
        }
        
        expect(src).toBeTruthy();
      } else {
        console.log('No images found in product card');
      }
    } else {
      console.log('No product cards found');
    }
  });

  test('should check what data is coming from Algolia', async ({ page }) => {
    // Intercept network requests to see what data we're getting
    const responses: any[] = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('algolia')) {
        try {
          const data = await response.json();
          responses.push({
            url: response.url(),
            status: response.status(),
            data: data
          });
        } catch (e) {
          console.log('Could not parse response as JSON');
        }
      }
    });
    
    // Search for something
    const searchInput = page.locator('input[placeholder*="Search products"]');
    await searchInput.fill('phone');
    await page.waitForTimeout(3000);
    
    // Log the responses
    console.log(`Captured ${responses.length} Algolia responses`);
    
    for (const response of responses) {
      console.log(`\nResponse from: ${response.url}`);
      console.log(`Status: ${response.status}`);
      
      if (response.data && response.data.results && response.data.results[0] && response.data.results[0].hits) {
        const hits = response.data.results[0].hits;
        console.log(`Number of hits: ${hits.length}`);
        
        if (hits.length > 0) {
          const firstHit = hits[0];
          console.log('First hit data:');
          console.log(`- objectID: ${firstHit.objectID}`);
          console.log(`- name: ${firstHit.name}`);
          console.log(`- image: ${firstHit.image}`);
          console.log(`- price: ${firstHit.price}`);
          console.log('- Available fields:', Object.keys(firstHit));
        }
      }
    }
  });
});