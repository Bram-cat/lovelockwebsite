'use client'

import { useUser, UserProfile, UserButton, useClerk } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { User, Settings, Shield, Bell, CreditCard, Key, LogOut, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense, useRef } from 'react'
import { SubscriptionManagement } from '@/components/subscription-management'

function AccountPageContent() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mobileAuth, setMobileAuth] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Extract URL parameters safely
  const userId = searchParams?.get('userId') || null
  const email = searchParams?.get('email') || null
  const source = searchParams?.get('source') || null
  const section = searchParams?.get('section') || null

  // Track if redirect has already happened
  const redirected = useRef(false)

  // Handle mobile authentication parameters once
  useEffect(() => {
    if (source === 'mobile' && userId && email) {
      console.log('Mobile auth parameters detected:', { userId, email, section })
      setMobileAuth(true)
    }
  }, []) // Empty dependency array - run only once

  // Handle redirects for unauthenticated users
  useEffect(() => {
    if (isLoaded && !user && !redirected.current) {
      redirected.current = true

      if (mobileAuth && section) {
        // For mobile users, redirect to sign-in with return URL
        const returnUrl = `/account?section=${section}`
        router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`)
      } else {
        // Regular redirect to sign-in
        router.push('/sign-in')
      }
    }
  }, [isLoaded, user]) // Minimal dependencies

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Sign out and redirect to home page
      await signOut(() => router.push('/'))
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again or contact support.')
      setIsDeleting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center cosmic-bg">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    // Show appropriate message based on mobile auth
    return (
      <div className="min-h-screen flex items-center justify-center cosmic-bg">
        {mobileAuth ? (
          <Card className="glass border-white/10 bg-white/5 backdrop-blur-lg p-8">
            <CardContent className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Redirecting</h2>
              <p className="text-gray-300">Taking you to sign in...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="spinner"></div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen cosmic-bg">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white text-glow">
              Account Settings
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <a
              href="/dashboard"
              className="glass px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors border border-white/10 hover:border-white/20"
            >
              ← Back to Dashboard
            </a>
            <UserButton
              showName={false}
              afterSignOutUrl="/"
              userProfileUrl="https://lovelock.it.com/account"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 ring-2 ring-purple-400/50 hover:ring-purple-400 transition-all duration-300",
                  userButtonPopoverCard: "glass border-white/10 bg-white/10 backdrop-blur-lg",
                  userButtonPopoverText: "text-white",
                  userButtonPopoverActionButton: "text-gray-300 hover:text-white",
                  userButtonPopoverFooter: "border-white/10"
                }
              }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-glow">
              {section === 'billing' ? 'Billing & Subscription' : 'Account Settings'}
            </h1>
            <p className="text-xl text-gray-300">
              {section === 'billing'
                ? 'Manage your subscription and billing information'
                : 'Manage your profile and security settings'
              }
            </p>
          </motion.div>

          {/* Conditional Content Based on Section */}
          {section === 'billing' ? (
            /* Billing Section */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SubscriptionManagement />
            </motion.div>
          ) : (
            /* Clerk Account Management */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="clerk-profile-container">
                <UserProfile
                  path="/account"
                  routing="path"
                  appearance={{
                    baseTheme: undefined,
                    variables: {
                      colorPrimary: '#8b5cf6',
                      colorBackground: 'transparent',
                      colorInputBackground: 'rgba(255, 255, 255, 0.12)',
                      colorInputText: '#ffffff',
                      colorText: '#ffffff',
                      colorTextSecondary: '#d1d5db',
                      colorSuccess: '#10b981',
                      colorDanger: '#ef4444',
                      colorWarning: '#f59e0b',
                      colorNeutral: '#6b7280',
                      borderRadius: '1rem',
                    },
                    elements: {
                      // Hide billing-related elements since we handle billing via Stripe
                      navbarButton__billing: {
                        display: 'none !important'
                      },
                      navbarMobileMenuButton__billing: {
                        display: 'none !important'
                      },
                      // Additional billing element selectors to ensure complete hiding
                      profileSection__billing: {
                        display: 'none !important'
                      },
                      profilePage__billing: {
                        display: 'none !important'
                      },
                      navbar__billing: {
                        display: 'none !important'
                      },
                      // Hide any element with billing in the class name
                      '[data-testid*="billing"]': {
                        display: 'none !important'
                      },
                      // Hide notifications-related elements
                      navbarButton__notifications: {
                        display: 'none !important'
                      },
                      navbarMobileMenuButton__notifications: {
                        display: 'none !important'
                      },
                      profileSection__notifications: {
                        display: 'none !important'
                      },
                      profilePage__notifications: {
                        display: 'none !important'
                      },
                      navbar__notifications: {
                        display: 'none !important'
                      },
                      // Hide any element with notifications in the class name
                      '[data-testid*="notifications"]': {
                        display: 'none !important'
                      }
                    }
                  }}
                />

                {/* Log Out Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <button
                    onClick={() => signOut(() => router.push('/'))}
                    className="w-full glass px-6 py-3 rounded-lg text-white hover:bg-red-500/20 transition-all duration-300 border border-white/10 hover:border-red-500/50 flex items-center justify-center space-x-2 group"
                  >
                    <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                    <span className="font-medium">Log Out</span>
                  </button>
                </motion.div>

                {/* Delete Account Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <Card className="glass border-red-500/30 bg-red-500/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Trash2 className="w-5 h-5 text-red-400" />
                        <span>Danger Zone</span>
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Once you delete your account, there is no going back. Please be certain.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full glass px-6 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-300 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center space-x-2 group"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="font-medium">Delete Account</span>
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                            <p className="text-white font-medium mb-2">⚠️ This will permanently delete:</p>
                            <ul className="text-gray-300 text-sm space-y-1 ml-4 list-disc">
                              <li>Your account and profile information</li>
                              <li>All your numerology readings</li>
                              <li>All your love compatibility matches</li>
                              <li>All your trust assessments</li>
                              <li>Your subscription data</li>
                            </ul>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              disabled={isDeleting}
                              className="flex-1 glass px-6 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                              className="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300 border border-red-600 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDeleting ? (
                                <>
                                  <div className="spinner w-4 h-4"></div>
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  <span>Yes, Delete Forever</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center cosmic-bg">
          <div className="spinner"></div>
        </div>
      }
    >
      <AccountPageContent />
    </Suspense>
  )
}