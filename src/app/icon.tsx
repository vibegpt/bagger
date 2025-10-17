import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

// Icon generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4169E1 0%, #FF1493 50%, #4169E1 100%)',
          borderRadius: '20%',
          boxShadow: '0 0 40px rgba(65, 105, 225, 0.5)',
        }}
      >
        <svg
          width="320"
          height="320"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
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
    ),
    {
      ...size,
    }
  );
}
