/**
 * CLI script to add tokens to the database
 *
 * Usage:
 *   npx tsx scripts/add-tokens.ts <mintAddress1> <mintAddress2> ...
 *
 * Or from a file:
 *   cat token-list.txt | xargs npx tsx scripts/add-tokens.ts
 *
 * Examples:
 *   # Add single token
 *   npx tsx scripts/add-tokens.ts ABC123...
 *
 *   # Add multiple tokens
 *   npx tsx scripts/add-tokens.ts ABC123... DEF456... GHI789...
 *
 *   # Discover trending tokens and add the top 10
 *   # (You would need to manually find trending token addresses from pump.fun)
 */

import { tokenIngestionService } from '../src/lib/services/token-ingestion';

async function addTokens() {
  const mintAddresses = process.argv.slice(2);

  if (mintAddresses.length === 0) {
    console.error('❌ Error: No mint addresses provided');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/add-tokens.ts <mintAddress1> <mintAddress2> ...');
    console.log('\nExample:');
    console.log('  npx tsx scripts/add-tokens.ts CPLTbYbtDMKZtHBaPqdDmHjxNwESCEB14gm6VuoDpump');
    process.exit(1);
  }

  console.log(`\n📥 Adding ${mintAddresses.length} token(s)...\n`);

  try {
    const results = await tokenIngestionService.ingestTokenBatch(mintAddresses);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('\n📊 Results:');
    console.log(`  ✅ Successfully added: ${successful.length}`);
    console.log(`  ❌ Failed: ${failed.length}`);

    if (successful.length > 0) {
      console.log('\n✅ Successful additions:');
      successful.forEach(r => {
        const ageInHours = r.tokenAgeHours || 0;
        const ageDisplay = ageInHours < 24
          ? `${ageInHours}h old`
          : `${Math.floor(ageInHours / 24)}d old`;

        const mcapDisplay = r.marketCap
          ? `$${(r.marketCap / 1000000).toFixed(2)}M`
          : 'unknown';

        console.log(`  - ${r.mintAddress.slice(0, 8)}...: ${mcapDisplay}, ${ageDisplay}`);
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed additions:');
      failed.forEach(r => {
        console.log(`  - ${r.mintAddress.slice(0, 8)}...: ${r.message}`);
      });
    }

    // Show updated stats
    console.log('\n📈 Database Stats:');
    const stats = await tokenIngestionService.getStats();
    console.log(`  Total Tokens: ${stats.totalTokens}`);
    console.log(`  Total Snapshots: ${stats.totalSnapshots}`);
    console.log(`  Avg Snapshots/Token: ${stats.avgSnapshotsPerToken.toFixed(1)}`);

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

addTokens();
