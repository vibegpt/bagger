# Environment Variables Setup

This document lists all required environment variables for the Creator Analytics platform.

## Required Variables

### Database
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/creator_analytics"
```

### Authentication (Clerk)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
```

## Optional API Keys

### Zora API (Reservoir)
```bash
# Optional - API works without key but has rate limits
ZORA_API_KEY="your-reservoir-api-key"
```
Get your key at: https://reservoir.tools

### Pump.fun API
```bash
# No API key required - uses public frontend API
# https://frontend-api.pump.fun
```

### Bitquery (for enhanced Solana data)
```bash
# Optional - for additional on-chain analytics
BITQUERY_API_KEY="your-bitquery-api-key"
```
Get your key at: https://bitquery.io

## Automation & Notifications

### Cron Job Security (Vercel)
```bash
# Generate with: openssl rand -base64 32
CRON_SECRET="your-random-secret-here"
```

### Email Notifications (SendGrid)
```bash
# Optional - for weekly report notifications
SENDGRID_API_KEY="SG.xxx"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
NOTIFICATION_EMAIL="your-email@example.com"
```

### Slack Notifications
```bash
# Optional - webhook URL for Slack notifications
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/xxx"
```

### Discord Notifications
```bash
# Optional - webhook URL for Discord notifications
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/xxx"
```

## API Configuration

### Base URL (for cron jobs)
```bash
# Production URL for API calls in automation
API_BASE_URL="https://your-domain.com"

# Local development
# API_BASE_URL="http://localhost:3000"
```

## Payment Integration (Future)

### Stripe
```bash
# For Pro tier subscriptions (when implemented)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Setup Instructions

### Local Development

1. **Copy example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required variables:**
   - Database connection string
   - Clerk authentication keys
   - (Optional) API keys for enhanced data

3. **Generate cron secret:**
   ```bash
   openssl rand -base64 32
   ```

4. **Test configuration:**
   ```bash
   npm run dev
   ```

### Vercel Production

1. **Go to your project settings:** https://vercel.com/your-project/settings/environment-variables

2. **Add all production variables:**
   - Set `DATABASE_URL` to production Postgres (Supabase, Railway, etc.)
   - Add Clerk production keys
   - Add `CRON_SECRET` for scheduled jobs
   - (Optional) Add notification webhooks

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### GitHub Actions

1. **Go to repository settings:** Settings → Secrets and variables → Actions

2. **Add secrets:**
   - `API_BASE_URL`: Your production URL
   - `EMAIL_USERNAME`: (optional) For notifications
   - `EMAIL_PASSWORD`: (optional) For notifications

## Security Best Practices

### Never commit secrets
- Add `.env.local` to `.gitignore` (already done)
- Never commit API keys or secrets to git
- Use environment variables for all sensitive data

### Rotate secrets regularly
- Change `CRON_SECRET` every 3-6 months
- Rotate API keys if compromised
- Update webhook URLs if leaked

### Use different keys per environment
- Development: Use test/development API keys
- Staging: Use separate staging keys
- Production: Use production-only keys

## Testing Environment Variables

### Check if variables are loaded:
```bash
node -e "console.log(process.env.DATABASE_URL ? 'DB connected' : 'DB not configured')"
```

### Test API connections:
```bash
# Test Zora API
curl "https://api-zora.reservoir.tools/coins/v1/trending" \
  -H "x-api-key: $ZORA_API_KEY"

# Test Pump.fun API
curl "https://frontend-api.pump.fun/coins/latest?limit=10"
```

### Test weekly report generation:
```bash
# Local
curl http://localhost:3000/api/weekly-report

# Production
curl https://your-domain.com/api/weekly-report
```

## Troubleshooting

### "DATABASE_URL is not defined"
- Make sure `.env.local` exists
- Restart your dev server after adding variables
- Check that variable name matches exactly (case-sensitive)

### "Clerk authentication failed"
- Verify you're using the correct environment keys (test vs prod)
- Check that keys are not wrapped in quotes in `.env.local`
- Ensure `NEXT_PUBLIC_` prefix for client-side variables

### "API rate limited"
- Add `ZORA_API_KEY` for higher rate limits
- Consider caching API responses
- Use database to store historical data

### "Cron job unauthorized"
- Verify `CRON_SECRET` matches in Vercel environment variables
- Check that cron endpoint is using correct authorization header
- Regenerate secret if compromised

## Environment Variable Reference

| Variable | Required | Purpose | Where to Get |
|----------|----------|---------|--------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection | Supabase, Railway, local |
| `CLERK_SECRET_KEY` | ✅ | Authentication | clerk.com |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Auth (client) | clerk.com |
| `ZORA_API_KEY` | ⚠️ | Enhanced rate limits | reservoir.tools |
| `CRON_SECRET` | ⚠️ | Secure cron jobs | `openssl rand -base64 32` |
| `API_BASE_URL` | ⚠️ | Automation scripts | Your domain |
| `SENDGRID_API_KEY` | ❌ | Email notifications | sendgrid.com |
| `SLACK_WEBHOOK_URL` | ❌ | Slack notifications | slack.com/apps |
| `DISCORD_WEBHOOK_URL` | ❌ | Discord notifications | discord.com |

✅ = Required for basic functionality
⚠️ = Required for production/automation
❌ = Optional enhancement

## Next Steps

1. Set up local environment variables
2. Test API endpoints locally
3. Configure production environment on Vercel
4. Set up cron job with `CRON_SECRET`
5. (Optional) Configure notification webhooks
6. Run database migration: `npx prisma migrate dev`
