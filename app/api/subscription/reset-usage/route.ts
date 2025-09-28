import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
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

    console.log(`Manual usage reset requested for user: ${userId}`)

    // Reset usage statistics
    await ProfileSubscriptionService.resetUsageStats(userId)

    return NextResponse.json({
      success: true,
      message: 'Usage statistics reset successfully'
    })

  } catch (error) {
    console.error('Error resetting usage:', error)
    return NextResponse.json(
      { error: 'Failed to reset usage statistics' },
      { status: 500 }
    )
  }
}