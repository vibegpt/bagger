import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cardType = searchParams.get('type') || 'early-ape';

  // Common params
  const tokenName = searchParams.get('tokenName') || 'TOKEN';
  const tokenTicker = searchParams.get('tokenTicker') || 'TKN';

  // Early Ape params
  const entryPrice = searchParams.get('entryPrice') || '0';
  const currentPrice = searchParams.get('currentPrice') || '0';
  const pnlPercent = searchParams.get('pnlPercent') || '0';
  const timeAgo = searchParams.get('timeAgo') || '1h';
  const bondingProgress = searchParams.get('bondingProgress') || '0';

  // Raydium Watch params
  const raydiumPercent = searchParams.get('raydiumPercent') || '0';
  const holderCount = searchParams.get('holderCount') || '0';
  const priceChange24h = searchParams.get('priceChange24h') || '0';

  // Bag Status params
  const totalPnl = searchParams.get('totalPnl') || '0';
  const topToken1 = searchParams.get('topToken1') || 'N/A';
  const topToken2 = searchParams.get('topToken2') || 'N/A';
  const topToken3 = searchParams.get('topToken3') || 'N/A';
  const topPnl1 = searchParams.get('topPnl1') || '0';
  const topPnl2 = searchParams.get('topPnl2') || '0';
  const topPnl3 = searchParams.get('topPnl3') || '0';

  // Alpha Alert params
  const marketCap = searchParams.get('marketCap') || '0';
  const createdAgo = searchParams.get('createdAgo') || '1m';
  const initialLiquidity = searchParams.get('initialLiquidity') || '0';

  // Whale Watch params
  const whaleAction = searchParams.get('whaleAction') || 'BUY';
  const whaleAmount = searchParams.get('whaleAmount') || '0';
  const whalePercent = searchParams.get('whalePercent') || '0';
  const priceImpact = searchParams.get('priceImpact') || '0';

  if (cardType === 'early-ape') {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '40px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            EARLY APE 🦍
          </div>

          {/* Main Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '3px solid rgba(20, 241, 149, 0.5)',
              padding: '50px',
              gap: '30px',
              boxShadow: '0 0 60px rgba(153, 69, 255, 0.4)',
            }}
          >
            {/* Token Name */}
            <div
              style={{
                display: 'flex',
                fontSize: 52,
                fontWeight: 'bold',
                color: '#14F195',
                justifyContent: 'center',
              }}
            >
              ${tokenTicker}
            </div>

            {/* P&L Display */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Aped {timeAgo} ago
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 96,
                  fontWeight: 'bold',
                  color: parseFloat(pnlPercent) >= 0 ? '#14F195' : '#FF4757',
                }}
              >
                {parseFloat(pnlPercent) >= 0 ? '+' : ''}{pnlPercent}%
              </div>
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: '20px',
                borderTop: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Entry
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  ${entryPrice}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Current
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  ${currentPrice}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Bonding
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: '#9945FF',
                  }}
                >
                  {bondingProgress}%
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
            }}
          >
            Track your apes on bagger.tools
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  if (cardType === 'raydium-watch') {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '40px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            🚨 RAYDIUM WATCH 🚨
          </div>

          {/* Main Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '3px solid rgba(153, 69, 255, 0.5)',
              padding: '50px',
              gap: '30px',
              boxShadow: '0 0 60px rgba(20, 241, 149, 0.4)',
            }}
          >
            {/* Token Name */}
            <div
              style={{
                display: 'flex',
                fontSize: 52,
                fontWeight: 'bold',
                color: '#9945FF',
                justifyContent: 'center',
              }}
            >
              ${tokenTicker}
            </div>

            {/* Raydium Progress */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 96,
                  fontWeight: 'bold',
                  color: '#14F195',
                }}
              >
                {raydiumPercent}%
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                to Raydium Graduation
              </div>
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: '20px',
                borderTop: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Holders
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {holderCount}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  24h Change
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: parseFloat(priceChange24h) >= 0 ? '#14F195' : '#FF4757',
                  }}
                >
                  {parseFloat(priceChange24h) >= 0 ? '+' : ''}{priceChange24h}%
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Current Price
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  ${currentPrice}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
            }}
          >
            Get Raydium alerts on bagger.tools
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  if (cardType === 'bag-status') {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #14F195 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '40px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            💰 MY BAGS 💰
          </div>

          {/* Main Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '3px solid rgba(255, 217, 61, 0.5)',
              padding: '50px',
              gap: '30px',
              boxShadow: '0 0 60px rgba(255, 107, 107, 0.4)',
            }}
          >
            {/* Total P&L */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Total Portfolio P&L
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 96,
                  fontWeight: 'bold',
                  color: parseFloat(totalPnl) >= 0 ? '#14F195' : '#FF4757',
                }}
              >
                {parseFloat(totalPnl) >= 0 ? '+' : ''}{totalPnl}%
              </div>
            </div>

            {/* Top 3 Performers */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                paddingTop: '20px',
                borderTop: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 20,
                  color: 'rgba(255, 255, 255, 0.6)',
                  justifyContent: 'center',
                }}
              >
                Top Performers
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 32,
                      fontWeight: 'bold',
                      color: '#FFD93D',
                    }}
                  >
                    {topToken1}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: '#14F195',
                    }}
                  >
                    +{topPnl1}%
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 32,
                      fontWeight: 'bold',
                      color: '#C0C0C0',
                    }}
                  >
                    {topToken2}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: '#14F195',
                    }}
                  >
                    +{topPnl2}%
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 32,
                      fontWeight: 'bold',
                      color: '#CD7F32',
                    }}
                  >
                    {topToken3}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: '#14F195',
                    }}
                  >
                    +{topPnl3}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
            }}
          >
            Track all your bags on bagger.tools
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  if (cardType === 'alpha-alert') {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #9945FF 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '40px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            🔔 ALPHA ALERT 🔔
          </div>

          {/* Main Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '3px solid rgba(255, 107, 107, 0.5)',
              padding: '50px',
              gap: '30px',
              boxShadow: '0 0 60px rgba(153, 69, 255, 0.4)',
            }}
          >
            {/* New Token Badge */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: '#FF6B6B',
                  fontWeight: 'bold',
                }}
              >
                NEW TOKEN DISCOVERED
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 52,
                  fontWeight: 'bold',
                  color: '#14F195',
                }}
              >
                ${tokenTicker}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Created {createdAgo} ago
              </div>
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: '20px',
                borderTop: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Market Cap
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  ${marketCap}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Current Price
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#9945FF',
                  }}
                >
                  ${currentPrice}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Liquidity
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#14F195',
                  }}
                >
                  ${initialLiquidity}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '20px',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: '#FF6B6B',
                }}
              >
                EARLY OPPORTUNITY
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 20,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Fresh launch detected by Bagger
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
            }}
          >
            Get alpha alerts on bagger.tools
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  if (cardType === 'whale-watch') {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '40px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            🐋 WHALE WATCH 🐋
          </div>

          {/* Main Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '3px solid rgba(20, 241, 149, 0.3)',
              padding: '50px',
              gap: '30px',
              boxShadow: '0 0 60px rgba(20, 241, 149, 0.2)',
            }}
          >
            {/* Token Name */}
            <div
              style={{
                display: 'flex',
                fontSize: 52,
                fontWeight: 'bold',
                color: '#14F195',
                justifyContent: 'center',
              }}
            >
              ${tokenTicker}
            </div>

            {/* Whale Action */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: whaleAction === 'BUY' ? '#14F195' : '#FF4757',
                }}
              >
                WHALE {whaleAction}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                ${whaleAmount}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                {whalePercent}% of total supply
              </div>
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: '20px',
                borderTop: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Price Impact
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: whaleAction === 'BUY' ? '#14F195' : '#FF4757',
                  }}
                >
                  {parseFloat(priceImpact) >= 0 ? '+' : ''}{priceImpact}%
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Current Price
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  ${currentPrice}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Time
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#9945FF',
                  }}
                >
                  {timeAgo}
                </div>
              </div>
            </div>

            {/* Alert Message */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '20px',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: whaleAction === 'BUY' ? '#14F195' : '#FF4757',
                }}
              >
                {whaleAction === 'BUY' ? '⚠️ BULLISH SIGNAL' : '⚠️ BEARISH SIGNAL'}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
            }}
          >
            Track whale movements on bagger.tools
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  // Default fallback
  return new Response('Invalid card type', { status: 400 });
}
