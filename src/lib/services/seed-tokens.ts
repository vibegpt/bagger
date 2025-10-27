/**
 * Seed script to populate database with initial tokens
 * Run with: npx tsx src/lib/services/seed-tokens.ts
 */

import { tokenIngestionService } from './token-ingestion';

async function seedDatabase() {
  console.log('🌱 Starting token database seeding...\n');

  try {
    // Seed initial tokens
    await tokenIngestionService.seedInitialTokens();

    console.log('\n📊 Getting ingestion statistics...');
    const stats = await tokenIngestionService.getStats();

    console.log('\nDatabase Stats:');
    console.log(`  Total Tokens: ${stats.totalTokens}`);
    console.log(`  Total Snapshots: ${stats.totalSnapshots}`);
    console.log(
      `  Avg Snapshots/Token: ${stats.avgSnapshotsPerToken.toFixed(1)}`
    );
    if (stats.newestUpdate) {
      console.log(`  Newest Update: ${stats.newestUpdate.toLocaleString()}`);
    }

    console.log('\n✅ Seeding complete!');
    console.log('\n💡 Next steps:');
    console.log('  1. Check database: npx prisma studio');
    console.log('  2. View TokenMetrics table');
    console.log('  3. View TokenMetricSnapshot table');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
