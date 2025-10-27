# Token Filtering System

## Overview

This system filters Pump.fun tokens to exclude pump-and-dumps while enabling discovery of legitimate projects.

## Filter Tiers

### 1. Established Creators
**Purpose**: Proven tokens with strong fundamentals

**Criteria**:
- Market cap ≥ $100,000
- Liquidity ≥ $25,000
- Volume (24h) ≥ $25,000
- Holders ≥ 200
- Token age ≥ 72 hours (3 days)
- No rug signals detected

**API**: `GET /api/leaderboard/established?limit=10`

### 2. Trending Launches (24h)
**Purpose**: Discover high-growth new tokens (higher risk)

**Criteria**:
- Market cap ≥ $10,000
- Liquidity ≥ $5,000
- Volume (24h) ≥ $5,000
- Holders ≥ 50
- Token age: 1-24 hours
- No rug signals detected
- Ranked by velocity score: `(mcap_growth × holder_growth) / age_hours`

**API**: `GET /api/leaderboard/trending?limit=20`

## Anti-Rug Detection

### Price Crash Detection
- Monitors last 2 hours of price snapshots
- Flags >80% drop from peak
- Implementation: `src/lib/integrations/dexscreener/client.ts:223-254`

### Liquidity Drain Detection
- Monitors last 30 minutes of liquidity snapshots
- Flags >50% liquidity removal
- Implementation: `src/lib/integrations/dexscreener/client.ts:256-289`

### Wash Trading Detection
- Status: TODO (placeholder in schema)
- Planned: Analyze trader uniqueness patterns

## Data Flow

```
1. Manual Token Addition
   ↓
   scripts/add-tokens.ts
   ↓
2. Token Ingestion
   ↓
   tokenIngestionService.ingestToken()
   ↓
3. DexScreener API Fetch
   ↓
   dexScreenerClient.getTokenData()
   ↓
4. Database Storage
   ↓
   Prisma: TokenMetrics + TokenMetricSnapshot
   ↓
5. Automated Updates (Every 10 min)
   ↓
   /api/cron/update-tokens
   ↓
6. Filter Application
   ↓
   tokenFilteringService.getEstablishedTokens()
   tokenFilteringService.getTrendingTokens()
   ↓
7. API Endpoints
   ↓
   /api/leaderboard/established
   /api/leaderboard/trending
   ↓
8. UI Display
   ↓
   Leaderboard page with sub-tabs
```

## Setup & Usage

### 1. Database Setup
```bash
# Run migrations
npx prisma migrate dev

# Seed initial tokens
npx tsx src/lib/services/seed-tokens.ts
```

### 2. Environment Variables
```env
# Required for production
CRON_SECRET=your-secret-here
ADMIN_SECRET=your-admin-secret-here

# Automatic (Prisma)
DATABASE_URL=postgresql://...
```

### 3. Add New Tokens

**Via CLI**:
```bash
# Single token
npx tsx scripts/add-tokens.ts CPLTbYbtDMKZtHBaPqdDmHjxNwESCEB14gm6VuoDpump

# Multiple tokens
npx tsx scripts/add-tokens.ts TOKEN1 TOKEN2 TOKEN3

# From file
cat new-tokens.txt | xargs npx tsx scripts/add-tokens.ts
```

**Via API** (requires ADMIN_SECRET):
```bash
curl -X POST http://localhost:3000/api/admin/add-token \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"mintAddress": "CPLTbYbtDMKZtHBaPqdDmHjxNwESCEB14gm6VuoDpump"}'
```

### 4. Automated Updates

**Vercel Cron** (configured in `vercel.json`):
- Runs every 10 minutes
- Updates all tokens
- Cleans up old snapshots (>7 days)
- Endpoint: `GET /api/cron/update-tokens`

**Manual Trigger**:
```bash
curl http://localhost:3000/api/cron/update-tokens
```

## Monitoring

### Get Filter Stats
```typescript
import { tokenFilteringService } from '@/lib/services/token-filtering';

const stats = await tokenFilteringService.getFilterStats();
// Returns: totalTokens, establishedCount, trendingCount, filteredOut breakdown
```

