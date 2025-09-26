import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access billing portal.' },
        { status: 401 }
      )
    }

    const { customerId } = await request.json()

    if (!customerId || customerId.startsWith('mock_') || customerId.startsWith('fallback_')) {
      return NextResponse.json(
        { error: 'No active subscription found. Please upgrade to a paid plan to access billing portal.' },
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

    const returnUrl = process.env.NEXT_PUBLIC_DOMAIN
      ? `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard`
      : `${request.headers.get('origin')}/dashboard`

    // Check if we're in test mode
    const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
    console.log('Stripe mode:', isTestMode ? 'TEST' : 'LIVE')

    // Create Stripe billing portal session
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })

      if (!session.url) {
        return NextResponse.json(
          { error: 'Failed to create billing portal session. Please try again.' },
          { status: 500 }
        )
      }

      return NextResponse.json({ url: session.url })
    } catch (billingError) {
      console.error('Billing portal creation failed:', billingError)
      console.error('Full error details:', billingError)

      // Handle billing portal configuration errors
      if (billingError instanceof Error) {
        if (billingError.message.includes('billing_portal_configuration')) {
          const modeMessage = isTestMode
            ? 'Billing portal is not configured for test mode. Please configure test mode billing portal in your Stripe dashboard.'
            : 'Billing portal is not configured. Please configure billing portal in your Stripe dashboard.'

          return NextResponse.json(
            { error: modeMessage },
            { status: 400 }
          )
        }

        if (billingError.message.includes('configuration')) {
          return NextResponse.json(
            { error: `Billing portal configuration error in ${isTestMode ? 'test' : 'live'} mode. Please check your Stripe dashboard.` },
            { status: 400 }
          )
        }
      }

      throw billingError
    }
  } catch (error) {
    console.error('Error creating billing portal session:', error)

    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No such customer')) {
        return NextResponse.json(
          { error: 'Customer not found. Please contact support.' },
          { status: 400 }
        )
      }
      if (error.message.includes('Invalid API Key')) {
        return NextResponse.json(
          { error: 'Payment system configuration error. Please contact support.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Unable to access billing portal at this time. Please try again later.' },
      { status: 500 }
    )
  }
}