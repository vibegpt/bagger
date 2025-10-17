import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px 80px',
        }}
      >
        {/* Left side - Logo and Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '40px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '180px',
              height: '180px',
              borderRadius: '32px',
              background: 'linear-gradient(135deg, #4169E1 0%, #FF1493 50%, #4169E1 100%)',
              boxShadow: '0 0 60px rgba(65, 105, 225, 0.6)',
            }}
          >
            <svg
              width="120"
              height="120"
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

          {/* Title and Tagline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 72,
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '-0.02em',
              }}
            >
              Bagger
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 32,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
              }}
            >
              Analytics for Web3 Creators
            </div>
          </div>
        </div>

        {/* Right side - Feature Pills */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '16px 32px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
              width: '320px',
              minWidth: '320px',
              justifyContent: 'center',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            📊 Track Tokens
          </div>
          <div
            style={{
              display: 'flex',
              padding: '16px 32px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
              width: '320px',
              minWidth: '320px',
              justifyContent: 'center',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            🎮 Stream Analytics
          </div>
          <div
            style={{
              display: 'flex',
              padding: '16px 32px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
              width: '320px',
              minWidth: '320px',
              justifyContent: 'center',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            💰 Holder Insights
          </div>
        </div>
      </div>
    ),
    {
      width: 1500,
      height: 500,
    }
  );
}
