# Deployment Checklist - Token Filtering System

## ✅ Completed Locally
- [x] Database schema with filtering models
- [x] DexScreener API client (300 req/min, free)
- [x] Token ingestion service with rug detection
- [x] Filtering engine (Established + Trending tiers)
- [x] API endpoints (`/api/leaderboard/established`, `/api/leaderboard/trending`)
- [x] Cron job endpoint (`/api/cron/update-tokens`)
- [x] Admin endpoint (`/api/admin/add-token`)
- [x] CLI script (`scripts/add-tokens.ts`)
- [x] UI with dual leaderboard tabs
- [x] Local environment variables configured
- [x] Vercel cron configuration (`vercel.json`)

## 📋 To Deploy to Production

### 1. Add Environment Variables to Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these two secrets:

```
CRON_SECRET=f1477af1a031e351669a435e76b8f14cfc8674775e97eb252b0402f10a41757c
ADMIN_SECRET=eccdde583f7005ae27d624824481c58201452eaaa81142a79aa0808a35e8bbd2
```

**Environment**: Production, Preview, Development (select all)

### 2. Run Database Migration on Production

```bash
# Push schema to production database
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

### 3. Seed Initial Tokens

```bash
# Run the seeding script
npx tsx src/lib/services/seed-tokens.ts
```

This will add the 5 initial tokens:
- CHILLGUY: $28.5M mcap
- DTV: $4.0M mcap
- WNTV: $2.7M mcap
- Birdie: $359k mcap
- Wolf: $169k mcap

### 4. Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Add token filtering system with automated updates

Features:
- Dual-tier filtering (Established + Trending)
- Anti-rug detection (price crash + liquidity drain)
- Automated updates every 10 minutes via Vercel Cron
- DexScreener API integration (300 req/min)
- Admin tools for token management
- Velocity-based ranking for trending tokens"

# Push to deploy
git push
```

### 5. Verify Cron Job Configuration

After deployment:

1. Go to **Vercel Dashboard → Your Project → Settings → Cron Jobs**
2. Verify the cron job is listed:
   - **Path**: `/api/cron/update-tokens`
   - **Schedule**: `*/10 * * * *` (every 10 minutes)
   - **Status**: Active

### 6. Test Production Endpoints

```bash
# Replace with your production URL
PROD_URL="https://your-app.vercel.app"

# Test Established leaderboard
curl "$PROD_URL/api/leaderboard/established?limit=10"

# Test Trending leaderboard
curl "$PROD_URL/api/leaderboard/trending?limit=20"

# Manually trigger cron job (optional)
curl "$PROD_URL/api/cron/update-tokens"
```

### 7. Add More Tokens (Optional)

To populate the Trending board with fresh tokens (<24h old):

**Method 1: CLI (run locally)**
```bash
npx tsx scripts/add-tokens.ts <mint-address-1> <mint-address-2>
```

**Method 2: API (from anywhere)**
```bash
curl -X POST $PROD_URL/api/admin/add-token \
  -H "Authorization: Bearer eccdde583f7005ae27d624824481c58201452eaaa81142a79aa0808a35e8bbd2" \
  -H "Content-Type: application/json" \
  -d '{"mintAddress": "YOUR_TOKEN_MINT_ADDRESS"}'
```

## 🔒 Security Notes

### Secrets Management
- ✅ Secrets added to `.env` (local only, gitignored)
- ✅ Secrets ready for Vercel (add via dashboard)
- ⚠️ **NEVER commit secrets to git**
- ⚠️ **Rotate secrets if exposed**

### Cron Job Security
- Vercel automatically sends `Authorization: Bearer ${CRON_SECRET}` header
- Endpoint validates the secret in production
- Development mode allows unauthenticated requests for testing

### Admin Endpoint Security
- Requires `Authorization: Bearer ${ADMIN_SECRET}` header
- Only accessible with correct secret
- Use for manual token additions

## 📊 Monitoring

### Check Filter Stats
```bash
# View how many tokens pass each filter
# (Implement a stats endpoint or check Prisma Studio)
```

### Check Cron Job Logs
1. Go to **Vercel Dashboard → Your Project → Deployments**
2. Click on latest deployment
3. Go to **Functions** tab
4. Find `/api/cron/update-tokens`
5. View execution logs

### Database Inspection
```bash
# Open Prisma Studio
npx prisma studio

# Check these tables:
# - TokenMetrics (current metrics)
# - TokenMetricSnapshot (historical data)
# - CreatorRegistry (verified creators)
```

## 🎯 Success Metrics

Track these KPIs after deployment:

- **Token Update Success Rate**: >95% of update attempts should succeed
- **Rug Detection Rate**: Monitor `priceCrashDetected` and `liquidityDrainDetected` flags
- **Filter Pass Rate**: >90% of non-scam tokens should pass Established filters after 3 days
- **API Response Time**: <1s for leaderboard endpoints
- **Cron Job Duration**: <30s for 50 token updates

## 🐛 Troubleshooting

### Cron Job Not Running
1. Check Vercel Dashboard → Cron Jobs for errors
2. Verify `CRON_SECRET` is set in environment variables
3. Check function logs for errors
4. Manually test: `curl $PROD_URL/api/cron/update-tokens`

### No Tokens in Trending Board
- Trending requires tokens 1-24 hours old
- Seeded tokens are all >24h old
- Add fresh tokens using CLI or API

### Database Connection Errors
- Verify `DATABASE_URL` is set correctly
- Check Supabase connection pooler settings
- Run `npx prisma generate` locally

### Rate Limit Errors (DexScreener)
- Limit: 300 requests/minute
- Current: 4 tokens/second with 250ms delay
- Adjust delay in `src/lib/services/token-ingestion.ts:184`

## 📚 Documentation

- **Full Implementation Plan**: `LEADERBOARD_FILTERING_PLAN.md`
- **System README**: `FILTERING_README.md`
- **Database Schema**: `prisma/schema.prisma`
- **This Checklist**: `DEPLOYMENT_CHECKLIST.md`

## 🚀 Post-Deployment

After successful deployment:

1. ✅ Monitor first cron job execution (10 min after deploy)
2. ✅ Add 5-10 fresh tokens for Trending board
3. ✅ Test leaderboard UI on production
4. ✅ Verify filter effectiveness over 24-48 hours
5. ✅ Document any issues or improvements needed

---

**Your Secrets (KEEP SAFE)**:
- `CRON_SECRET`: `f1477af1a031e351669a435e76b8f14cfc8674775e97eb252b0402f10a41757c`
- `ADMIN_SECRET`: `eccdde583f7005ae27d624824481c58201452eaaa81142a79aa0808a35e8bbd2`

Save these in a password manager! 🔐
