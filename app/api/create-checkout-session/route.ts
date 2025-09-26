import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { priceId, userEmail, userId } = await request.json()

    console.log('Checkout session request:', { priceId, userEmail, userId })

    // Check if user already has an active subscription
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

    // Verify the Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured')
      return NextResponse.json(
        { error: 'Payment system not properly configured. Please contact support.' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || request.headers.get('origin')

    // Check if we're using test vs live keys
    const keyType = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live'

    // Verify price exists in Stripe first
    console.log('Attempting to verify price ID:', priceId)
    console.log('Using Stripe key type:', keyType)
    try {
      const price = await stripe.prices.retrieve(priceId)
      console.log('Price verification successful:', {
        priceId,
        active: price.active,
        currency: price.currency,
        amount: price.unit_amount,
        productId: price.product,
        keyType
      })

      if (!price.active) {
        console.error('Price is not active:', priceId)
        return NextResponse.json(
          { error: `The selected subscription plan is currently inactive. Please try a different plan.` },
          { status: 400 }
        )
      }
    } catch (priceError) {
      console.error('Price verification failed for ID:', priceId, 'Error:', priceError)
      console.error('Stripe key type:', keyType)

      // More specific error handling
      if (priceError instanceof Error) {
        if (priceError.message.includes('No such price')) {
          const keyMismatchMessage = keyType === 'live'
            ? 'This may be a test mode price ID, but you are using live Stripe keys. Please create price IDs in your live Stripe dashboard.'
            : 'This may be a live mode price ID, but you are using test Stripe keys. Please use test mode price IDs.'

          return NextResponse.json(
            {
              error: `Invalid price ID: ${priceId}`,
              details: `The price ID does not exist in your ${keyType} Stripe environment.`,
              suggestion: keyMismatchMessage,
              keyType: keyType
            },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        {
          error: `Failed to validate subscription plan: ${priceError instanceof Error ? priceError.message : 'Unknown error'}`,
          priceId: priceId,
          keyType: keyType
        },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    console.log('Creating checkout session with:', { priceId, userEmail, baseUrl })

    const sessionConfig = {
      mode: 'subscription' as const,
      payment_method_types: ['card' as const],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: userEmail,
      allow_promotion_codes: true,
      billing_address_collection: 'auto' as const,
      subscription_data: {
        metadata: {
          clerk_id: userId,
          userEmail: userEmail,
          source: 'lovelockweb'
        },
      },
      metadata: {
        clerk_id: userId,
        userEmail: userEmail,
        source: 'lovelockweb'
      }
    }

    console.log('Checkout session config:', JSON.stringify(sessionConfig, null, 2))

    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      url: !!session.url,
      mode: session.mode,
      customerId: session.customer,
      customerEmail: session.customer_email
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)

    // Handle specific Stripe errors
    console.error('Create checkout session error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')

    if (error instanceof Error) {
      console.error('Error message:', error.message)

      if (error.message.includes('No such price')) {
        return NextResponse.json(
          { error: 'Invalid subscription plan selected. Please refresh the page and try again.' },
          { status: 400 }
        )
      }
      if (error.message.includes('Invalid API Key')) {
        return NextResponse.json(
          { error: 'Payment system configuration error. Please contact support.' },
          { status: 500 }
        )
      }

      // Return detailed error for debugging
      return NextResponse.json(
        {
          error: `Payment processing failed: ${error.message}`,
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Unable to process payment at this time. Please try again later.' },
      { status: 500 }
    )
  }
}