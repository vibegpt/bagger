import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WeeklyReportData {
  weekNumber: number;
  reportDate: Date;

  // Zora metrics
  zoraCreators: number;
  zoraTraders: number;
  zoraTradingVolume: number;
  zoraCreatorEarnings: number;
  zoraDailyCoins: number;
  zoraGraduationRate: number;
  zoraWhaleIncrease: number;
  zoraAvgEarnings: number;

  // Pump.fun metrics
  pumpDailyLaunches: number;
  pumpGraduationRate: number;
  pumpDailyGraduations: number;
  pumpDailyUsers: number;
  pumpProfitableUsers: number;
  pumpAvgProfit: number;

  // Arena metrics (STEALTH - collected but not displayed)
  arenaTVL?: number;
  arenaCreators?: number;
  arenaTicketHolders?: number;
  arenaDailyUsers?: number;
  arenaTradingVolume?: number;
  arenaGraduationRate?: number;
  arenaAvgEarnings?: number;
  arenaWhaleIncrease?: number;

  // Data sources
  zoraDataSource: string;
  pumpDataSource: string;
  arenaDataSource?: string;

  // Generated content
  twitterThread?: any;
  insights?: any;
  visualizations?: any;
}

/**
 * Save weekly report to database
 */
export async function saveWeeklyReport(data: WeeklyReportData) {
  try {
    const report = await prisma.weeklyReport.upsert({
      where: {
        weekNumber_reportDate: {
          weekNumber: data.weekNumber,
          reportDate: data.reportDate,
        },
      },
      update: {
        zoraCreators: data.zoraCreators,
        zoraTraders: data.zoraTraders,
        zoraTradingVolume: data.zoraTradingVolume,
        zoraCreatorEarnings: data.zoraCreatorEarnings,
        zoraDailyCoins: data.zoraDailyCoins,
        zoraGraduationRate: data.zoraGraduationRate,
        zoraWhaleIncrease: data.zoraWhaleIncrease,
        zoraAvgEarnings: data.zoraAvgEarnings,

        pumpDailyLaunches: data.pumpDailyLaunches,
        pumpGraduationRate: data.pumpGraduationRate,
        pumpDailyGraduations: data.pumpDailyGraduations,
        pumpDailyUsers: data.pumpDailyUsers,
        pumpProfitableUsers: data.pumpProfitableUsers,
        pumpAvgProfit: data.pumpAvgProfit,

        // Arena (stealth mode)
        arenaTVL: data.arenaTVL,
        arenaCreators: data.arenaCreators,
        arenaTicketHolders: data.arenaTicketHolders,
        arenaDailyUsers: data.arenaDailyUsers,
        arenaTradingVolume: data.arenaTradingVolume,
        arenaGraduationRate: data.arenaGraduationRate,
        arenaAvgEarnings: data.arenaAvgEarnings,
        arenaWhaleIncrease: data.arenaWhaleIncrease,

        zoraDataSource: data.zoraDataSource,
        pumpDataSource: data.pumpDataSource,
        arenaDataSource: data.arenaDataSource,

        twitterThread: data.twitterThread,
        insights: data.insights,
        visualizations: data.visualizations,

        updatedAt: new Date(),
      },
      create: {
        weekNumber: data.weekNumber,
        reportDate: data.reportDate,

        zoraCreators: data.zoraCreators,
        zoraTraders: data.zoraTraders,
        zoraTradingVolume: data.zoraTradingVolume,
        zoraCreatorEarnings: data.zoraCreatorEarnings,
        zoraDailyCoins: data.zoraDailyCoins,
        zoraGraduationRate: data.zoraGraduationRate,
        zoraWhaleIncrease: data.zoraWhaleIncrease,
        zoraAvgEarnings: data.zoraAvgEarnings,

        pumpDailyLaunches: data.pumpDailyLaunches,
        pumpGraduationRate: data.pumpGraduationRate,
        pumpDailyGraduations: data.pumpDailyGraduations,
        pumpDailyUsers: data.pumpDailyUsers,
        pumpProfitableUsers: data.pumpProfitableUsers,
        pumpAvgProfit: data.pumpAvgProfit,

        // Arena (stealth mode)
        arenaTVL: data.arenaTVL,
        arenaCreators: data.arenaCreators,
        arenaTicketHolders: data.arenaTicketHolders,
        arenaDailyUsers: data.arenaDailyUsers,
        arenaTradingVolume: data.arenaTradingVolume,
        arenaGraduationRate: data.arenaGraduationRate,
        arenaAvgEarnings: data.arenaAvgEarnings,
        arenaWhaleIncrease: data.arenaWhaleIncrease,

        zoraDataSource: data.zoraDataSource,
        pumpDataSource: data.pumpDataSource,
        arenaDataSource: data.arenaDataSource,

        twitterThread: data.twitterThread,
        insights: data.insights,
        visualizations: data.visualizations,
      },
    });

    return { success: true, report };
  } catch (error) {
    console.error('Error saving weekly report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get latest weekly report
 */
export async function getLatestWeeklyReport() {
  try {
    const report = await prisma.weeklyReport.findFirst({
      orderBy: { reportDate: 'desc' },
    });

    return { success: true, report };
  } catch (error) {
    console.error('Error fetching latest report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get weekly report by week number
 */
export async function getWeeklyReportByWeek(weekNumber: number) {
  try {
    const report = await prisma.weeklyReport.findFirst({
      where: { weekNumber },
      orderBy: { reportDate: 'desc' },
    });

    return { success: true, report };
  } catch (error) {
    console.error('Error fetching report by week:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get historical reports for trend analysis
 */
export async function getHistoricalReports(limit: number = 12) {
  try {
    const reports = await prisma.weeklyReport.findMany({
      orderBy: { reportDate: 'desc' },
      take: limit,
    });

    return { success: true, reports };
  } catch (error) {
    console.error('Error fetching historical reports:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Mark report as posted to Twitter
 */
export async function markReportAsPosted(
  weekNumber: number,
  twitterThreadUrl: string,
  engagement?: {
    views?: number;
    likes?: number;
    retweets?: number;
    replies?: number;
  }
) {
  try {
    const report = await prisma.weeklyReport.updateMany({
      where: {
        weekNumber,
        posted: false,
      },
      data: {
        posted: true,
        postedAt: new Date(),
        twitterThreadUrl,
        threadViews: engagement?.views,
        threadLikes: engagement?.likes,
        threadRetweets: engagement?.retweets,
        threadReplies: engagement?.replies,
      },
    });

    return { success: true, report };
  } catch (error) {
    console.error('Error marking report as posted:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get trend comparison (week-over-week changes)
 */
export async function getWeeklyTrends() {
  try {
    const reports = await prisma.weeklyReport.findMany({
      orderBy: { reportDate: 'desc' },
      take: 2,
    });

    if (reports.length < 2) {
      return {
        success: true,
        trends: null,
        message: 'Not enough data for trend analysis'
      };
    }

    const [current, previous] = reports;

    const trends = {
      zora: {
        creatorsChange: calculatePercentChange(
          previous.zoraCreators,
          current.zoraCreators
        ),
        earningsChange: calculatePercentChange(
          Number(previous.zoraCreatorEarnings),
          Number(current.zoraCreatorEarnings)
        ),
        volumeChange: calculatePercentChange(
          Number(previous.zoraTradingVolume),
          Number(current.zoraTradingVolume)
        ),
      },
      pump: {
        launchesChange: calculatePercentChange(
          previous.pumpDailyLaunches,
          current.pumpDailyLaunches
        ),
        graduationRateChange: calculatePercentChange(
          Number(previous.pumpGraduationRate),
          Number(current.pumpGraduationRate)
        ),
        usersChange: calculatePercentChange(
          previous.pumpDailyUsers,
          current.pumpDailyUsers
        ),
      },
    };

    return { success: true, trends, current, previous };
  } catch (error) {
    console.error('Error calculating trends:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 100;
  return ((newValue - oldValue) / oldValue) * 100;
}

export default prisma;
