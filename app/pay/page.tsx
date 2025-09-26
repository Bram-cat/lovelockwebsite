'use client'

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Heart, Sparkles, Crown, AlertCircle, ArrowRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PayPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [planType, setPlanType] = useState<string>('premium')
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    // Get plan type from URL params
    const plan = searchParams.get('plan') || 'premium'
    setPlanType(plan)

    // Get user info from URL params (passed from mobile app)
    const userParam = searchParams.get('user')
    if (userParam) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userParam))
        setUserInfo(decodedUser)
      } catch (error) {
        console.error('Error parsing user info:', error)
      }
    }
  }, [searchParams])

  useEffect(() => {
    // If user is already signed in, redirect to pricing
    if (isLoaded && user) {
      router.push(`/pricing?plan=${planType}`)
    }
  }, [isLoaded, user, planType, router])

  const getPlanInfo = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'unlimited':
        return {
          name: 'Unlimited',
          price: '$12.99/month',
          features: [
            'Unlimited Numerology readings',
            'Unlimited Love Match analyses',
            'Unlimited Trust Assessments',
            'Advanced AI insights',
            'Priority support',
            'Early access to features',
            'Export capabilities'
          ],
          gradient: 'from-yellow-500 to-orange-600'
        }
      case 'premium':
      default:
        return {
          name: 'Premium',
          price: '$4.99/month',
          features: [
            '25 Numerology readings per month',
            '15 Love Match analyses per month',
            '10 Trust Assessments per month',
            'Advanced AI insights',
            'Priority support'
          ],
          gradient: 'from-pink-500 to-purple-600'
        }
    }
  }

  const currentPlan = getPlanInfo(planType)

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white text-glow">Lovelock</span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <SignInButton mode="modal">
              <button className="glass px-6 py-2 rounded-lg text-white hover:bg-white/20 transition-all">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-20 flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="max-w-2xl mx-auto text-center">
          {/* Warning Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl mb-8 border border-yellow-500/30"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
              <span className="text-xl font-semibold text-white">Authentication Required</span>
            </div>
            <p className="text-gray-300">
              To complete your payment for the <strong>{currentPlan.name}</strong> plan,
              you need to sign in or create an account first.
            </p>
          </motion.div>

          {/* Plan Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-3xl mb-8"
          >
            <div className="text-center mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${currentPlan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{currentPlan.name} Plan</h2>
              <div className="text-2xl font-bold text-white mb-4">{currentPlan.price}</div>
            </div>

            <div className="space-y-3 mb-6">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 text-left">
                  <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* User Info Preview */}
          {userInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-6 rounded-2xl mb-8"
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Heart className="w-6 h-6 text-pink-400" />
                <span className="text-lg font-semibold text-white">Continuing from Lovelock App</span>
              </div>
              <p className="text-gray-300">
                We'll connect this purchase to your app account after you sign in.
              </p>
              {userInfo.email && (
                <p className="text-sm text-gray-400 mt-2">
                  Looking for: {userInfo.email}
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <SignUpButton mode="modal">
              <button className={`w-full bg-gradient-to-r ${currentPlan.gradient} px-8 py-4 rounded-xl text-white font-semibold text-lg btn-cosmic hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2`}>
                <span>Create Account & Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </SignUpButton>

            <SignInButton mode="modal">
              <button className="w-full glass px-8 py-4 rounded-xl text-white font-semibold text-lg hover:bg-white/20 transition-all">
                Sign In to Existing Account
              </button>
            </SignInButton>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                After signing in, you'll be redirected to complete your payment
              </p>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center space-x-8"
          >
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Secure Payment</div>
              <div className="text-white font-semibold">256-bit SSL</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Powered by</div>
              <div className="text-white font-semibold">Stripe</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Cancel</div>
              <div className="text-white font-semibold">Anytime</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}