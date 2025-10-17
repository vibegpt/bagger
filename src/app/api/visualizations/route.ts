import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface VisualizationRequest {
  type: 'pie-chart-losers' | 'comparison-success-rate' | 'bar-chart-scale' | 'whale-trend';
  data?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: VisualizationRequest = await request.json();

    // Use QuickChart.io for server-side chart generation (no API key needed)
    const chartUrl = generateChartUrl(body.type, body.data);

    return NextResponse.json({
      success: true,
      chartUrl,
      type: body.type,
      embedCode: `<img src="${chartUrl}" alt="${body.type}" width="1200" height="630" />`,
    });
  } catch (error) {
    console.error('Visualization generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate visualization',
      },
      { status: 500 }
    );
  }
}

function generateChartUrl(type: string, data?: any): string {
  const baseUrl = 'https://quickchart.io/chart';

  let config: any;

  switch (type) {
    case 'pie-chart-losers':
      config = {
        type: 'pie',
        data: {
          labels: ['Lose Money (97%)', 'Profit >$1K (3%)'],
          datasets: [
            {
              data: [97, 3],
              backgroundColor: ['#FF4757', '#14F195'],
              borderWidth: 2,
              borderColor: '#000',
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: 'Pump.fun User Profitability',
            fontSize: 32,
            fontColor: '#fff',
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              fontSize: 20,
              fontColor: '#fff',
            },
          },
          plugins: {
            datalabels: {
              color: '#fff',
              font: {
                size: 24,
                weight: 'bold',
              },
              formatter: (value: number) => `${value}%`,
            },
          },
        },
      };
      break;

    case 'comparison-success-rate':
      config = {
        type: 'bar',
        data: {
          labels: ['Zora', 'Pump.fun'],
          datasets: [
            {
              label: 'Success Rate (%)',
              data: [100, data?.pumpGraduationRate || 1.4],
              backgroundColor: ['#4169E1', '#9945FF'],
              borderWidth: 2,
              borderColor: ['#FF1493', '#14F195'],
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: 'Token Success Rates',
            fontSize: 32,
            fontColor: '#fff',
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  max: 100,
                  fontSize: 18,
                  fontColor: '#fff',
                },
                gridLines: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
            ],
            xAxes: [
              {
                ticks: {
                  fontSize: 24,
                  fontColor: '#fff',
                },
                gridLines: {
                  display: false,
                },
              },
            ],
          },
          legend: {
            display: false,
          },
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'top',
              color: '#fff',
              font: {
                size: 28,
                weight: 'bold',
              },
              formatter: (value: number) => `${value}%`,
            },
          },
        },
      };
      break;

    case 'bar-chart-scale':
      config = {
        type: 'bar',
        data: {
          labels: ['Daily Launches', 'Daily Survivors'],
          datasets: [
            {
              label: 'Pump.fun',
              data: [data?.pumpDailyLaunches || 20000, data?.pumpDailySurvivors || 200],
              backgroundColor: ['#9945FF', '#14F195'],
              borderWidth: 2,
              borderColor: '#000',
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: 'Pump.fun: Launch vs Survival',
            fontSize: 32,
            fontColor: '#fff',
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  fontSize: 18,
                  fontColor: '#fff',
                  callback: (value: number) => {
                    return value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value;
                  },
                },
                gridLines: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
            ],
            xAxes: [
              {
                ticks: {
                  fontSize: 20,
                  fontColor: '#fff',
                },
                gridLines: {
                  display: false,
                },
              },
            ],
          },
          legend: {
            display: false,
          },
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'top',
              color: '#fff',
              font: {
                size: 24,
                weight: 'bold',
              },
              formatter: (value: number) => {
                return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value;
              },
            },
          },
        },
      };
      break;

    case 'whale-trend':
      config = {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Whale Holdings Increase (%)',
              data: data?.whaleData || [2.1, 3.5, 5.8, 7.9],
              borderColor: '#14F195',
              backgroundColor: 'rgba(20, 241, 149, 0.1)',
              borderWidth: 4,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: 'Zora Whale Accumulation Trend',
            fontSize: 32,
            fontColor: '#fff',
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  fontSize: 18,
                  fontColor: '#fff',
                  callback: (value: number) => `${value}%`,
                },
                gridLines: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
            ],
            xAxes: [
              {
                ticks: {
                  fontSize: 18,
                  fontColor: '#fff',
                },
                gridLines: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
            ],
          },
          legend: {
            display: true,
            labels: {
              fontSize: 18,
              fontColor: '#fff',
            },
          },
          plugins: {
            datalabels: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 4,
              color: '#14F195',
              font: {
                size: 16,
                weight: 'bold',
              },
              formatter: (value: number) => `+${value}%`,
            },
          },
        },
      };
      break;

    default:
      throw new Error(`Unknown chart type: ${type}`);
  }

  // Apply dark theme
  config.options = {
    ...config.options,
    layout: {
      padding: 20,
    },
  };

  // Encode the config
  const encodedConfig = encodeURIComponent(JSON.stringify(config));

  // Return QuickChart URL with dark background
  return `${baseUrl}?backgroundColor=rgb(17,24,39)&width=1200&height=630&c=${encodedConfig}`;
}

// GET endpoint with type parameter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as VisualizationRequest['type'];

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    // Fetch latest report data for chart generation
    const reportRes = await fetch(`${request.nextUrl.origin}/api/weekly-report`);
    const reportData = await reportRes.json();

    let chartData;
    if (reportData.success) {
      chartData = {
        pumpGraduationRate: reportData.report.pumpfun.graduationRate,
        pumpDailyLaunches: reportData.report.pumpfun.dailyTokenLaunches,
        pumpDailySurvivors: reportData.report.pumpfun.dailyGraduations,
        zoraWhaleIncrease: reportData.report.zora.whaleHoldingIncrease,
      };
    }

    const chartUrl = generateChartUrl(type, chartData);

    return NextResponse.json({
      success: true,
      chartUrl,
      type,
    });
  } catch (error) {
    console.error('Visualization fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate visualization',
      },
      { status: 500 }
    );
  }
}
