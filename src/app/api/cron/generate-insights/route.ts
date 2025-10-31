import { NextRequest, NextResponse } from 'next/server';
import { generateInsightsForAllUsers } from '@/lib/services/insights-engine';

/**
 * Generate Correlation Insights Cron Job
 * Calculates and stores correlation insights for all users
 * Analyzes relationships between content and token performance
 *
 * GET /api/cron/generate-insights
 * Requires: CRON_SECRET in headers for authentication
 * Runs: Daily (configured in vercel.json)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting correlation insights generation cron job...');

    const results = await generateInsightsForAllUsers();

    console.log('Insights generation cron job complete:', results);

    return NextResponse.json({
      success: true,
      message: `Generated insights for ${results.successful}/${results.totalUsers} users`,
      ...results,
    });
  } catch (error) {
    console.error('Insights generation cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
