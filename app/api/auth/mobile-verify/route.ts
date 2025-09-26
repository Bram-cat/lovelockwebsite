import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

interface MobileVerifyRequest {
  userId: string
  email: string
  source: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId, email, source }: MobileVerifyRequest = await request.json()

    if (!userId || !email || source !== 'mobile') {
      return NextResponse.json(
        { error: 'Invalid mobile verification request' },
        { status: 400 }
      )
    }

    // Find user in Clerk by email or external ID
    try {
      let clerkUser = null

      // Try to find user by email
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      })

      if (users.totalCount > 0) {
        clerkUser = users.data[0]
      } else {
        // Create new Clerk user if doesn't exist
        clerkUser = await clerkClient.users.createUser({
          emailAddress: [email],
          externalId: userId, // Store mobile app user ID as external ID
        })
      }

      return NextResponse.json({
        success: true,
        clerkUserId: clerkUser.id,
      })

    } catch (error) {
      console.error('Error finding/creating Clerk user:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Mobile verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}