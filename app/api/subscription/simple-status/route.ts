import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Simple subscription status API called')

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Authenticated user:', userId)

    // For now, return a safe default response for free tier users
    // This allows the UI to work while we debug the database issues
    const defaultResponse = {
      hasSubscription: false,
      currentTier: 'free',
      subscription: {
        id: '',
        tier: 'free',
        status: 'active',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        isExpired: false,
        daysRemaining: null,
        billing_cycle: 'monthly',
        is_premium: false,
        is_unlimited: false
      },
      usage: {
        numerology: 0,
        loveMatch: 0,
        trustAssessment: 0
      },
      limits: {
        numerology: 3,
        loveMatch: 3,
        trustAssessment: 3
      },
      availableActions: ['upgrade'],
      message: 'Using simplified status - database connection being debugged'
    }

    console.log('Returning simple status response:', defaultResponse)

    return NextResponse.json(defaultResponse)

  } catch (error) {
    console.error('Error in simple subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to get status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action } = await request.json()

    console.log('Simple subscription action:', action, 'for user:', userId)

    // For now, just log the action and return success
    // This allows testing the UI while we fix the database issues
    return NextResponse.json({
      success: true,
      message: `Action '${action}' received for user ${userId}. Full implementation pending database fix.`,
      action,
      userId
    })

  } catch (error) {
    console.error('Error in simple subscription action:', error)
    return NextResponse.json(
      { error: 'Failed to process action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}