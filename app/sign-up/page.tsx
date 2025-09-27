'use client'

import { SignUp } from '@clerk/nextjs'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'

function SignUpContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isAutoTrigger, setIsAutoTrigger] = useState(false)

  // Check if this is a Google OAuth redirect from the app
  useEffect(() => {
    const oauth = searchParams?.get('oauth')
    if (oauth === 'google') {
      setIsAutoTrigger(true)
      // Automatically trigger Google OAuth sign-up
      const googleButton = document.querySelector('[data-provider="google"]') as HTMLButtonElement
      if (googleButton) {
        setTimeout(() => {
          googleButton.click()
        }, 500) // Small delay to ensure the component is fully rendered
      }
    }
  }, [searchParams])

  const redirectUrl = searchParams?.get('redirect_url') || '/dashboard'

  return (
    <div className="min-h-screen cosmic-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-2xl">💝</span>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2 text-glow">
            {isAutoTrigger ? 'Creating your account...' : 'Join Lovelock'}
          </h1>

          <p className="text-gray-300">
            {isAutoTrigger
              ? 'Please wait while we redirect you to Google...'
              : 'Create your account to start your cosmic journey'
            }
          </p>

          {isAutoTrigger && (
            <div className="mt-4">
              <div className="spinner mx-auto"></div>
            </div>
          )}
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            redirectUrl={redirectUrl}
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
                rootBox: {
                  width: '100%'
                },
                card: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none'
                },
                headerTitle: {
                  display: 'none'
                },
                headerSubtitle: {
                  display: 'none'
                },
                socialButtonsBlockButton: {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                },
                socialButtonsBlockButtonText: {
                  color: '#ffffff',
                  fontWeight: '500'
                },
                dividerRow: {
                  display: isAutoTrigger ? 'none' : 'flex'
                },
                formButtonPrimary: {
                  backgroundColor: '#8b5cf6',
                  '&:hover': {
                    backgroundColor: '#7c3aed'
                  }
                },
                footerAction: {
                  display: isAutoTrigger ? 'none' : 'block'
                },
                identityPreviewEditButton: {
                  display: 'none'
                }
              }
            }}
          />
        </div>

        {/* Fallback for manual Google sign-up if auto-trigger fails */}
        {isAutoTrigger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-400 text-sm mb-4">
              Having trouble? Click the Google button above to sign up manually.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen cosmic-bg flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  )
}