#!/usr/bin/env node

/**
 * Script to switch between Stripe test and live modes
 * Usage: node scripts/switch-stripe-mode.js [test|live]
 */

const fs = require('fs')
const path = require('path')

const mode = process.argv[2]

if (!mode || !['test', 'live'].includes(mode)) {
  console.error('Usage: node scripts/switch-stripe-mode.js [test|live]')
  process.exit(1)
}

const envFile = mode === 'test' ? '.env.test' : '.env'
const targetFile = '.env'

if (!fs.existsSync(envFile)) {
  console.error(`❌ ${envFile} not found!`)
  if (mode === 'test') {
    console.log('Please create .env.test with your Stripe test keys first.')
    console.log('You can use .env.test as a template.')
  }
  process.exit(1)
}

try {
  // Backup current .env if switching to test mode
  if (mode === 'test' && fs.existsSync('.env')) {
    fs.copyFileSync('.env', '.env.backup')
    console.log('📋 Backed up current .env to .env.backup')
  }

  // Copy the appropriate env file
  if (mode === 'test') {
    fs.copyFileSync('.env.test', '.env')
  } else {
    // For live mode, restore from backup if it exists, otherwise use .env.live
    if (fs.existsSync('.env.backup')) {
      fs.copyFileSync('.env.backup', '.env')
      console.log('📋 Restored .env from backup')
    } else if (fs.existsSync('.env.live')) {
      fs.copyFileSync('.env.live', '.env')
    } else {
      console.error('❌ No .env.backup or .env.live found for live mode!')
      process.exit(1)
    }
  }

  console.log(`✅ Switched to ${mode.toUpperCase()} mode`)
  console.log('')

  if (mode === 'test') {
    console.log('🧪 TEST MODE ACTIVE')
    console.log('⚠️  Remember to:')
    console.log('   1. Configure billing portal in Stripe test mode dashboard')
    console.log('   2. Create test products and prices')
    console.log('   3. Set up test webhook endpoint')
    console.log('   4. Update price IDs in .env.test')
  } else {
    console.log('🚀 LIVE MODE ACTIVE')
    console.log('⚠️  You are now using LIVE Stripe keys!')
    console.log('   Real payments will be processed!')
  }

  console.log('')
  console.log('Restart your development server for changes to take effect.')

} catch (error) {
  console.error('❌ Error switching modes:', error.message)
  process.exit(1)
}