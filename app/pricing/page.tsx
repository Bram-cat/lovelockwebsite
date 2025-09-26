'use client'

import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Check, Crown, Heart, Sparkles, Star, Zap, Shield, Calculator } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/stripe'
import { useRouter } from 'next/navigation'

// Types for subscription plans
interface SubscriptionPlan {
  priceId: string
  price: number
  interval: string
  name: string
  originalPrice?: number
  features: string[]
}

interface SubscriptionPlans {
  premium: {
    monthly: SubscriptionPlan
    yearly: SubscriptionPlan
  }
  unlimited: {
    monthly: SubscriptionPlan
    yearly: SubscriptionPlan
  }
}

export default function PricingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [useSimpleCheckout, setUseSimpleCheckout] = useState(false) // Use original checkout by default for now
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlans | null>(null)
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError, setPlansError] = useState<string | null>(null)
  const [userSubscription, setUserSubscription] = useState<any>(null)

  // Fetch subscription plans from API
  useEffect(() => {
    async function fetchPlans() {
      try {
        // Try the main API first
        let response = await fetch('/api/price-ids')
        let data = await response.json()

        if (!response.ok) {
          console.warn('Main price-ids API failed:', data)
          console.log('Trying fallback API...')

          // Try fallback API
          response = await fetch('/api/price-ids-fallback')
          if (!response.ok) {
            throw new Error('Both main and fallback APIs failed')
          }
          data = await response.json()
          console.log('Using fallback subscription plans:', data)
        } else {
          console.log('Fetched subscription plans from main API:', data)
        }

        setSubscriptionPlans(data.subscriptionPlans)
      } catch (error) {
        console.error('Error fetching subscription plans:', error)
        setPlansError(error instanceof Error ? error.message : 'Failed to load subscription plans')
      } finally {
        setPlansLoading(false)
      }
    }

    fetchPlans()
  }, [])

  // Fetch user subscription status
  useEffect(() => {
    async function fetchUserSubscription() {
      if (!user) return

      try {
        const response = await fetch('/api/subscription/simple-status')
        if (response.ok) {
          const data = await response.json()
          setUserSubscription(data.subscription)
          console.log('User subscription data:', data.subscription)
        }
      } catch (error) {
        console.error('Error fetching user subscription:', error)
        // Don't set error state, just continue without subscription data
      }
    }

    if (isLoaded && user) {
      fetchUserSubscription()
    }
  }, [isLoaded, user])

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      return // User needs to sign in first
    }

    if (!priceId) {
      console.error('Missing price ID for plan:', planName)
      alert('Error: Price ID is missing for this plan. Please refresh the page and try again.')
      return
    }

    if (!user.primaryEmailAddress?.emailAddress) {
      console.error('Missing user email address')
      alert('Error: User email is required for checkout. Please ensure your account has a valid email.')
      return
    }

    console.log('Subscribing with priceId:', priceId, 'for plan:', planName)
    console.log('User email:', user.primaryEmailAddress.emailAddress)
    setLoading(priceId)

    try {
      const endpoint = useSimpleCheckout ? '/api/simple-checkout' : '/api/create-checkout-session'
      console.log('Using checkout endpoint:', endpoint)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userId: user.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(`${endpoint} failed:`, data)

        // Handle existing subscription case
        if (data.hasActiveSubscription && data.billingPortalAvailable) {
          const actionText = data.actionSuggestion === 'upgrade' ? 'Upgrade Plan' :
                           data.actionSuggestion === 'downgrade' ? 'Manage Subscription' :
                           'Manage Subscription'

          const shouldRedirect = confirm(`${data.error}\n\nWould you like to go to your billing portal to ${actionText.toLowerCase()}?`)

          if (shouldRedirect) {
            // Redirect to dashboard where they can access billing portal
            window.location.href = '/dashboard'
            return
          } else {
            setLoading(null)
            return
          }
        }

        // If simple checkout fails, try the original checkout
        if (useSimpleCheckout) {
          console.log('Simple checkout failed, trying original checkout...')
          const fallbackResponse = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              priceId,
              userEmail: user.primaryEmailAddress?.emailAddress,
              userId: user.id
            }),
          })

          const fallbackData = await fallbackResponse.json()

          if (!fallbackResponse.ok) {
            // Handle existing subscription in fallback too
            if (fallbackData.hasActiveSubscription && fallbackData.billingPortalAvailable) {
              const actionText = fallbackData.actionSuggestion === 'upgrade' ? 'Upgrade Plan' :
                               fallbackData.actionSuggestion === 'downgrade' ? 'Manage Subscription' :
                               'Manage Subscription'

              const shouldRedirect = confirm(`${fallbackData.error}\n\nWould you like to go to your billing portal to ${actionText.toLowerCase()}?`)

              if (shouldRedirect) {
                window.location.href = '/dashboard'
                return
              } else {
                setLoading(null)
                return
              }
            }
            throw new Error(fallbackData.error || 'Both checkout methods failed')
          }

          // Redirect with fallback data
          window.location.href = fallbackData.url
          return
        }

        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start subscription process. Please try again.'
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(null)
    }
  }

  if (!isLoaded || plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-white">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  if (plansError || !subscriptionPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">
            <span className="text-6xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Plans</h2>
          <p className="text-gray-300 mb-6">{plansError || 'Failed to load subscription plans'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-xl text-white font-semibold btn-cosmic hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Helper function to determine if this is the user's current plan
  const isCurrentPlan = (tier: string, interval: string | null) => {
    if (!userSubscription) return false

    const currentTier = userSubscription.tier
    const currentInterval = userSubscription.billing_cycle === 'yearly' ? 'year' : 'month'

    return currentTier === tier && (interval === null || currentInterval === interval)
  }

  // Helper function to get the CTA text based on user's subscription
  const getPlanCTA = (tier: string, interval: string | null) => {
    if (!userSubscription) {
      return tier === 'free' ? 'Get Started Free' : tier === 'premium' ? 'Start Premium' : 'Go Unlimited'
    }

    const currentTier = userSubscription.tier

    if (isCurrentPlan(tier, interval)) {
      return 'Current Plan'
    }

    if (tier === 'free') {
      return 'Downgrade'
    }

    if (currentTier === 'free') {
      return tier === 'premium' ? 'Upgrade to Premium' : 'Upgrade to Unlimited'
    }

    if (currentTier === 'premium' && tier === 'unlimited') {
      return 'Upgrade to Unlimited'
    }

    if (currentTier === 'unlimited' && tier === 'premium') {
      return 'Downgrade to Premium'
    }

    return tier === 'premium' ? 'Start Premium' : 'Go Unlimited'
  }

  const plans = [
    {
      tier: 'free',
      name: 'Free',
      price: 0,
      originalPrice: null,
      interval: null,
      priceId: null, // Free plan doesn't need a price ID
      description: 'Get started with basic features',
      features: [
        '3 Numerology readings per month',
        '2 Love Match analyses per month',
        '1 Trust Assessment per month',
        'Basic insights',
        'Community support'
      ],
      cta: getPlanCTA('free', null),
      highlight: false,
      icon: Heart,
      gradient: 'from-gray-400 to-gray-600',
      isCurrent: isCurrentPlan('free', null)
    },
    {
      tier: 'premium',
      name: isYearly ? subscriptionPlans.premium.yearly.name : subscriptionPlans.premium.monthly.name,
      price: isYearly ? subscriptionPlans.premium.yearly.price : subscriptionPlans.premium.monthly.price,
      originalPrice: isYearly ? subscriptionPlans.premium.yearly.originalPrice : null,
      interval: isYearly ? 'year' : 'month',
      priceId: isYearly ? subscriptionPlans.premium.yearly.priceId : subscriptionPlans.premium.monthly.priceId,
      description: 'Perfect for regular users',
      features: isYearly ? subscriptionPlans.premium.yearly.features : subscriptionPlans.premium.monthly.features,
      cta: getPlanCTA('premium', isYearly ? 'year' : 'month'),
      highlight: !userSubscription || userSubscription.tier === 'free', // Highlight for new users or free users
      icon: Sparkles,
      gradient: 'from-pink-500 to-purple-600',
      isCurrent: isCurrentPlan('premium', isYearly ? 'year' : 'month')
    },
    {
      tier: 'unlimited',
      name: isYearly ? subscriptionPlans.unlimited.yearly.name : subscriptionPlans.unlimited.monthly.name,
      price: isYearly ? subscriptionPlans.unlimited.yearly.price : subscriptionPlans.unlimited.monthly.price,
      originalPrice: isYearly ? subscriptionPlans.unlimited.yearly.originalPrice : null,
      interval: isYearly ? 'year' : 'month',
      priceId: isYearly ? subscriptionPlans.unlimited.yearly.priceId : subscriptionPlans.unlimited.monthly.priceId,
      description: 'For power users who want everything',
      features: isYearly ? subscriptionPlans.unlimited.yearly.features : subscriptionPlans.unlimited.monthly.features,
      cta: getPlanCTA('unlimited', isYearly ? 'year' : 'month'),
      highlight: userSubscription && userSubscription.tier === 'premium', // Highlight for premium users (upgrade option)
      icon: Crown,
      gradient: 'from-yellow-500 to-orange-600',
      isCurrent: isCurrentPlan('unlimited', isYearly ? 'year' : 'month')
    }
  ]

  // Debug: Log plans to check price IDs
  console.log('Plans array:', plans.map(plan => ({
    tier: plan.tier,
    name: plan.name,
    priceId: plan.priceId,
    hasValidPriceId: !!plan.priceId
  })))

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white text-glow">Lovelock</span>
          </motion.div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <SignInButton mode="modal">
                  <button className="glass px-6 py-2 rounded-lg text-white hover:bg-white/20 transition-all">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 rounded-lg text-white font-medium btn-cosmic hover:shadow-lg transition-all">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-white">Welcome, {user.firstName}!</span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="glass px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all"
                >
                  Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
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

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-12 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-8">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">Choose Your Cosmic Journey</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6 text-glow"
          >
            Unlock Your
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"> Full Potential</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            Get unlimited access to numerology readings, love compatibility analysis,
            and trust assessments with our premium plans.
          </motion.p>

          {/* Yearly/Monthly Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-4 mb-12"
          >
            <span className={`text-lg ${!isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                isYearly ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-all duration-300 ${
                  isYearly ? 'left-9' : 'left-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="glass px-3 py-1 rounded-full text-sm text-green-400 font-medium">
                Save up to 20%
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`relative pricing-card ${
                  plan.highlight
                    ? 'glass border-2 border-pink-500 shadow-2xl scale-105'
                    : 'glass border border-white/10'
                } p-8 rounded-3xl`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    {plan.tier === 'free' ? (
                      <div className="text-4xl font-bold text-white">Free</div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-4xl font-bold text-white">
                          {formatPrice(plan.price)}
                        </span>
                        <div className="text-left">
                          <div className="text-sm text-gray-400">/{plan.interval}</div>
                          {plan.originalPrice && (
                            <div className="text-sm text-gray-400 line-through">
                              {formatPrice(plan.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center">
                  {plan.isCurrent ? (
                    <div className="w-full py-4 px-6 rounded-xl bg-green-600 text-white font-semibold">
                      ✓ Current Plan
                    </div>
                  ) : plan.tier === 'free' && userSubscription && userSubscription.tier !== 'free' ? (
                    <button
                      onClick={() => {
                        const shouldRedirect = confirm('To downgrade to the free plan, please use your billing portal to cancel your subscription. Would you like to go there now?')
                        if (shouldRedirect) {
                          router.push('/dashboard')
                        }
                      }}
                      className="w-full py-4 px-6 rounded-xl bg-gray-700 text-gray-300 font-semibold hover:bg-gray-600 transition-all"
                    >
                      {plan.cta}
                    </button>
                  ) : !user ? (
                    <SignUpButton mode="modal">
                      <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                        plan.highlight
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white btn-cosmic shadow-lg'
                          : 'glass text-white hover:bg-white/20'
                      }`}>
                        {plan.cta}
                      </button>
                    </SignUpButton>
                  ) : (
                    <button
                      onClick={() => {
                        if (plan.priceId) {
                          handleSubscribe(plan.priceId, plan.name)
                        } else if (plan.tier === 'free') {
                          const shouldRedirect = confirm('To switch to the free plan, please use your billing portal to cancel your subscription. Would you like to go there now?')
                          if (shouldRedirect) {
                            router.push('/dashboard')
                          }
                        }
                      }}
                      disabled={loading === plan.priceId || (plan.tier !== 'free' && !plan.priceId)}
                      className={`w-full py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.highlight
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white btn-cosmic shadow-lg'
                          : 'glass text-white hover:bg-white/20'
                      }`}
                    >
                      {loading === plan.priceId ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        plan.cta
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6 text-glow">
              Compare All Features
            </h2>
            <p className="text-xl text-gray-300">
              See what you get with each plan
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="glass rounded-2xl p-8"
          >
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div></div>
              <div className="text-center">
                <div className="text-white font-semibold">Free</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">Premium</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">Unlimited</div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { feature: 'Numerology readings/month', free: '3', premium: '25', unlimited: '∞' },
                { feature: 'Love Match analyses/month', free: '2', premium: '15', unlimited: '∞' },
                { feature: 'Trust Assessments/month', free: '1', premium: '10', unlimited: '∞' },
                { feature: 'AI-powered insights', free: '✗', premium: '✓', unlimited: '✓' },
                { feature: 'Priority support', free: '✗', premium: '✓', unlimited: '✓' },
                { feature: 'Early access to features', free: '✗', premium: '✗', unlimited: '✓' },
                { feature: 'Export capabilities', free: '✗', premium: '✗', unlimited: '✓' }
              ].map((row, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 py-3 border-b border-white/10">
                  <div className="text-gray-300">{row.feature}</div>
                  <div className="text-center text-gray-300">{row.free}</div>
                  <div className="text-center text-pink-400">{row.premium}</div>
                  <div className="text-center text-yellow-400">{row.unlimited}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="text-4xl font-bold text-white mb-16 text-glow">
              Frequently Asked Questions
            </h2>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              {[
                {
                  question: "Can I change my plan anytime?",
                  answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
                },
                {
                  question: "What happens if I cancel?",
                  answer: "You can cancel anytime. Your subscription remains active until the end of your current billing period."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "We offer a 30-day money-back guarantee if you're not satisfied with your subscription."
                },
                {
                  question: "How accurate are the readings?",
                  answer: "Our readings combine ancient numerology with modern AI to provide highly personalized and accurate insights."
                }
              ].map((faq, index) => (
                <div key={index} className="glass p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Lovelock</span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">
                © 2024 Lovelock. All rights reserved.
              </p>
              <p className="text-sm text-gray-500">
                Secure payments powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}