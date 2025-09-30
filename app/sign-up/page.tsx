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
    <div className="min-h-screen cosmic-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px]"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/30"
          >
            <span className="text-4xl">💝</span>
          </motion.div>

          <h1 className="text-4xl font-bold text-white mb-3 text-glow">
            {isAutoTrigger ? 'Creating your account...' : 'Join Lovelock'}
          </h1>

          <p className="text-gray-300 text-lg">
            {isAutoTrigger
              ? 'Please wait while we redirect you to Google...'
              : 'Create your account to start your cosmic journey'
            }
          </p>

          {isAutoTrigger && (
            <div className="mt-6">
              <div className="spinner mx-auto"></div>
            </div>
          )}
        </div>

        <div className="glass p-8 rounded-[28px] border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            redirectUrl={redirectUrl}
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: '#a855f7',
                colorBackground: 'transparent',
                colorInputBackground: 'rgba(255, 255, 255, 0.08)',
                colorInputText: '#ffffff',
                colorText: '#ffffff',
                colorTextSecondary: '#d1d5db',
                colorSuccess: '#10b981',
                colorDanger: '#ef4444',
                colorWarning: '#f59e0b',
                colorNeutral: '#6b7280',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
              },
              elements: {
                rootBox: {
                  width: '100%'
                },
                card: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  padding: '0'
                },
                headerTitle: {
                  display: 'none'
                },
                headerSubtitle: {
                  display: 'none'
                },
                socialButtonsBlockButton: {
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '14px 16px',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-1px)'
                  }
                },
                socialButtonsBlockButtonText: {
                  color: '#ffffff',
                  fontWeight: '500'
                },
                dividerRow: {
                  display: isAutoTrigger ? 'none' : 'flex',
                  margin: '24px 0'
                },
                dividerText: {
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                },
                dividerLine: {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)'
                },
                formFieldLabel: {
                  color: '#e5e7eb',
                  fontWeight: '500',
                  marginBottom: '8px'
                },
                formFieldInput: {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '12px 14px',
                  '&:focus': {
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderColor: '#a855f7',
                    boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.1)'
                  },
                  '&::placeholder': {
                    color: '#9ca3af'
                  }
                },
                formButtonPrimary: {
                  backgroundColor: '#a855f7',
                  padding: '14px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#9333ea',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.4)'
                  }
                },
                footerActionText: {
                  color: '#d1d5db'
                },
                footerActionLink: {
                  color: '#a855f7',
                  fontWeight: '600',
                  '&:hover': {
                    color: '#c084fc'
                  }
                },
                identityPreviewEditButton: {
                  display: 'none'
                },
                formFieldInputShowPasswordButton: {
                  color: '#9ca3af'
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