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

    const { newPriceId } = await request.json()

    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    console.log('Processing subscription upgrade for user:', userId, 'to price:', newPriceId)

    // Get current subscription
    const userSubscription = await ProfileSubscriptionService.getUserSubscription(userId)

    if (!userSubscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found. Please subscribe first.' },
        { status: 400 }
      )
    }

    // Get the current Stripe subscription
    const currentSubscription = await stripe.subscriptions.retrieve(userSubscription.stripe_subscription_id)

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found in Stripe' },
        { status: 404 }
      )
    }

    // Verify the new price exists
    try {
      const newPrice = await stripe.prices.retrieve(newPriceId)
      if (!newPrice.active) {
        return NextResponse.json(
          { error: 'Selected price is not active' },
          { status: 400 }
        )
      }
    } catch (priceError) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Calculate prorations to show the customer what they'll be charged
    const prorationDate = Math.floor(Date.now() / 1000)

    // Create a preview of the upcoming invoice to show the user what they'll be charged
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: currentSubscription.customer as string,
      subscription: currentSubscription.id,
      subscription_items: [
        {
          id: currentSubscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      subscription_proration_date: prorationDate,
    })

    // Calculate the immediate charge amount
    const immediateCharge = upcomingInvoice.amount_due || 0

    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(currentSubscription.id, {
      items: [
        {
          id: currentSubscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
      billing_cycle_anchor: 'unchanged', // Keep the same billing cycle
    })

    // Update our local database
    await ProfileSubscriptionService.updateSubscriptionFromStripe(updatedSubscription)

    console.log('Successfully upgraded subscription:', updatedSubscription.id)

    // Get the updated subscription details for response
    const newPrice = await stripe.prices.retrieve(newPriceId)
    const product = await stripe.products.retrieve(newPrice.product as string)

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      immediateCharge: immediateCharge,
      newPrice: {
        id: newPrice.id,
        amount: newPrice.unit_amount,
        currency: newPrice.currency,
        interval: newPrice.recurring?.interval,
        product: product.name
      },
      message: `Successfully upgraded to ${product.name}${immediateCharge > 0 ? `. You will be charged $${(immediateCharge / 100).toFixed(2)} for the prorated amount.` : ''}`
    })

  } catch (error) {
    console.error('Error upgrading subscription:', error)

    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No such subscription')) {
        return NextResponse.json(
          { error: 'Subscription not found. Please contact support.' },
          { status: 404 }
        )
      }
      if (error.message.includes('No such customer')) {
        return NextResponse.json(
          { error: 'Customer not found. Please contact support.' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to upgrade subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Get upgrade preview (what the user will be charged)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const newPriceId = url.searchParams.get('priceId')

    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Get current subscription
    const userSubscription = await ProfileSubscriptionService.getUserSubscription(userId)

    if (!userSubscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    // Get the current Stripe subscription
    const currentSubscription = await stripe.subscriptions.retrieve(userSubscription.stripe_subscription_id)

    // Calculate what the upcoming invoice would look like
    const prorationDate = Math.floor(Date.now() / 1000)

    try {
      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: currentSubscription.customer as string,
        subscription: currentSubscription.id,
        subscription_items: [
          {
            id: currentSubscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        subscription_proration_date: prorationDate,
      })

      // Get price details
      const newPrice = await stripe.prices.retrieve(newPriceId)
      const product = await stripe.products.retrieve(newPrice.product as string)

      return NextResponse.json({
        immediateCharge: upcomingInvoice.amount_due || 0,
        currency: upcomingInvoice.currency,
        newPrice: {
          id: newPrice.id,
          amount: newPrice.unit_amount,
          currency: newPrice.currency,
          interval: newPrice.recurring?.interval,
          product: product.name
        },
        prorationDetails: upcomingInvoice.lines.data.map(line => ({
          description: line.description,
          amount: line.amount,
          period: line.period
        }))
      })

    } catch (error) {
      console.error('Error calculating upgrade preview:', error)
      return NextResponse.json(
        { error: 'Failed to calculate upgrade cost' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error getting upgrade preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}