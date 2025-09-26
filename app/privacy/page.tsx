'use client'

import { motion } from 'framer-motion'
import { Shield, ArrowLeft, Mail, Lock, Eye, Users, Clock, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPolicyPage() {
  const router = useRouter()

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Personal information you provide when creating an account (name, email address)",
        "Usage data and analytics to improve our services",
        "Payment information processed securely through Stripe",
        "Device information and app usage patterns for optimization"
      ]
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our love compatibility services",
        "To process your subscription payments and manage your account",
        "To send important updates about your account or service changes",
        "To improve our algorithms and provide better match insights"
      ]
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: [
        "We never sell your personal information to third parties",
        "Anonymous, aggregated data may be used for research purposes",
        "We may share information when required by law or to protect our rights",
        "Third-party service providers process data only as necessary to provide services"
      ]
    },
    {
      icon: Shield,
      title: "Data Security",
      content: [
        "All personal data is encrypted both in transit and at rest",
        "We use industry-standard security measures to protect your information",
        "Regular security audits and updates to maintain protection",
        "Two-factor authentication available for enhanced account security"
      ]
    },
    {
      icon: Clock,
      title: "Data Retention",
      content: [
        "We retain your data only as long as your account is active",
        "You can request account deletion at any time",
        "Backup data is automatically purged after 90 days",
        "Anonymous analytics data may be retained for service improvement"
      ]
    },
    {
      icon: Globe,
      title: "International Users",
      content: [
        "Data may be processed in the United States and other countries",
        "We comply with applicable international privacy laws",
        "EU users have additional rights under GDPR",
        "Data transfers are protected by appropriate safeguards"
      ]
    }
  ]

  return (
    <div className="cosmic-bg min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-600/10 to-indigo-700/10"></div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="p-6">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 glass rounded-full">
                <Shield className="w-12 h-12 text-pink-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-2">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-gray-400">
              Last updated: September 2024
            </p>
          </motion.div>

          {/* Privacy Sections */}
          <div className="space-y-6 mb-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white text-lg">
                      <section.icon className="w-5 h-5 text-pink-400" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-300 flex items-start gap-3 text-sm">
                          <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Your Privacy Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">Access & Portability</h3>
                    <p className="text-gray-300 text-xs">
                      Request a copy of your personal data and export your information.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">Correction</h3>
                    <p className="text-gray-300 text-xs">
                      Update or correct any inaccurate personal information we have about you.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">Deletion</h3>
                    <p className="text-gray-300 text-xs">
                      Request deletion of your account and associated personal data.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">Opt-out</h3>
                    <p className="text-gray-300 text-xs">
                      Withdraw consent for certain data processing activities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-lg">
                  <Mail className="w-5 h-5 text-pink-400" />
                  Contact Us About Privacy
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Have questions about our privacy practices or want to exercise your privacy rights?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => window.location.href = 'mailto:lovelock.bugs@gmail.com?subject=Privacy Inquiry'}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg text-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Privacy Team
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="border-white/20 text-white hover:bg-white/10 text-sm"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}