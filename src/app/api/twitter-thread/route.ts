import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface ThreadRequest {
  reportData?: any;
  manualData?: {
    zoraCreators: number;
    zoraEarnings: number;
    zoraAvgEarnings: number;
    pumpLosers: number;
    pumpAvgProfit: string;
    zoraSuccessRate: number;
    pumpGraduationRate: number;
    pumpDailyLaunches: number;
    pumpDailySurvivors: number;
    zoraWhaleIncrease: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ThreadRequest = await request.json();

    let data;

    if (body.manualData) {
      data = body.manualData;
    } else if (body.reportData) {
      // Extract from report data
      data = {
        zoraCreators: body.reportData.zora.totalCreators,
        zoraEarnings: body.reportData.zora.creatorEarnings,
        zoraAvgEarnings: body.reportData.zora.avgCreatorEarnings,
        pumpLosers: 97,
        pumpAvgProfit: body.reportData.pumpfun.avgUserProfit,
        zoraSuccessRate: body.reportData.zora.graduationRate,
        pumpGraduationRate: body.reportData.pumpfun.graduationRate,
        pumpDailyLaunches: body.reportData.pumpfun.dailyTokenLaunches,
        pumpDailySurvivors: body.reportData.pumpfun.dailyGraduations,
        zoraWhaleIncrease: body.reportData.zora.whaleHoldingIncrease,
      };
    } else {
      // Fetch latest report
      const reportRes = await fetch(`${request.nextUrl.origin}/api/weekly-report`);
      const reportData = await reportRes.json();

      if (!reportData.success) {
        throw new Error('Failed to fetch report data');
      }

      data = {
        zoraCreators: reportData.report.zora.totalCreators,
        zoraEarnings: reportData.report.zora.creatorEarnings,
        zoraAvgEarnings: reportData.report.zora.avgCreatorEarnings,
        pumpLosers: 97,
        pumpAvgProfit: reportData.report.pumpfun.avgUserProfit,
        zoraSuccessRate: reportData.report.zora.graduationRate,
        pumpGraduationRate: reportData.report.pumpfun.graduationRate,
        pumpDailyLaunches: reportData.report.pumpfun.dailyTokenLaunches,
        pumpDailySurvivors: reportData.report.pumpfun.dailyGraduations,
        zoraWhaleIncrease: reportData.report.zora.whaleHoldingIncrease,
      };
    }

    const thread = generateThread(data);

    return NextResponse.json({
      success: true,
      thread,
      metadata: {
        generatedAt: new Date().toISOString(),
        tweetCount: thread.length,
      },
    });
  } catch (error) {
    console.error('Twitter thread generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate thread',
      },
      { status: 500 }
    );
  }
}

function generateThread(data: any) {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(0)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const zoraEarningsFormatted = formatCurrency(data.zoraEarnings);
  const graduatedCount = Math.round(
    (data.pumpDailyLaunches * data.pumpGraduationRate) / 100
  );

  return [
    {
      number: 1,
      text: `🧵 WEEKLY DEGEN DATA: Zora vs Pump.fun

The data is in. Two platforms. Two completely different outcomes.

Which future are you betting on?

Let's talk numbers 👇`,
      image: null,
      type: 'hook',
    },
    {
      number: 2,
      text: `${data.pumpLosers}% of Pump.fun traders LOSE money.

Average profit? Less than ${data.pumpAvgProfit}.

Meanwhile, Zora paid creators ${zoraEarningsFormatted} in Q2 2025 alone.

Same Web3 space. Completely different games.`,
      image: 'pie-chart-losers',
      type: 'stat',
    },
    {
      number: 3,
      text: `SUCCESS RATES:

Zora: ${data.zoraSuccessRate}%
Every post becomes a tradable token. Guaranteed.

Pump.fun: ${data.pumpGraduationRate}%
${data.pumpDailyLaunches.toLocaleString()}+ tokens launch daily. Only ${graduatedCount} graduate to Raydium.

Guaranteed creation vs casino odds.`,
      image: 'comparison-success-rate',
      type: 'stat',
    },
    {
      number: 4,
      text: `EARNINGS REALITY CHECK:

Zora creators: ~$${data.zoraAvgEarnings} average earnings
Pump.fun users: ${data.pumpAvgProfit} average profit

Only 3% of Pump.fun users ever clear $1,000.

You're not playing the same game as the 1%.`,
      image: null,
      type: 'stat',
    },
    {
      number: 5,
      text: `THE SCALE IS WILD:

Pump.fun: ${data.pumpDailyLaunches.toLocaleString()}+ tokens launched DAILY
But only ~${data.pumpDailySurvivors} survive past Day 1 (${data.pumpGraduationRate}%)

Zora: 10,000 coins created daily
DOUBLED from 5K in just months

One burns through tokens. One builds them.`,
      image: 'bar-chart-scale',
      type: 'stat',
    },
    {
      number: 6,
      text: `SMART MONEY IS WATCHING:

Whale holdings on Zora increased +${data.zoraWhaleIncrease}% this quarter.

Big wallets quietly accumulating creator coins with 5-year vesting.

They're not chasing meme coin pumps. They're betting on sustainability.`,
      image: null,
      type: 'insight',
    },
    {
      number: 7,
      text: `TWO DIFFERENT FUTURES:

🏗️ Zora (Base):
• ${(data.zoraCreators / 1000).toFixed(0)}K creators earning
• $353M trading volume
• 5-year vesting model
• Real, sustainable income

🎰 Pump.fun (Solana):
• 50-70K daily traders
• Pure speculation
• ${data.pumpLosers}% lose money
• Viral lottery

Which are you building?`,
      image: null,
      type: 'comparison',
    },
    {
      number: 8,
      text: `We're tracking both platforms on @Bagger

Real-time analytics. No BS. Just data.

Are you team 📈 Creators or team 🎰 Degen?

Reply with your pick and why 👇

Track your bags: bagger.tools

📊 Data sources:
• Zora: Coins SDK + Blockworks Analytics
• Pump.fun: Bitquery + Solana on-chain data`,
      image: null,
      type: 'cta',
    },
  ];
}

// GET endpoint to fetch the latest generated thread
export async function GET(request: NextRequest) {
  try {
    // Generate thread with latest data
    const reportRes = await fetch(`${request.nextUrl.origin}/api/weekly-report`);
    const reportData = await reportRes.json();

    if (!reportData.success) {
      throw new Error('Failed to fetch report data');
    }

    const data = {
      zoraCreators: reportData.report.zora.totalCreators,
      zoraEarnings: reportData.report.zora.creatorEarnings,
      zoraAvgEarnings: reportData.report.zora.avgCreatorEarnings,
      pumpLosers: 97,
      pumpAvgProfit: reportData.report.pumpfun.avgUserProfit,
      zoraSuccessRate: reportData.report.zora.graduationRate,
      pumpGraduationRate: reportData.report.pumpfun.graduationRate,
      pumpDailyLaunches: reportData.report.pumpfun.dailyTokenLaunches,
      pumpDailySurvivors: reportData.report.pumpfun.dailyGraduations,
      zoraWhaleIncrease: reportData.report.zora.whaleHoldingIncrease,
    };

    const thread = generateThread(data);

    return NextResponse.json({
      success: true,
      thread,
      reportData: reportData.report,
      metadata: {
        generatedAt: new Date().toISOString(),
        tweetCount: thread.length,
      },
    });
  } catch (error) {
    console.error('Twitter thread fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch thread',
      },
      { status: 500 }
    );
  }
}
