'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Calendar, CreditCard, ArrowUpCircle, ArrowDownCircle, XCircle, RotateCcw, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SubscriptionManagementData {
  hasSubscription: boolean
  currentTier: 'free' | 'premium' | 'unlimited'
  subscription?: {
    id: string
    status: string
    currentPeriodEnd?: string
    cancelAtPeriodEnd: boolean
    billing_cycle: 'monthly' | 'yearly'
  }
  availableActions: string[]
  stripeSubscriptionId?: string
}

interface PriceOption {
  priceId: string
  tier: 'premium' | 'unlimited'
  interval: 'month' | 'year'
  price: number
  name: string
}

export function SubscriptionManagement() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const [managementData, setManagementData] = useState<SubscriptionManagementData | null>(null)
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch subscription management data
  const fetchManagementData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching subscription management data...')

      // Try the main API first
      let response = await fetch('/api/subscription/manage')

      // If main API fails, try the simple status API
      if (!response.ok) {
        console.log('Main API failed, trying simple status API...')
        response = await fetch('/api/subscription/simple-status')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API response not ok:', response.status, errorText)
        throw new Error(`Failed to fetch subscription data: ${response.status}`)
      }

      const data = await response.json()
      console.log('Subscription management data received:', data)

      setManagementData(data)
    } catch (err) {
      console.error('Error fetching subscription management data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch available price options
  const fetchPriceOptions = async () => {
    try {
      const response = await fetch('/api/price-ids')

      if (!response.ok) {
        throw new Error('Failed to fetch price options')
      }

      const data = await response.json()

      if (data.subscriptionPlans) {
        const options: PriceOption[] = [
          {
            priceId: data.subscriptionPlans.premium.monthly.priceId,
            tier: 'premium',
            interval: 'month',
            price: data.subscriptionPlans.premium.monthly.price,
            name: 'Premium Monthly'
          },
          {
            priceId: data.subscriptionPlans.premium.yearly.priceId,
            tier: 'premium',
            interval: 'year',
            price: data.subscriptionPlans.premium.yearly.price,
            name: 'Premium Yearly'
          },
          {
            priceId: data.subscriptionPlans.unlimited.monthly.priceId,
            tier: 'unlimited',
            interval: 'month',
            price: data.subscriptionPlans.unlimited.monthly.price,
            name: 'Unlimited Monthly'
          },
          {
            priceId: data.subscriptionPlans.unlimited.yearly.priceId,
            tier: 'unlimited',
            interval: 'year',
            price: data.subscriptionPlans.unlimited.yearly.price,
            name: 'Unlimited Yearly'
          }
        ]
        setPriceOptions(options)
      }
    } catch (err) {
      console.error('Error fetching price options:', err)
    }
  }

  useEffect(() => {
    if (isLoaded && user) {
      fetchManagementData()
      fetchPriceOptions()
    }
  }, [isLoaded, user])

  // Handle subscription actions
  const handleSubscriptionAction = async (action: string, priceId?: string) => {
    if (!managementData) return

    try {
      setActionLoading(action)

      const response = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          priceId,
          subscriptionId: managementData.stripeSubscriptionId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Action failed')
      }

      const result = await response.json()
      console.log('Subscription action result:', result)

      // Refresh data after successful action
      await fetchManagementData()

      // Show success message
      toast({
        title: "Success",
        description: result.message || 'Action completed successfully',
        variant: "success"
      })

    } catch (err) {
      console.error('Subscription action error:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Handle subscription sync
  const handleSyncSubscription = async () => {
    try {
      setActionLoading('sync')

      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync subscription')
      }

      const result = await response.json()
      console.log('Subscription sync result:', result)

      // Refresh data after successful sync
      await fetchManagementData()

      // Show success message
      toast({
        title: "Sync Complete",
        description: result.message || 'Subscription synced successfully',
        variant: "success"
      })

    } catch (err) {
      console.error('Error syncing subscription:', err)
      toast({
        title: "Sync Failed",
        description: err instanceof Error ? err.message : 'Failed to sync subscription',
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Handle billing portal redirect
  const handleBillingPortal = async () => {
    try {
      setActionLoading('billing_portal')

      // First get customer information
      const customerResponse = await fetch('/api/get-customer', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!customerResponse.ok) {
        throw new Error('Failed to fetch customer information')
      }

      const customer = await customerResponse.json()

      // Check if user has a real Stripe customer ID
      if (!customer.id || customer.id.startsWith('mock_') || customer.id.startsWith('fallback_')) {
        // User doesn't have an active paid subscription, redirect to pricing
        toast({
          title: "Billing Portal Unavailable",
          description: 'Billing portal is only available for active paid subscriptions. Redirecting to pricing page...',
          variant: "default"
        })
        setTimeout(() => {
          window.location.href = '/pricing'
        }, 2000)
        return
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
      })

      if (!response.ok) {
        const errorData = await response.json()

        // If no active subscription or billing portal not configured, redirect to pricing
        if (errorData.error && (
          errorData.error.includes('No active subscription') ||
          errorData.error.includes('configuration') ||
          errorData.error.includes('not been created')
        )) {
          toast({
            title: "Billing Portal Unavailable",
            description: 'Billing portal is temporarily unavailable. Redirecting to pricing page...',
            variant: "default"
          })
          setTimeout(() => {
            window.location.href = '/pricing'
          }, 2000)
          return
        }

        throw new Error(errorData.error || 'Failed to create billing portal session')
      }

      const data = await response.json()

      // Redirect to Stripe billing portal
      window.location.href = data.url

    } catch (err) {
      console.error('Error opening billing portal:', err)
      toast({
        title: "Billing Portal Error",
        description: err instanceof Error ? err.message : 'Failed to open billing portal',
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (!isLoaded || !user) {
    return <div className="animate-pulse">Loading user...</div>
  }

  if (loading) {
    return <div className="animate-pulse">Loading subscription management...</div>
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-600">
            <p className="font-medium">Error loading subscription management</p>
            <p className="text-sm">{error}</p>
            <Button onClick={fetchManagementData} className="mt-2" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!managementData) {
    return <div>No subscription data available</div>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getCurrentBillingCycle = () => {
    return managementData.subscription?.billing_cycle || 'monthly'
  }

  const getAlternateBillingOptions = () => {
    if (!managementData.hasSubscription) return []

    const currentTier = managementData.currentTier
    const currentCycle = getCurrentBillingCycle()

    return priceOptions.filter(option =>
      option.tier === currentTier && option.interval !== (currentCycle === 'monthly' ? 'month' : 'year')
    )
  }

  const getUpgradeOptions = () => {
    const currentTier = managementData.currentTier

    if (currentTier === 'unlimited') return []

    return priceOptions.filter(option => {
      if (currentTier === 'free') {
        return option.tier === 'premium' || option.tier === 'unlimited'
      }
      if (currentTier === 'premium') {
        return option.tier === 'unlimited'
      }
      return false
    })
  }

  // Downgrade functionality completely removed as per requirements

  const getCurrentPlanOptions = () => {
    const currentTier = managementData.currentTier
    const currentCycle = getCurrentBillingCycle()

    if (currentTier === 'free') return []

    // Get the current plan option to compare and exclude it
    return priceOptions.filter(option => {
      // Same tier, same billing cycle = current plan (exclude)
      if (option.tier === currentTier && option.interval === (currentCycle === 'monthly' ? 'month' : 'year')) {
        return false
      }
      return option.tier === currentTier
    })
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={managementData.currentTier === 'free' ? 'secondary' : 'default'}>
                {managementData.currentTier.charAt(0).toUpperCase() + managementData.currentTier.slice(1)}
              </Badge>
              {managementData.hasSubscription && (
                <Badge variant="outline">
                  {getCurrentBillingCycle().charAt(0).toUpperCase() + getCurrentBillingCycle().slice(1)}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSyncSubscription}
                disabled={actionLoading === 'sync'}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 ${actionLoading === 'sync' ? 'animate-spin' : ''}`} />
              </Button>
              {managementData.hasSubscription && (
                <Button
                  onClick={handleBillingPortal}
                  disabled={actionLoading === 'billing_portal'}
                  variant="outline"
                  size="sm"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {actionLoading === 'billing_portal' ? 'Loading...' : 'Billing Portal'}
                </Button>
              )}
            </div>
          </div>


          {managementData.subscription?.currentPeriodEnd && (
            <div className="text-sm text-gray-600">
              <Calendar className="h-4 w-4 inline mr-1" />
              Next billing: {new Date(managementData.subscription.currentPeriodEnd).toLocaleDateString()}
            </div>
          )}

          {managementData.subscription?.cancelAtPeriodEnd && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Your subscription will be cancelled at the end of the current period.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Management Actions */}
      {managementData.hasSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Management</CardTitle>
            <CardDescription>
              Change your plan or billing cycle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Billing Cycle Toggle */}
            {getCurrentPlanOptions().length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Switch Billing Cycle</h4>
                <div className="grid gap-2">
                  {getCurrentPlanOptions().map((option) => (
                    <Button
                      key={option.priceId}
                      onClick={handleBillingPortal}
                      disabled={actionLoading === 'billing_portal'}
                      variant="outline"
                      className="justify-between"
                    >
                      <span>
                        {actionLoading === 'billing_portal' ? 'Loading...' : `Switch to ${option.name}`}
                      </span>
                      {actionLoading !== 'billing_portal' && (
                        <span>{formatPrice(option.price)}/{option.interval}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade Options */}
            {getUpgradeOptions().length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Upgrade Plan</h4>
                <div className="grid gap-2">
                  {getUpgradeOptions().map((option) => (
                    <Button
                      key={option.priceId}
                      onClick={handleBillingPortal}
                      disabled={actionLoading === 'billing_portal'}
                      variant="outline"
                      className="justify-between text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <span className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4" />
                        {actionLoading === 'billing_portal' ? 'Loading...' : `Upgrade to ${option.name}`}
                      </span>
                      {actionLoading !== 'billing_portal' && (
                        <span>{formatPrice(option.price)}/{option.interval}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Downgrade Options - Removed as per requirements */}

            {/* Cancellation/Reactivation */}
            <div className="border-t pt-4">
              {managementData.subscription?.cancelAtPeriodEnd ? (
                <Button
                  onClick={() => handleSubscriptionAction('reactivate')}
                  disabled={actionLoading === 'reactivate'}
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {actionLoading === 'reactivate' ? 'Reactivating...' : 'Reactivate Subscription'}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.')) {
                      handleSubscriptionAction('cancel')
                    }
                  }}
                  disabled={actionLoading === 'cancel'}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade from Free */}
      {!managementData.hasSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Choose a plan to unlock premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {priceOptions
                .filter(option => option.tier === 'premium')
                .map((option) => (
                  <Button
                    key={option.priceId}
                    onClick={() => {
                      // Redirect to pricing page for new subscriptions
                      window.location.href = '/pricing'
                    }}
                    className="justify-between"
                  >
                    <span>{option.name}</span>
                    <span>{formatPrice(option.price)}/{option.interval}</span>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}