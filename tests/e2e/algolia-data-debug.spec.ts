import { test, expect } from '@playwright/test';

test.describe('Algolia Data Debug', () => {
  test('Check what data is actually available in Algolia index', async ({ page }) => {
    // Listen to all network requests to see Algolia API calls
    const networkRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('algolia')) {
        networkRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    page.on('response', async response => {
      if (response.url().includes('algolia') && response.status() === 200) {
        try {
          const body = await response.json();
          console.log('\n=== ALGOLIA RESPONSE ===');
          console.log('URL:', response.url());
          
          // Check if this is a multi-query response (batch)
          if (body.results && Array.isArray(body.results)) {
            body.results.forEach((result: any, index: number) => {
              console.log(`\n--- Query ${index} ---`);
              console.log('Hits count:', result.hits?.length || 0);
              console.log('Total hits:', result.nbHits || 0);
              
              if (result.hits && result.hits.length > 0) {
                console.log('First hit sample fields:', Object.keys(result.hits[0]));
                console.log('First hit sample:', JSON.stringify(result.hits[0], null, 2));
              }
              
              if (result.facets) {
                console.log('Available facets:', Object.keys(result.facets));
                Object.entries(result.facets).forEach(([facetName, facetValues]) => {
                  console.log(`Facet "${facetName}":`, Object.keys(facetValues as any).slice(0, 5));
                });
              }
            });
          } else {
            console.log('Hits count:', body.hits?.length || 0);
            console.log('Total hits:', body.nbHits || 0);
            
            if (body.hits && body.hits.length > 0) {
              console.log('First hit sample fields:', Object.keys(body.hits[0]));
              console.log('First hit sample:', JSON.stringify(body.hits[0], null, 2));
            }
            
            if (body.facets) {
              console.log('Available facets:', Object.keys(body.facets));
              Object.entries(body.facets).forEach(([facetName, facetValues]) => {
                console.log(`Facet "${facetName}":`, Object.keys(facetValues as any).slice(0, 5));
              });
            }
          }
        } catch (e) {
          console.log('Failed to parse Algolia response:', e);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for Algolia data to load
    await page.waitForTimeout(10000);
    
    console.log('\nNetwork requests made:', networkRequests.length);
  });
});