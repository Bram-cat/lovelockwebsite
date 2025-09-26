'use client'

import { motion } from 'framer-motion'
import { FileText, ArrowLeft, Mail, CreditCard, Ban, AlertTriangle, Scale, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  const router = useRouter()

  const sections = [
    {
      icon: Users,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using Lovelock, you accept and agree to be bound by these terms",
        "If you do not agree to these terms, please do not use our service",
        "We may update these terms from time to time, and continued use constitutes acceptance",
        "You must be at least 13 years old to use our services"
      ]
    },
    {
      icon: FileText,
      title: "Service Description",
      content: [
        "Lovelock provides numerology-based love compatibility and relationship insights",
        "Our services include personality analysis, love matching, and trust assessments",
        "Results are for entertainment purposes and should not be considered professional advice",
        "We do not guarantee the accuracy or reliability of compatibility predictions"
      ]
    },
    {
      icon: CreditCard,
      title: "Subscription and Billing",
      content: [
        "Premium features require a paid subscription with monthly or yearly billing",
        "All payments are processed securely through Stripe",
        "Subscriptions automatically renew unless cancelled before the next billing cycle",
        "Refunds are subject to our refund policy and applicable laws"
      ]
    },
    {
      icon: Ban,
      title: "Prohibited Uses",
      content: [
        "Do not use our service for any unlawful or fraudulent purposes",
        "Do not attempt to reverse engineer, hack, or compromise our systems",
        "Do not share your account credentials with others",
        "Do not use our service to harass, abuse, or harm others"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers and Limitations",
      content: [
        "Our service is provided 'as is' without warranties of any kind",
        "We are not liable for any decisions made based on our compatibility insights",
        "Our liability is limited to the amount paid for the service",
        "We do not guarantee continuous, uninterrupted access to our services"
      ]
    },
    {
      icon: Scale,
      title: "Intellectual Property",
      content: [
        "All content, algorithms, and designs are protected by intellectual property laws",
        "You may not copy, reproduce, or distribute our proprietary content",
        "You retain ownership of personal information you provide",
        "We reserve all rights not expressly granted to you"
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
                <FileText className="w-12 h-12 text-pink-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms & Conditions
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-2">
              Please read these terms carefully before using our service. They govern your use of Lovelock and outline your rights and responsibilities.
            </p>
            <p className="text-sm text-gray-400">
              Last updated: September 2024
            </p>
          </motion.div>

          {/* Terms Sections */}
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

          {/* Account Termination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-lg">
                  <Ban className="w-5 h-5 text-pink-400" />
                  Account Termination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">By You</h3>
                    <p className="text-gray-300 text-xs">
                      You may cancel your account at any time through your dashboard or by contacting support.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">By Us</h3>
                    <p className="text-gray-300 text-xs">
                      We may terminate accounts that violate these terms or engage in prohibited activities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Governing Law */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  These terms are governed by the laws of the jurisdiction where our company is registered.
                  Any disputes will be resolved through binding arbitration or in the courts of that jurisdiction.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-lg">
                  <Mail className="w-5 h-5 text-pink-400" />
                  Questions About Terms
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Need clarification on any of these terms or have legal questions?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => window.location.href = 'mailto:lovelock.bugs@gmail.com?subject=Terms Inquiry'}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg text-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Legal Team
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

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="glass border-white/10 border-orange-400/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold mb-2 text-sm">Important Notice</h3>
                    <p className="text-gray-300 text-xs">
                      Lovelock is an entertainment service that provides numerology-based insights.
                      Our compatibility assessments are not scientifically proven and should not be used
                      as the sole basis for important relationship decisions. Always trust your own judgment
                      and consider seeking professional counseling for serious relationship matters.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}