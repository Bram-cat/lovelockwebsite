import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { ProfileSubscriptionService } from '@/lib/profile-subscription'
import { supabaseAdmin } from '@/lib/supabase'

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
      // User doesn't have a Stripe customer ID yet - this is normal for free users
      // Try to find a Stripe customer by email
      const profile = await ProfileSubscriptionService.getUserProfile(userId)

      if (!profile?.email) {
        return NextResponse.json(
          { error: 'No user profile or email found. Please ensure you have a complete profile.' },
          { status: 404 }
        )
      }

      // Search for existing Stripe customer by email
      try {
        const customers = await stripe.customers.list({
          email: profile.email,
          limit: 1
        })

        if (customers.data.length === 0) {
          return NextResponse.json(
            { error: 'No Stripe customer found for this email. Please upgrade through the pricing page first.' },
            { status: 404 }
          )
        }

        const customerId = customers.data[0].id
        console.log(`Found Stripe customer ${customerId} for email ${profile.email}`)

        // Update the user's subscription record with the found customer ID if they have one
        if (userSubscription) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ stripe_customer_id: customerId })
            .eq('id', userSubscription.id)
        }

        // Continue with sync using the found customer ID
        return await syncWithCustomerId(userId, customerId)
      } catch (error) {
        console.error('Error searching for Stripe customer:', error)
        return NextResponse.json(
          { error: 'Error finding Stripe customer' },
          { status: 500 }
        )
      }
    }

    const customerId = userSubscription.stripe_customer_id
    return await syncWithCustomerId(userId, customerId)

  } catch (error) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}

async function syncWithCustomerId(userId: string, customerId: string) {
  try {
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
    console.error('Error in syncWithCustomerId:', error)
    return NextResponse.json(
      { error: 'Failed to sync with customer ID' },
      { status: 500 }
    )
  }
}