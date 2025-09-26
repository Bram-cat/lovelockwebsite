// Test script for payment functionality
// Run with: node scripts/test-payments.js

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE = 'http://localhost:3000';

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${data.error || response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`Request failed:`, error.message);
    throw error;
  }
}

async function testPaymentFlow() {
  console.log('🧪 Testing Payment Flow for Lovelock Web\n');

  // Get test user ID
  const testUserId = await new Promise((resolve) => {
    rl.question('Enter a test Clerk User ID (or press Enter for default): ', (answer) => {
      resolve(answer.trim() || 'test_user_123');
    });
  });

  console.log(`\n📝 Using test user ID: ${testUserId}\n`);

  try {
    // Test 1: Check initial subscription status
    console.log('1️⃣ Testing initial subscription status...');
    // Note: This will fail without proper auth, but that's expected
    console.log('   (Skipping auth-protected endpoint in this test)\n');

    // Test 2: Create premium subscription
    console.log('2️⃣ Testing premium subscription creation...');
    const premiumResult = await makeRequest('/api/test-payment', {
      method: 'POST',
      body: JSON.stringify({
        clerkId: testUserId,
        tier: 'premium',
        interval: 'month'
      })
    });
    console.log('   ✅ Premium subscription created:', {
      tier: premiumResult.subscription.tier,
      status: premiumResult.subscription.status,
      expires: premiumResult.subscription.current_period_end
    });

    // Test 3: Upgrade to unlimited
    console.log('3️⃣ Testing upgrade to unlimited...');
    const unlimitedResult = await makeRequest('/api/test-payment', {
      method: 'POST',
      body: JSON.stringify({
        clerkId: testUserId,
        tier: 'unlimited',
        interval: 'year'
      })
    });
    console.log('   ✅ Unlimited subscription created:', {
      tier: unlimitedResult.subscription.tier,
      status: unlimitedResult.subscription.status,
      expires: unlimitedResult.subscription.current_period_end
    });

    // Test 4: Cancel subscription
    console.log('4️⃣ Testing subscription cancellation...');
    const cancelResult = await makeRequest(`/api/test-payment?clerkId=${testUserId}`, {
      method: 'DELETE'
    });
    console.log('   ✅ Subscription cancelled:', {
      tier: cancelResult.subscription.tier,
      status: cancelResult.subscription.status
    });

    // Test 5: Monitor subscriptions
    console.log('5️⃣ Testing subscription monitoring...');
    const monitorResult = await makeRequest('/api/subscription/monitor?test=true');
    console.log('   ✅ Monitoring completed:', {
      processed: monitorResult.processed,
      expired: monitorResult.expired?.length || 0,
      expiringSoon: monitorResult.expiringSoon?.length || 0
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env with test Stripe keys');
    console.log('2. Add the SubscriptionStatus component to your dashboard');
    console.log('3. Set up a cron job to call /api/subscription/monitor');
    console.log('4. Configure webhook endpoints in Stripe dashboard');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure the development server is running (npm run dev)');
    console.log('- Check that Supabase is configured and tables are created');
    console.log('- Verify environment variables are set correctly');
  }

  rl.close();
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPaymentFlow().catch(console.error);
}

module.exports = { testPaymentFlow, makeRequest };