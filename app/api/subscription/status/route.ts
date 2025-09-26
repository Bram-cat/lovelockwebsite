import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ProfileSubscriptionService } from '@/lib/profile-subscription'

export async function GET(request: NextRequest) {
  console.log('Subscription status API called')

  try {
    // For testing purposes, allow a test user ID via query parameter
    const url = new URL(request.url)
    const testUserId = url.searchParams.get('testUserId')

    let userId: string | null = null

    if (testUserId) {
      console.log('Using test user ID:', testUserId)
      userId = testUserId
    } else {
      console.log('Attempting to get auth...')
      const authResult = await auth()
      userId = authResult.userId
      console.log('Auth result:', { userId })

      if (!userId) {
        console.log('No userId found, returning 401')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    console.log('Getting subscription status for user:', userId)

    try {
      // Get complete subscription status which includes correct limits
      console.log('Getting complete subscription status...')
      const statusData = await ProfileSubscriptionService.getSubscriptionStatus(userId)
      console.log('Complete status result:', statusData)

      return NextResponse.json(statusData)
    } catch (serviceError) {
      console.error('Service error:', serviceError)
      // Return basic structure with error details
      return NextResponse.json({
        subscription: {
          id: '',
          tier: 'free',
          status: 'active',
          is_premium: false,
          is_unlimited: false,
          billing_cycle: 'monthly',
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          isExpired: false,
          daysRemaining: null,
        },
        usage: { numerology: 0, loveMatch: 0, trustAssessment: 0 },
        limits: { numerology: 3, loveMatch: 3, trustAssessment: 3 },
        error: serviceError instanceof Error ? serviceError.message : 'Service error'
      })
    }
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}