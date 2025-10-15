// Business metrics calculations

export function calculateChurnRate(
  totalSubscribers: number,
  churnedSubscribers: number
): number {
  if (totalSubscribers === 0) return 0
  return (churnedSubscribers / totalSubscribers) * 100
}

export function calculateMRR(
  products: Array<{
    price: number
    subscriberCount: number
    pricingType?: string | null
    billingPeriod?: string | null
  }>
): number {
  return products.reduce((sum, product) => {
    if (product.pricingType === 'subscription' && product.billingPeriod === 'monthly') {
      return sum + product.price * product.subscriberCount
    }
    // Convert yearly to monthly
    if (product.pricingType === 'subscription' && product.billingPeriod === 'yearly') {
      return sum + (product.price / 12) * product.subscriberCount
    }
    return sum
  }, 0)
}

export function calculateARR(mrr: number): number {
  return mrr * 12
}

export function calculateLTV(
  averageRevenue: number,
  averageLifetimeMonths: number
): number {
  return averageRevenue * averageLifetimeMonths
}

export function calculateCAC(
  marketingSpend: number,
  newCustomers: number
): number {
  if (newCustomers === 0) return 0
  return marketingSpend / newCustomers
}

export function calculateConversionRate(
  conversions: number,
  views: number
): number {
  if (views === 0) return 0
  return (conversions / views) * 100
}

export function getGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function getDaysInPeriod(period: 'week' | 'month' | 'quarter' | 'year'): number {
  switch (period) {
    case 'week':
      return 7
    case 'month':
      return 30
    case 'quarter':
      return 90
    case 'year':
      return 365
  }
}
