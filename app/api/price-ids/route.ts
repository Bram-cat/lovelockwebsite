import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get price IDs from environment variables
    const priceIds = {
      premium: {
        monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
        yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || ''
      },
      unlimited: {
        monthly: process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID || '',
        yearly: process.env.STRIPE_UNLIMITED_YEARLY_PRICE_ID || ''
      }
    }

    // Validate that all price IDs are configured
    const missingPriceIds = []
    if (!priceIds.premium.monthly) missingPriceIds.push('STRIPE_PREMIUM_MONTHLY_PRICE_ID')
    if (!priceIds.premium.yearly) missingPriceIds.push('STRIPE_PREMIUM_YEARLY_PRICE_ID')
    if (!priceIds.unlimited.monthly) missingPriceIds.push('STRIPE_UNLIMITED_MONTHLY_PRICE_ID')
    if (!priceIds.unlimited.yearly) missingPriceIds.push('STRIPE_UNLIMITED_YEARLY_PRICE_ID')

    if (missingPriceIds.length > 0) {
      console.error('Missing price ID environment variables:', missingPriceIds)
      console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('STRIPE')))
      console.error('NODE_ENV:', process.env.NODE_ENV)
      console.error('VERCEL_ENV:', process.env.VERCEL_ENV)

      return NextResponse.json(
        {
          error: 'Price configuration incomplete',
          missingPriceIds,
          availableStripeEnvVars: Object.keys(process.env).filter(key => key.includes('STRIPE')),
          help: 'Check your hosting platform environment variables configuration'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      priceIds,
      subscriptionPlans: {
        premium: {
          monthly: {
            priceId: priceIds.premium.monthly,
            price: 4.99,
            interval: 'month',
            name: 'Premium Monthly',
            features: [
              'Up to 25 Numerology readings per month',
              'Up to 15 Love Match analyses per month',
              'Up to 10 Trust Assessments per month',
              'Advanced AI insights',
              'Priority support'
            ]
          },
          yearly: {
            priceId: priceIds.premium.yearly,
            price: 49.99,
            interval: 'year',
            name: 'Premium Yearly',
            originalPrice: 59.88,
            features: [
              'Up to 25 Numerology readings per month',
              'Up to 15 Love Match analyses per month',
              'Up to 10 Trust Assessments per month',
              'Advanced AI insights',
              'Priority support',
              'Save $9.89/year'
            ]
          }
        },
        unlimited: {
          monthly: {
            priceId: priceIds.unlimited.monthly,
            price: 12.99,
            interval: 'month',
            name: 'Unlimited Monthly',
            features: [
              'Unlimited Numerology readings',
              'Unlimited Love Match analyses',
              'Unlimited Trust Assessments',
              'Advanced AI insights',
              'Priority support',
              'Early access to new features',
              'Export capabilities'
            ]
          },
          yearly: {
            priceId: priceIds.unlimited.yearly,
            price: 129.99,
            interval: 'year',
            name: 'Unlimited Yearly',
            originalPrice: 155.88,
            features: [
              'Unlimited Numerology readings',
              'Unlimited Love Match analyses',
              'Unlimited Trust Assessments',
              'Advanced AI insights',
              'Priority support',
              'Early access to new features',
              'Export capabilities',
              'Save $25.89/year'
            ]
          }
        }
      }
    })
  } catch (error) {
    console.error('Error retrieving price IDs:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve price configuration' },
      { status: 500 }
    )
  }
}