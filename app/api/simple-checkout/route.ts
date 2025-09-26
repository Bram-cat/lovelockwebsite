import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

// Simplified checkout session creation without complex subscription service dependencies
export async function POST(request: NextRequest) {
  console.log('Simple checkout API called')

  try {
    const { priceId, userEmail, userId } = await request.json()

    console.log('Simple checkout request:', { priceId, userEmail, userId })

    // Check if user already has an active subscription
    try {
      const { data: existingSubscription, error: checkError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing subscription:', checkError)
      }

      if (existingSubscription) {
        console.log(`User ${userId} already has an active ${existingSubscription.subscription_type} subscription`)

        // Determine what action to suggest based on the current and requested tier
        const currentTier = existingSubscription.subscription_type

        // Extract tier from priceId to determine what they're trying to subscribe to
        let requestedTier = 'free'
        if (priceId?.includes('premium') || process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID === priceId || process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID === priceId) {
          requestedTier = 'premium'
        } else if (priceId?.includes('unlimited') || process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID === priceId || process.env.STRIPE_UNLIMITED_YEARLY_PRICE_ID === priceId) {
          requestedTier = 'unlimited'
        }

        let message = 'You already have an active subscription.'
        let actionSuggestion = 'manage'

        if (currentTier === 'premium' && requestedTier === 'unlimited') {
          message = 'You can upgrade from Premium to Unlimited through your billing portal.'
          actionSuggestion = 'upgrade'
        } else if (currentTier === 'unlimited' && requestedTier === 'premium') {
          message = 'You already have Unlimited access which includes all Premium features.'
          actionSuggestion = 'downgrade'
        } else if (currentTier === requestedTier) {
          message = `You already have an active ${currentTier} subscription.`
          actionSuggestion = 'manage'
        } else {
          message = 'You already have an active subscription. Use your billing portal to manage or change your plan.'
          actionSuggestion = 'manage'
        }

        return NextResponse.json(
          {
            error: message,
            hasActiveSubscription: true,
            currentTier,
            requestedTier,
            actionSuggestion,
            billingPortalAvailable: true
          },
          { status: 400 }
        )
      }
    } catch (dbError) {
      console.warn('Database check failed, proceeding with checkout:', dbError)
      // Continue with checkout if database check fails
    }

    // Basic validation
    if (!priceId || priceId === 'null' || priceId === null) {
      console.error('Invalid price ID received:', priceId)
      return NextResponse.json(
        { error: 'Price ID is required. Please select a valid subscription plan.' },
        { status: 400 }
      )
    }

    if (!userEmail) {
      console.error('Missing user email')
      return NextResponse.json(
        { error: 'User email is required for checkout.' },
        { status: 400 }
      )
    }

    if (!userId) {
      console.error('Missing user ID')
      return NextResponse.json(
        { error: 'User ID is required for checkout.' },
        { status: 400 }
      )
    }

    // Note: Authentication is handled client-side by Clerk
    // Server-side auth() might not work properly in all hosting environments

    // Verify Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured')
      return NextResponse.json(
        { error: 'Payment system not properly configured. Please contact support.' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || request.headers.get('origin')

    // Verify price exists in Stripe
    try {
      const price = await stripe.prices.retrieve(priceId)
      console.log('Price verification successful:', {
        priceId,
        active: price.active,
        currency: price.currency,
        amount: price.unit_amount
      })

      if (!price.active) {
        return NextResponse.json(
          { error: 'The selected subscription plan is currently inactive.' },
          { status: 400 }
        )
      }
    } catch (priceError) {
      console.error('Price verification failed:', priceError)
      return NextResponse.json(
        { error: `Invalid price ID: ${priceId}. This subscription plan may not be available.` },
        { status: 400 }
      )
    }

    // Create checkout session with minimal configuration
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: userEmail,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        clerk_id: userId,
        userEmail: userEmail,
        source: 'lovelock-simple-checkout'
      },
      subscription_data: {
        metadata: {
          clerk_id: userId,
          userEmail: userEmail,
          source: 'lovelock-simple-checkout'
        }
      }
    })

    console.log('Simple checkout session created:', {
      sessionId: session.id,
      url: !!session.url,
      customer_email: session.customer_email
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Simple checkout error:', error)
    console.error('Error type:', typeof error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')

    // Handle specific Stripe errors
    if (error instanceof Error) {
      console.error('Error message:', error.message)

      if (error.message.includes('No such price')) {
        return NextResponse.json(
          { error: 'Invalid subscription plan selected. Please try again.' },
          { status: 400 }
        )
      }
      if (error.message.includes('Invalid API Key')) {
        return NextResponse.json(
          { error: 'Payment system configuration error. Please contact support.' },
          { status: 500 }
        )
      }
      if (error.message.includes('auth')) {
        return NextResponse.json(
          { error: 'Authentication error. Please sign in again.' },
          { status: 401 }
        )
      }

      // Return the actual error message for debugging (you might want to remove this in production)
      return NextResponse.json(
        {
          error: `Payment processing failed: ${error.message}`,
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Unknown error occurred. Please try again.' },
      { status: 500 }
    )
  }
}