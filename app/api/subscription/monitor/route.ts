import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ProfileSubscriptionService } from '@/lib/profile-subscription'

// API endpoint to monitor and handle subscription expirations
// This should be called by a cron job or scheduled task
export async function POST(request: NextRequest) {
  try {
    // Verify request is from authorized source (in production, add proper auth)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN || 'dev_token_123'

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting subscription monitoring...')

    // Find subscriptions that have expired
    const { data: expiredSubscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .lt('ends_at', new Date().toISOString())
      .not('subscription_type', 'eq', 'free')

    if (error) {
      throw error
    }

    console.log(`Found ${expiredSubscriptions?.length || 0} expired subscriptions`)

    const results = []

    if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      for (const subscription of expiredSubscriptions) {
        try {
          // Downgrade expired subscription using new service
          await ProfileSubscriptionService.downgradeExpiredSubscription(subscription.user_id)

          results.push({
            clerkId: subscription.user_id,
            previousTier: subscription.subscription_type,
            status: 'downgraded_to_free',
            expiredAt: subscription.ends_at
          })

          console.log(`Downgraded expired subscription for user ${subscription.user_id}`)
        } catch (error) {
          console.error(`Failed to handle expired subscription for user ${subscription.user_id}:`, error)
          results.push({
            clerkId: subscription.user_id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    // Also find subscriptions expiring in the next 7 days for warning notifications
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: expiringSubscriptions, error: expiringError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .lt('ends_at', sevenDaysFromNow.toISOString())
      .gt('ends_at', new Date().toISOString())
      .not('subscription_type', 'eq', 'free')

    if (expiringError) {
      console.error('Error fetching expiring subscriptions:', expiringError)
    }

    const expiringWarnings = expiringSubscriptions?.map(sub => {
      const daysUntilExpiry = Math.ceil(
        (new Date(sub.ends_at).getTime() - new Date().getTime())
        / (1000 * 60 * 60 * 24)
      )
      return {
        clerkId: sub.user_id,
        tier: sub.subscription_type,
        daysUntilExpiry,
        expiresAt: sub.ends_at
      }
    }) || []

    return NextResponse.json({
      success: true,
      processed: results.length,
      expired: results,
      expiringSoon: expiringWarnings,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in subscription monitoring:', error)
    return NextResponse.json(
      {
        error: 'Failed to monitor subscriptions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Manual trigger endpoint for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testMode = searchParams.get('test') === 'true'

  if (!testMode) {
    return NextResponse.json(
      { error: 'Use POST for monitoring or add ?test=true for manual trigger' },
      { status: 400 }
    )
  }

  // Simulate a POST request for testing
  const testRequest = new Request(request.url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${process.env.CRON_SECRET_TOKEN || 'dev_token_123'}`
    }
  })

  return POST(testRequest as NextRequest)
}