const { algoliasearch } = require('algoliasearch');
require('dotenv').config({ path: '../.env' });

const client = algoliasearch(process.env.VITE_ALGOLIA_APP_ID, process.env.VITE_ALGOLIA_API_KEY);
const indexName = process.env.VITE_ALGOLIA_INDEX_NAME;

async function analyzeIndex() {
  try {
    console.log(`Analyzing index: ${process.env.VITE_ALGOLIA_INDEX_NAME}`);
    console.log('='.repeat(50));

    // Get index settings to understand the structure
    const settings = await client.getSettings({ indexName });
    console.log('Index Settings:');
    console.log('- Searchable Attributes:', settings.searchableAttributes);
    console.log('- Facets:', settings.attributesForFaceting);
    console.log('');

    // Search for a few records to understand the structure
    const searchResult = await client.search({
      requests: [{
        indexName,
        query: '',
        hitsPerPage: 10
      }]
    });

    const firstResult = searchResult.results[0];
    console.log(`Total records in index: ${firstResult.nbHits}`);
    console.log('');

    if (firstResult.hits.length > 0) {
      console.log('Sample record structure:');
      const sampleRecord = firstResult.hits[0];
      const attributes = Object.keys(sampleRecord);
      
      // Look for image-related attributes
      const imageAttributes = attributes.filter(attr => 
        attr.toLowerCase().includes('image') || 
        attr.toLowerCase().includes('picture') || 
        attr.toLowerCase().includes('photo') ||
        attr.toLowerCase().includes('url') ||
        attr.toLowerCase().includes('src')
      );

      console.log('All attributes:', attributes);
      console.log('');
      console.log('Potential image attributes:', imageAttributes);
      console.log('');

      // Show sample values for image attributes
      imageAttributes.forEach(attr => {
        console.log(`${attr}: ${JSON.stringify(sampleRecord[attr])}`);
      });
      console.log('');
    }

    // Now let's analyze image coverage across all records
    console.log('Analyzing image coverage...');
    
    const browseResult = await client.browse({
      indexName,
      hitsPerPage: 1000
    });

    let totalRecords = 0;
    let recordsWithImages = 0;
    const imageStats = {};

    for (const hit of browseResult.hits) {
      totalRecords++;
      
      // Check all potential image attributes
      const attributes = Object.keys(hit);
      const imageAttributes = attributes.filter(attr => 
        attr.toLowerCase().includes('image') || 
        attr.toLowerCase().includes('picture') || 
        attr.toLowerCase().includes('photo') ||
        attr.toLowerCase().includes('url') ||
        attr.toLowerCase().includes('src')
      );

      let hasImage = false;
      imageAttributes.forEach(attr => {
        if (!imageStats[attr]) {
          imageStats[attr] = { total: 0, withValue: 0, withNonEmptyValue: 0 };
        }
        imageStats[attr].total++;
        
        const value = hit[attr];
        if (value !== undefined && value !== null) {
          imageStats[attr].withValue++;
          if (value !== '' && (!Array.isArray(value) || value.length > 0)) {
            imageStats[attr].withNonEmptyValue++;
            hasImage = true;
          }
        }
      });

      if (hasImage) {
        recordsWithImages++;
      }
    }

    console.log('Image Statistics:');
    console.log('='.repeat(30));
    console.log(`Total records analyzed: ${totalRecords}`);
    console.log(`Records with at least one image: ${recordsWithImages} (${(recordsWithImages/totalRecords*100).toFixed(1)}%)`);
    console.log('');

    console.log('Per-attribute statistics:');
    Object.entries(imageStats).forEach(([attr, stats]) => {
      console.log(`${attr}:`);
      console.log(`  - Total records: ${stats.total}`);
      console.log(`  - With value (not null/undefined): ${stats.withValue} (${(stats.withValue/stats.total*100).toFixed(1)}%)`);
      console.log(`  - With non-empty value: ${stats.withNonEmptyValue} (${(stats.withNonEmptyValue/stats.total*100).toFixed(1)}%)`);
      console.log('');
    });

  } catch (error) {
    console.error('Error analyzing index:', error);
  }
}

analyzeIndex();