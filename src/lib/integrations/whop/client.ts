// Whop API Client

const WHOP_API_BASE = 'https://api.whop.com/api/v5'

export class WhopClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${WHOP_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Whop API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Company/Creator Info
  async getCompany() {
    return this.request('/company')
  }

  // Products
  async getProducts() {
    return this.request('/products')
  }

  async getProduct(productId: string) {
    return this.request(`/products/${productId}`)
  }

  // Memberships (Subscribers)
  async getMemberships(productId?: string) {
    const params = productId ? `?product=${productId}` : ''
    return this.request(`/memberships${params}`)
  }

  async getMembership(membershipId: string) {
    return this.request(`/memberships/${membershipId}`)
  }

  // Analytics
  async getAnalytics(params: {
    start_date: string
    end_date: string
    product_id?: string
    group_by?: 'day' | 'week' | 'month'
  }) {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString()

    return this.request(`/analytics?${queryString}`)
  }

  // Revenue
  async getRevenue(params: {
    start_date: string
    end_date: string
    product_id?: string
  }) {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString()

    return this.request(`/revenue?${queryString}`)
  }
}
