// Whop OAuth helpers

const WHOP_OAUTH_URL = 'https://whop.com/oauth'
const WHOP_TOKEN_URL = 'https://whop.com/oauth/token'

export function getWhopAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.WHOP_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/connect/whop/callback`,
    response_type: 'code',
    scope: 'read_products read_memberships read_analytics read_company',
    state, // Pass user ID or session ID to verify callback
  })

  return `${WHOP_OAUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string) {
  const response = await fetch(WHOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.WHOP_CLIENT_ID,
      client_secret: process.env.WHOP_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/connect/whop/callback`,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in, // seconds
  }
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(WHOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.WHOP_CLIENT_ID,
      client_secret: process.env.WHOP_CLIENT_SECRET,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}
