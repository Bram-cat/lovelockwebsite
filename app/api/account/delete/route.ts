import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`Starting account deletion for user: ${userId}`)

    // 1. Cancel any active Stripe subscriptions
    try {
      const { data: subscriptions } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_subscription_id, stripe_customer_id')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          // Cancel Stripe subscription
          if (sub.stripe_subscription_id) {
            try {
              await stripe.subscriptions.cancel(sub.stripe_subscription_id)
              console.log(`Cancelled Stripe subscription: ${sub.stripe_subscription_id}`)
            } catch (stripeError) {
              console.error('Error cancelling Stripe subscription:', stripeError)
            }
          }

          // Delete Stripe customer
          if (sub.stripe_customer_id) {
            try {
              await stripe.customers.del(sub.stripe_customer_id)
              console.log(`Deleted Stripe customer: ${sub.stripe_customer_id}`)
            } catch (stripeError) {
              console.error('Error deleting Stripe customer:', stripeError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling Stripe cleanup:', error)
    }

    // 2. Delete all user data from Supabase tables
    const tables = [
      'trust_assessments',
      'numerology_readings',
      'love_matches',
      'subscriptions',
      'profiles'
    ]

    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', userId)

        if (error) {
          console.error(`Error deleting from ${table}:`, error)
        } else {
          console.log(`Deleted user data from ${table}`)
        }
      } catch (error) {
        console.error(`Error deleting from ${table}:`, error)
      }
    }

    // 3. Delete user from Clerk
    try {
      const client = await clerkClient()
      await client.users.deleteUser(userId)
      console.log(`Deleted Clerk user: ${userId}`)
    } catch (clerkError) {
      console.error('Error deleting Clerk user:', clerkError)
      return NextResponse.json(
        { error: 'Failed to delete user account from authentication system' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again or contact support.' },
      { status: 500 }
    )
  }
}