import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Bagger - Analytics for Web3 Creators';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function OgImage() {
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
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            width: '200px',
            height: '200px',
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #4169E1 0%, #FF1493 50%, #4169E1 100%)',
            boxShadow: '0 0 60px rgba(65, 105, 225, 0.6)',
          }}
        >
          <svg
            width="140"
            height="140"
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
            }}
          >
            {/* Lucide Zap icon - exact match */}
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

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Bagger
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            textAlign: 'center',
          }}
        >
          Analytics for Web3 Creators
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '40px',
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            📊 Track Tokens
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            🎮 Stream Analytics
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            💰 Holder Insights
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
