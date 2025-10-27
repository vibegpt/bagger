/**
 * Test script for DexScreener client
 * Run with: npx tsx src/lib/integrations/dexscreener/test.ts
 */

import { dexScreenerClient } from './client';

async function testDexScreener() {
  console.log('🧪 Testing DexScreener Client\n');

  // Test with DTV token (we know this exists)
  const dtvMint = 'CPLTbYbtDMKZtHBaPqdDmHjxNwESCEB14gm6VuoDpump';

  console.log(`Testing with DTV token: ${dtvMint}\n`);

  try {
    const tokenData = await dexScreenerClient.getTokenData(dtvMint);

    if (tokenData) {
      console.log('✅ Token data retrieved successfully:\n');
      console.log(`Name: ${tokenData.name}`);
      console.log(`Symbol: ${tokenData.symbol}`);
      console.log(`Market Cap: $${tokenData.marketCap.toLocaleString()}`);
      console.log(`Liquidity: $${tokenData.liquidity.toLocaleString()}`);
      console.log(`24h Volume: $${tokenData.volume24h.toLocaleString()}`);
      console.log(`Price: $${tokenData.price.toFixed(6)}`);
      console.log(`24h Price Change: ${tokenData.priceChange24h.toFixed(2)}%`);
      console.log(`Estimated Holders: ${tokenData.holderCount.toLocaleString()}`);
      console.log(`Unique Traders (24h): ${tokenData.uniqueTraders24h.toLocaleString()}`);
      console.log(`Token Age: ${tokenData.tokenAgeHours} hours`);
      console.log(`DEX: ${tokenData.dexId}`);
      console.log(`Created At: ${tokenData.createdAt.toISOString()}`);
    } else {
      console.log('❌ Failed to retrieve token data');
    }

    console.log('\n---\n');

    // Test batch fetch
    console.log('Testing batch fetch with 3 tokens...\n');

    const mintAddresses = [
      'CPLTbYbtDMKZtHBaPqdDmHjxNwESCEB14gm6VuoDpump', // DTV
      '2GXmB95pGD3pHV4mzNq7YsmyiEmVYWQLptbwYqgdpump', // WNTV
      'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump', // CHILLGUY
    ];

    const batchResults = await dexScreenerClient.getTokensBatch(mintAddresses);

    batchResults.forEach((token, index) => {
      if (token) {
        console.log(`${index + 1}. ${token.symbol}: $${token.marketCap.toLocaleString()} mcap`);
      } else {
        console.log(`${index + 1}. Failed to fetch`);
      }
    });

    console.log('\n✅ All tests complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDexScreener();
