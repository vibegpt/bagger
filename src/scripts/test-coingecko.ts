/**
 * Test CoinGecko API integration
 * Run with: npx tsx src/scripts/test-coingecko.ts
 */

import { coinGeckoClient } from '@/lib/integrations/coingecko/client';

async function main() {
  console.log('=== CoinGecko API Test ===\n');

  // 1. Get all categories and find creator coins
  console.log('1. Fetching categories...');
  const categories = await coinGeckoClient.getCategories();
  console.log(`Found ${categories.length} total categories`);

  // Filter for creator-related categories
  const creatorCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes('creator') ||
    cat.name.toLowerCase().includes('content') ||
    cat.id.includes('creator')
  );

  console.log(`\nCreator-related categories:`);
  creatorCategories.forEach(cat => {
    console.log(`  - ${cat.name} (${cat.id})`);
    console.log(`    Market Cap: $${cat.marketCap.toLocaleString()}`);
    console.log(`    24h Volume: $${cat.volume24h.toLocaleString()}`);
  });

  if (creatorCategories.length === 0) {
    console.log('  No creator-specific categories found');
    console.log('\n  Top 10 categories by market cap:');
    categories
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 10)
      .forEach(cat => {
        console.log(`  - ${cat.name}: $${cat.marketCap.toLocaleString()}`);
      });
  }

  // 2. Search for known creator coins
  console.log('\n\n2. Searching for known creator tokens...');
  const searchTerms = ['CHILLGUY', 'DTV', 'WNTV', 'BIRDIE', 'WOLF'];

  for (const term of searchTerms) {
    console.log(`\nSearching for: ${term}`);
    const results = await coinGeckoClient.searchCoin(term);

    if (results.length > 0) {
      console.log(`  Found ${results.length} results:`);
      results.slice(0, 3).forEach(coin => {
        console.log(`    - ${coin.name} (${coin.symbol.toUpperCase()}) - ID: ${coin.id}`);
      });

      // Get detailed data for first result
      const firstResult = results[0];
      console.log(`\n  Fetching detailed data for ${firstResult.name}...`);
      const coinData = await coinGeckoClient.getCoinData(firstResult.id);

      if (coinData) {
        console.log(`    Categories: ${coinData.categories.join(', ') || 'None'}`);
        console.log(`    Twitter: ${coinData.communityData.twitter_followers?.toLocaleString() || 'N/A'} followers`);
        console.log(`    Reddit: ${coinData.communityData.reddit_subscribers?.toLocaleString() || 'N/A'} subscribers`);
        console.log(`    Telegram: ${coinData.communityData.telegram_channel_user_count?.toLocaleString() || 'N/A'} users`);
        console.log(`    Community Score: ${coinData.communityScore || 'N/A'}`);
        console.log(`    Sentiment: ${coinData.sentimentVotesUpPercentage || 'N/A'}% positive`);
        console.log(`    Price: $${coinData.marketData.currentPrice || 'N/A'}`);
        console.log(`    Market Cap: $${coinData.marketData.marketCap?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log(`  No results found`);
    }

    // Rate limit protection
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 3. Get creator coin category
  console.log('\n\n3. Fetching creator coin category...');
  const creatorCategory = await coinGeckoClient.getCreatorCoinCategory();

  if (creatorCategory) {
    console.log(`Found creator category: ${creatorCategory.name}`);
    console.log(`Market Cap: $${creatorCategory.marketCap.toLocaleString()}`);
    console.log(`24h Volume: $${creatorCategory.volume24h.toLocaleString()}`);

    console.log('\nFetching coins in this category...');
    const categoryCoins = await coinGeckoClient.getCoinsByCategory(creatorCategory.id);
    console.log(`Found ${categoryCoins.length} coins in category`);

    if (categoryCoins.length > 0) {
      console.log('First 5 coins:');
      categoryCoins.slice(0, 5).forEach((coinId, index) => {
        console.log(`  ${index + 1}. ${coinId}`);
      });
    }
  } else {
    console.log('No creator coin category found');
  }

  console.log('\n\n=== Test Complete ===');
}

main()
  .then(() => {
    console.log('\nAll tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest failed:', error);
    process.exit(1);
  });
