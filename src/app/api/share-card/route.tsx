import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'portfolio';
  const totalValue = searchParams.get('totalValue') || '$0';
  const tokenCount = searchParams.get('tokenCount') || '0';
  const topToken = searchParams.get('topToken') || 'N/A';
  const topTokenValue = searchParams.get('topTokenValue') || '$0';
  const holderCount = searchParams.get('holderCount') || '0';
  const userName = searchParams.get('userName') || 'Creator';

  if (type === 'portfolio') {
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '50px',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4169E1 0%, #FF1493 50%, #4169E1 100%)',
                boxShadow: '0 0 40px rgba(65, 105, 225, 0.6)',
              }}
            >
              <svg
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                Bagger
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Web3 Creator Analytics
              </div>
            </div>
          </div>

          {/* Main Stats Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              padding: '40px',
              gap: '30px',
            }}
          >
            {/* User Name */}
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                fontWeight: 600,
                color: 'white',
                textAlign: 'center',
              }}
            >
              {userName}'s Portfolio
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                gap: '30px',
              }}
            >
              {/* Total Value */}
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
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Total Value
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {totalValue}
                </div>
              </div>

              {/* Token Count */}
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
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Tokens
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {tokenCount}
                </div>
              </div>

              {/* Holder Count */}
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
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Total Holders
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {holderCount}
                </div>
              </div>
            </div>

            {/* Top Token */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Top Performing Token
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {topToken}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: '#4ADE80',
                }}
              >
                {topTokenValue}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
            }}
          >
            Track your Web3 creator portfolio at bagger.tools
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
