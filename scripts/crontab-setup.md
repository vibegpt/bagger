# Cron Job Setup Guide

## Overview

This guide explains how to set up automated weekly data reports using cron jobs.

## Option 1: Local Cron (macOS/Linux)

### Setup Instructions

1. **Edit your crontab:**
   ```bash
   crontab -e
   ```

2. **Add the following line** (runs every Monday at 8:00 AM):
   ```cron
   0 8 * * 1 cd /Users/toddbyrne/creator-analytics && ./scripts/weekly-automation.sh >> ./logs/cron.log 2>&1
   ```

3. **Save and exit** (`:wq` in vim)

4. **Verify the cron job is installed:**
   ```bash
   crontab -l
   ```

### Create logs directory:
```bash
mkdir -p /Users/toddbyrne/creator-analytics/logs
```

### Test the script manually:
```bash
cd /Users/toddbyrne/creator-analytics
./scripts/weekly-automation.sh
```

## Option 2: Vercel Cron (Recommended for Production)

### 1. Create Vercel Cron Configuration

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 13 * * 1"
    }
  ]
}
```

Note: Vercel uses UTC time, so `13` = 8 AM EST (13:00 UTC = 8 AM EST)

### 2. Create the Cron API Endpoint

File: `src/app/api/cron/weekly-report/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch report data
    const reportRes = await fetch(`${request.nextUrl.origin}/api/weekly-report`);
    const reportData = await reportRes.json();

    // Generate thread
    const threadRes = await fetch(`${request.nextUrl.origin}/api/twitter-thread`);
    const threadData = await threadRes.json();

    // TODO: Store in database
    // TODO: Send notification (email/Slack) with report summary

    return NextResponse.json({
      success: true,
      message: 'Weekly report generated successfully',
      data: {
        report: reportData,
        thread: threadData,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### 3. Set Environment Variable

Add to `.env.local` and Vercel:
```bash
CRON_SECRET=your-random-secret-here
```

Generate a secret:
```bash
openssl rand -base64 32
```

## Option 3: GitHub Actions (Free & Reliable)

### Create `.github/workflows/weekly-report.yml`:

```yaml
name: Weekly Report Automation

on:
  schedule:
    # Runs every Monday at 8:00 AM EST (13:00 UTC)
    - cron: '0 13 * * 1'
  workflow_dispatch: # Allows manual trigger

jobs:
  generate-weekly-report:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate weekly report
        env:
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
        run: |
          chmod +x ./scripts/weekly-automation.sh
          ./scripts/weekly-automation.sh

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: weekly-report-${{ github.run_number }}
          path: automation-output/

      - name: Send notification
        if: success()
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 587
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: Weekly Report Generated - Week ${{ github.run_number }}
          to: your-email@example.com
          from: Bagger Automation
          body: |
            Weekly report has been generated successfully.

            View the artifacts in GitHub Actions.
```

### Setup GitHub Secrets:
1. Go to your repo → Settings → Secrets and variables → Actions
2. Add:
   - `API_BASE_URL`: Your production URL (e.g., `https://bagger.tools`)
   - `EMAIL_USERNAME`: (optional) For notifications
   - `EMAIL_PASSWORD`: (optional) For notifications

## Cron Schedule Reference

```
# Format: minute hour day month weekday

# Every Monday at 8:00 AM EST (13:00 UTC)
0 13 * * 1

# Every day at 6:00 PM EST (23:00 UTC) for daily alpha
0 23 * * *

# First Monday of every month at 9:00 AM EST
0 14 1-7 * 1

# Twice weekly (Monday and Friday at 8 AM EST)
0 13 * * 1,5
```

## Testing

### Test locally:
```bash
cd /Users/toddbyrne/creator-analytics
./scripts/weekly-automation.sh
```

### Test Vercel cron locally:
```bash
curl http://localhost:3000/api/cron/weekly-report \
  -H "Authorization: Bearer your-cron-secret"
```

### Manually trigger GitHub Action:
1. Go to Actions tab in GitHub
2. Select "Weekly Report Automation"
3. Click "Run workflow"

## Monitoring

### Check cron logs (local):
```bash
tail -f /Users/toddbyrne/creator-analytics/logs/cron.log
```

### Check Vercel logs:
```bash
vercel logs
```

### Check GitHub Actions:
Go to your repository → Actions tab

## Notifications

### Option 1: Email via SendGrid

Add to cron API:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: 'your-email@example.com',
  from: 'noreply@bagger.tools',
  subject: `Weekly Report Generated - ${new Date().toLocaleDateString()}`,
  html: `
    <h2>Weekly Report Ready!</h2>
    <p>View at: <a href="${request.nextUrl.origin}/admin/reports">Admin Dashboard</a></p>
  `,
});
```

### Option 2: Slack Webhook

```typescript
await fetch(process.env.SLACK_WEBHOOK_URL!, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: '📊 Weekly report generated! Review at bagger.tools/admin',
  }),
});
```

### Option 3: Discord Webhook

```typescript
await fetch(process.env.DISCORD_WEBHOOK_URL!, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '📊 Weekly Bagger report is ready for review!',
    embeds: [{
      title: 'Weekly Data Report',
      description: `Zora vs Pump.fun comparison for week ${weekNumber}`,
      color: 0x4169E1,
      fields: [
        { name: 'Generated', value: new Date().toLocaleString(), inline: true },
        { name: 'Status', value: '✅ Ready to post', inline: true },
      ],
    }],
  }),
});
```

## Troubleshooting

### Cron job not running:
1. Check cron is running: `pgrep cron` or `launchctl list | grep cron` (macOS)
2. Verify crontab: `crontab -l`
3. Check logs: `grep CRON /var/log/syslog` (Linux) or check Console app (macOS)

### Script fails:
1. Check permissions: `ls -la scripts/weekly-automation.sh`
2. Run manually to see errors: `./scripts/weekly-automation.sh`
3. Check API is accessible: `curl http://localhost:3000/api/weekly-report`

### Images not generated:
1. Check QuickChart.io is accessible
2. Verify chart URLs in output files
3. Test individual chart generation: `curl "http://localhost:3000/api/visualizations?type=pie-chart-losers"`

## Recommended Setup

**For Development:**
- Use local cron or manual runs

**For Production:**
- **Primary**: GitHub Actions (free, reliable, portable)
- **Backup**: Vercel Cron (if hosting on Vercel)

**For Notifications:**
- Discord webhook (easiest to set up)
- Slack (if you use Slack for work)
- Email (most professional)
