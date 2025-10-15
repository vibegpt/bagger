// Shared TypeScript types

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'scale'

export type Platform = 'whop' | 'gumroad' | 'stripe' | 'payhip'

export type SyncStatus = 'active' | 'error' | 'disconnected'

export type InsightType =
  | 'revenue_spike'
  | 'revenue_drop'
  | 'churn_warning'
  | 'milestone'
  | 'growth_opportunity'
  | 'competitor_activity'

export type InsightSeverity = 'info' | 'warning' | 'success' | 'critical'

export interface DashboardMetrics {
  totalRevenue: number
  mrr: number
  totalSubscribers: number
  churnRate: number
  growth: number
}

export interface ProductMetrics {
  id: string
  name: string
  revenue: number
  subscribers: number
  churnRate: number
  growth: number
  conversionRate: number
}

export interface RevenueChartData {
  date: string
  revenue: number
  subscribers?: number
}

export interface WhopProduct {
  id: string
  name: string
  description?: string
  price: number
  payment_processor?: string
  renewal_period?: string
  image_url?: string
  visibility_url?: string
}

export interface WhopAnalytics {
  date: string
  product_id: string
  revenue: number
  active_memberships: number
  new_memberships: number
  canceled_memberships: number
  views: number
  conversions: number
}

export interface SyncResult {
  success: boolean
  productsSynced?: number
  error?: string
}