### Get Ingestion Stats
```typescript
import { tokenIngestionService } from '@/lib/services/token-ingestion';

const stats = await tokenIngestionService.getStats();
// Returns: totalTokens, tokensLast24h, totalSnapshots, avgSnapshotsPerToken
```

### Get Detailed Filter Breakdown
```typescript
const breakdown = await tokenFilteringService.getFilterBreakdown();
// Returns: passing, failedMarketCap, failedLiquidity, etc.
```

## Testing

### Test DexScreener API
```bash
npx tsx src/lib/integrations/dexscreener/test.ts
```

### Test Filter Logic
```bash
# Get established tokens
curl http://localhost:3000/api/leaderboard/established?limit=10

# Get trending tokens
curl http://localhost:3000/api/leaderboard/trending?limit=20
```

### Verify Database
```bash
npx prisma studio
# Navigate to TokenMetrics and TokenMetricSnapshot tables
```

## API Endpoints

### Public Endpoints
- `GET /api/leaderboard/established?limit=10` - Get top established tokens
- `GET /api/leaderboard/trending?limit=20` - Get top trending tokens

### Admin Endpoints (require auth)
- `POST /api/admin/add-token` - Add new tokens
- `GET /api/cron/update-tokens` - Manual update trigger

## Architecture Decisions

### Why DexScreener over Birdeye?
- Free tier: 300 req/min vs 100 req/min
- No API key required
- Already proven to work with Pump.fun tokens
- Simpler integration

### Why Two Filter Tiers?
Based on multi-model AI consensus (O3, Gemini-2.5-Pro, GPT-5):
- Established: Protects users from scams
- Trending: Enables early discovery of legit projects
- Clear risk separation with UI warnings

### Why Velocity Ranking for Trending?
- Market cap alone favors older tokens
- Velocity = growth rate relative to age
- Formula: `(mcap/age) × (holders/age)`
- Surfaces fast-growing new launches

## Future Enhancements

1. **Wash Trading Detection**
   - Analyze trader uniqueness patterns
   - Flag suspicious volume concentrations

2. **Creator Verification**
   - Link tokens to verified creators
   - Social media proof (Twitter, etc.)

3. **Automatic Token Discovery**
   - Monitor Pump.fun launches
   - Auto-ingest tokens meeting minimum criteria

4. **Advanced Rug Detection**
   - Honeypot detection
   - Ownership renouncement checks
   - Multi-sig wallet analysis

5. **Historical Analytics**
   - Token lifecycle tracking
   - Rug pull pattern analysis
   - Survival rate metrics

## Troubleshooting

### No Tokens Showing in Trending
- Check if any tokens in DB are 1-24 hours old
- Run: `npx tsx scripts/add-tokens.ts <new-token-address>`
- Verify filters in `src/lib/services/token-filtering.ts:36-44`

### Cron Job Not Running
- Verify `vercel.json` is deployed
- Check Vercel dashboard → Settings → Cron Jobs
- Set `CRON_SECRET` environment variable
- Test manually: `curl /api/cron/update-tokens`

### Database Connection Errors
- Verify `DATABASE_URL` in `.env`
- Run: `npx prisma generate`
- Check Prisma connection pool

### Rate Limit Errors
- DexScreener: 300 req/min
- Ingestion service delays 250ms between tokens
- Adjust in `src/lib/services/token-ingestion.ts:184`

## File Reference

| File | Purpose |
|------|---------|
| `src/lib/services/token-filtering.ts` | Filter logic & queries |
| `src/lib/services/token-ingestion.ts` | DexScreener data ingestion |
| `src/lib/integrations/dexscreener/client.ts` | API client + rug detection |
| `src/app/api/leaderboard/established/route.ts` | Established API |
| `src/app/api/leaderboard/trending/route.ts` | Trending API |
| `src/app/api/cron/update-tokens/route.ts` | Automated updates |
| `src/app/api/admin/add-token/route.ts` | Admin token addition |
| `scripts/add-tokens.ts` | CLI token addition |
| `prisma/schema.prisma` | Database models |
| `vercel.json` | Cron configuration |

## Support

For issues or questions, refer to:
- Full implementation plan: `LEADERBOARD_FILTERING_PLAN.md`
- Database schema: `prisma/schema.prisma`
- Filter specifications: This file (FILTERING_README.md)
