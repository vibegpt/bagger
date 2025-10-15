// Whop data sync logic

import { db } from '@/lib/db'
import { WhopClient } from './client'

export async function syncWhopData(userId: string, accessToken: string) {
  const whop = new WhopClient(accessToken)

  try {
    // 1. Sync products
    console.log(`[Sync] Syncing products for user ${userId}`)
    const productsResponse = await whop.getProducts()
    const products = productsResponse.data || []

    for (const product of products) {
      await db.product.upsert({
        where: {
          userId_platform_platformProductId: {
            userId,
            platform: 'whop',
            platformProductId: product.id,
          },
        },
        update: {
          name: product.name || 'Unnamed Product',
          description: product.description,
          price: product.price ? product.price / 100 : 0, // Whop uses cents
          pricingType: product.payment_processor === 'stripe' ? 'subscription' : 'one_time',
          billingPeriod: product.renewal_period || 'one_time',
          imageUrl: product.image_url,
          url: product.visibility_url || `https://whop.com/product/${product.id}`,
          updatedAt: new Date(),
        },
        create: {
          userId,
          platform: 'whop',
          platformProductId: product.id,
          name: product.name || 'Unnamed Product',
          description: product.description,
          price: product.price ? product.price / 100 : 0,
          pricingType: product.payment_processor === 'stripe' ? 'subscription' : 'one_time',
          billingPeriod: product.renewal_period || 'one_time',
          imageUrl: product.image_url,
          url: product.visibility_url || `https://whop.com/product/${product.id}`,
        },
      })
    }

    // 2. Sync revenue data (last 90 days)
    console.log(`[Sync] Syncing analytics for user ${userId}`)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)

    const analytics = await whop.getAnalytics({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      group_by: 'day',
    })

    // Process analytics data
    if (analytics.data) {
      for (const dataPoint of analytics.data) {
        const date = new Date(dataPoint.date)

        // Find the product in our database
        const product = await db.product.findUnique({
          where: {
            userId_platform_platformProductId: {
              userId,
              platform: 'whop',
              platformProductId: dataPoint.product_id,
            },
          },
        })

        if (product) {
          await db.revenueSnapshot.upsert({
            where: {
              userId_productId_date: {
                userId,
                productId: product.id,
                date,
              },
            },
            update: {
              revenue: dataPoint.revenue ? dataPoint.revenue / 100 : 0,
              subscriberCount: dataPoint.active_memberships || 0,
              newSubscribers: dataPoint.new_memberships || 0,
              churnedSubscribers: dataPoint.canceled_memberships || 0,
              views: dataPoint.views || 0,
              conversions: dataPoint.conversions || 0,
            },
            create: {
              userId,
              productId: product.id,
              date,
              revenue: dataPoint.revenue ? dataPoint.revenue / 100 : 0,
              subscriberCount: dataPoint.active_memberships || 0,
              newSubscribers: dataPoint.new_memberships || 0,
              churnedSubscribers: dataPoint.canceled_memberships || 0,
              views: dataPoint.views || 0,
              conversions: dataPoint.conversions || 0,
            },
          })
        }
      }
    }

    // 3. Calculate aggregate daily metrics
    console.log(`[Sync] Calculating daily metrics for user ${userId}`)
    await calculateDailyMetrics(userId, startDate, endDate)

    // 4. Update last sync time
    await db.platformConnection.update({
      where: {
        userId_platform: {
          userId,
          platform: 'whop',
        },
      },
      data: {
        lastSyncedAt: new Date(),
        syncStatus: 'active',
      },
    })

    console.log(`[Sync] Successfully synced data for user ${userId}`)
    return { success: true, productsSynced: products.length }
  } catch (error) {
    console.error(`[Sync] Error syncing user ${userId}:`, error)

    // Mark connection as error
    await db.platformConnection.update({
      where: {
        userId_platform: {
          userId,
          platform: 'whop',
        },
      },
      data: {
        syncStatus: 'error',
      },
    })

    throw error
  }
}

async function calculateDailyMetrics(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const days: Date[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  for (const date of days) {
    // Sum revenue across all products for this day
    const dayData = await db.revenueSnapshot.aggregate({
      where: {
        userId,
        date,
      },
      _sum: {
        revenue: true,
        subscriberCount: true,
        newSubscribers: true,
        churnedSubscribers: true,
      },
    })

    const totalSubs = Number(dayData._sum.subscriberCount) || 0
    const churned = Number(dayData._sum.churnedSubscribers) || 0
    const churnRate = totalSubs > 0 ? (churned / totalSubs) * 100 : 0

    // Calculate MRR (sum of monthly subscription revenue)
    const products = await db.product.findMany({
      where: { userId },
      include: {
        revenueSnapshots: {
          where: { date },
        },
      },
    })

    let mrr = 0
    for (const product of products) {
      if (product.pricingType === 'subscription' && product.billingPeriod === 'monthly') {
        const snapshot = product.revenueSnapshots[0]
        if (snapshot) {
          mrr += Number(product.price) * snapshot.subscriberCount
        }
      }
      // Convert yearly to monthly
      if (product.pricingType === 'subscription' && product.billingPeriod === 'yearly') {
        const snapshot = product.revenueSnapshots[0]
        if (snapshot) {
          mrr += (Number(product.price) / 12) * snapshot.subscriberCount
        }
      }
    }

    await db.dailyMetric.upsert({
      where: {
        userId_date: { userId, date },
      },
      update: {
        totalRevenue: Number(dayData._sum.revenue) || 0,
        totalSubscribers: totalSubs,
        newSubscribers: Number(dayData._sum.newSubscribers) || 0,
        churnedSubscribers: churned,
        churnRate,
        mrr,
      },
      create: {
        userId,
        date,
        totalRevenue: Number(dayData._sum.revenue) || 0,
        totalSubscribers: totalSubs,
        newSubscribers: Number(dayData._sum.newSubscribers) || 0,
        churnedSubscribers: churned,
        churnRate,
        mrr,
      },
    })
  }
}
