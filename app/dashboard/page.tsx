"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Settings,
  Crown,
  Calculator,
  Shield,
  User,
  ExternalLink,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SubscriptionStatus } from "@/components/subscription-status";
import { SubscriptionManagement } from "@/components/subscription-management";
import { FlipCardFeatures } from "@/components/flip-card-features";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBillingPortal = async () => {
    try {
      setLoading(true);

      // First get customer information
      const customerResponse = await fetch('/api/get-customer', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!customerResponse.ok) {
        throw new Error('Failed to fetch customer information');
      }

      const customer = await customerResponse.json();

      // Check if user has a real Stripe customer ID
      if (!customer.id || customer.id.startsWith('mock_') || customer.id.startsWith('fallback_')) {
        // User doesn't have an active paid subscription, redirect to pricing
        alert('Billing portal is only available for active paid subscriptions. Please upgrade to access billing management.');
        router.push('/pricing');
        return;
      }

      // Create billing portal session
      const response = await fetch('/api/create-billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // If no active subscription or billing portal not configured, redirect to pricing
        if (errorData.error && (
          errorData.error.includes('No active subscription') ||
          errorData.error.includes('configuration') ||
          errorData.error.includes('not been created')
        )) {
          alert('Billing portal is temporarily unavailable. Please use the pricing page to manage your subscription.');
          router.push('/pricing');
          return;
        }

        throw new Error(errorData.error || 'Failed to create billing portal session');
      }

      const data = await response.json();

      // Redirect to Stripe billing portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to open billing portal. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cursor-pointer"
            onClick={() => window.location.href = 'https://lovelock.it.com/account'}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <a
              href="/account"
              className="glass px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors border border-white/10 hover:border-white/20 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Account
            </a>
            <UserButton
              showName={false}
              afterSignOutUrl="/"
              userProfileMode="navigation"
              userProfileUrl={null}
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 ring-2 ring-purple-400/50 hover:ring-purple-400 transition-all duration-300",
                  userButtonPopoverCard: "glass border-white/10 bg-white/10 backdrop-blur-lg",
                  userButtonPopoverText: "text-white",
                  userButtonPopoverActionButton: "text-gray-300 hover:text-white",
                  userButtonPopoverFooter: "border-white/10",
                  userButtonPopoverActionButton__manageAccount: "display: none !important",
                  userButtonPopoverActionButtonIcon__manageAccount: "display: none !important",
                  userButtonPopoverActionButtonText__manageAccount: "display: none !important"
                }
              }}
            />
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
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-glow">
              Welcome Back,
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {" "}
                {user.firstName}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your cosmic journey continues. Manage your subscription and
              explore your insights.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-1 gap-8">
              {/* Real Subscription Status Component */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SubscriptionStatus />
              </motion.div>

              {/* Subscription Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SubscriptionManagement />
              </motion.div>

              {/* App Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-3"
              >
                <div className="glass p-8 rounded-3xl">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Available in the Lovelock App
                  </h3>

                  <FlipCardFeatures />

                  <div className="mt-8 flex gap-4 justify-center flex-wrap">
                    <button
                      onClick={handleBillingPortal}
                      disabled={loading}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-xl text-white font-semibold btn-cosmic hover:shadow-2xl transition-all transform hover:scale-105 inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Settings className="w-5 h-5" />
                      <span>{loading ? 'Loading...' : 'Manage Subscription'}</span>
                    </button>
                    <button
                      onClick={() => router.push("/pricing")}
                      className="glass px-6 py-3 rounded-xl text-white hover:bg-white/20 transition-all inline-flex items-center space-x-2"
                    >
                      <Crown className="w-5 h-5" />
                      <span>View Plans</span>
                    </button>
                    <button
                      onClick={() => router.push("/privacy")}
                      className="glass px-6 py-3 rounded-xl text-white hover:bg-white/20 transition-all inline-flex items-center space-x-2"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Privacy Policy</span>
                    </button>
                    <button
                      onClick={() => router.push("/terms")}
                      className="glass px-6 py-3 rounded-xl text-white hover:bg-white/20 transition-all inline-flex items-center space-x-2"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Terms & Conditions</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
