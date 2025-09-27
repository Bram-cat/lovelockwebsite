import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { ProfileSubscriptionService } from '@/lib/profile-subscription'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`Manual subscription sync requested for user: ${userId}`)

    // Get customer information directly (avoid internal HTTP call)
    const userSubscription = await ProfileSubscriptionService.getUserSubscription(userId)

    if (!userSubscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No valid Stripe customer found' },
        { status: 404 }
      )
    }

    const customerId = userSubscription.stripe_customer_id

    // Get all subscriptions for this customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10
    })

    console.log(`Found ${subscriptions.data.length} subscriptions for customer ${customerId}`)

    // Find the most recent active subscription
    let latestSubscription = null
    for (const subscription of subscriptions.data) {
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        // Set clerk_id in metadata if missing
        if (!subscription.metadata?.clerk_id) {
          console.log(`Adding clerk_id to subscription metadata: ${subscription.id}`)
          await stripe.subscriptions.update(subscription.id, {
            metadata: { clerk_id: userId }
          })
          subscription.metadata.clerk_id = userId
        }
        latestSubscription = subscription
        break
      }
    }

    if (!latestSubscription) {
      // Check for any subscription with this user in metadata
      for (const subscription of subscriptions.data) {
        if (subscription.metadata?.clerk_id === userId) {
          latestSubscription = subscription
          break
        }
      }
    }

    if (latestSubscription) {
      console.log(`Processing subscription: ${latestSubscription.id}`)
      console.log(`Subscription status: ${latestSubscription.status}`)

      // Update subscription in Supabase
      await ProfileSubscriptionService.updateSubscriptionFromStripe(latestSubscription)

      return NextResponse.json({
        success: true,
        message: 'Subscription synced successfully',
        subscription: {
          id: latestSubscription.id,
          status: latestSubscription.status,
          current_period_start: new Date(latestSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(latestSubscription.current_period_end * 1000).toISOString()
        }
      })
    } else {
      // No active subscription found, ensure user is on free tier
      await ProfileSubscriptionService.cancelSubscription(userId)

      return NextResponse.json({
        success: true,
        message: 'No active subscription found, user set to free tier',
        subscription: null
      })
    }

  } catch (error) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}