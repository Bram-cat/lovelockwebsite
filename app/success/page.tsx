'use client'

import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { CheckCircle, Heart, Sparkles, ArrowRight, Crown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SuccessPage() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')


  const handleDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-6">
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
        </div>
      </nav>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 1.5}s`
            }}
          />
        ))}
      </div>

      {/* Success Content */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-glow">
              Payment
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"> Successful</span>!
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto">
              Congratulations! Your subscription is now active. You can now enjoy unlimited access to all premium features.
            </p>

            {user && (
              <div className="glass p-6 rounded-2xl mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">Premium Activated</span>
                </div>
                <p className="text-gray-300">
                  Welcome to the premium experience, {user.firstName}! Your cosmic journey just got a major upgrade.
                </p>
              </div>
            )}

            {sessionId && (
              <div className="text-sm text-gray-400 mb-8">
                Session ID: {sessionId}
              </div>
            )}
          </motion.div>

          {/* Dashboard Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mb-12"
          >
            <button
              onClick={handleDashboard}
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-xl text-white font-semibold text-lg btn-cosmic hover:shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Success Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass p-6 rounded-xl max-w-md mx-auto"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">What's Next?</h3>
              <p className="text-gray-300 text-sm">
                Your premium subscription is now active! Head to your dashboard to explore all the enhanced features and start your cosmic journey.
              </p>
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-white mb-8">What's Next?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "Unlimited Readings",
                  description: "Access unlimited numerology readings and insights"
                },
                {
                  icon: Heart,
                  title: "Love Compatibility",
                  description: "Discover deep relationship insights with anyone"
                },
                {
                  icon: Crown,
                  title: "Premium Features",
                  description: "Enjoy all premium features and priority support"
                }
              ].map((feature, index) => (
                <div key={index} className="glass p-6 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}