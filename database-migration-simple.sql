-- Simple Database Migration Script
-- Run this in your Supabase SQL Editor
-- This script is safe to run multiple times

-- Step 1: Add missing columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT FALSE;

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly';

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Step 2: Update existing subscriptions
UPDATE subscriptions
SET
  is_premium = (subscription_type = 'premium' OR subscription_type = 'unlimited'),
  is_unlimited = (subscription_type = 'unlimited'),
  billing_cycle = CASE
    WHEN EXTRACT(MONTH FROM AGE(ends_at, starts_at)) >= 11 THEN 'yearly'
    ELSE 'monthly'
  END
WHERE subscription_type IS NOT NULL;

-- Step 3: Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS birth_time TIME;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS birth_location VARCHAR(255);

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wants_premium BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wants_notifications BOOLEAN DEFAULT TRUE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS agreed_to_terms BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Step 4: Update existing profiles
UPDATE profiles
SET
  wants_premium = COALESCE(wants_premium, FALSE),
  wants_notifications = COALESCE(wants_notifications, TRUE),
  agreed_to_terms = COALESCE(agreed_to_terms, FALSE),
  onboarding_completed = COALESCE(onboarding_completed, FALSE)
WHERE wants_premium IS NULL OR wants_notifications IS NULL OR agreed_to_terms IS NULL OR onboarding_completed IS NULL;

-- Step 5: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_love_matches_user_id_created_at ON love_matches(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_numerology_readings_user_id_created_at ON numerology_readings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_trust_assessments_user_id_created_at ON trust_assessments(user_id, created_at);

-- Step 6: Enable Row Level Security (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE numerology_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_assessments ENABLE ROW LEVEL SECURITY;

-- Step 7: Create subscription status view
CREATE OR REPLACE VIEW subscription_status AS
SELECT
  s.id,
  s.user_id,
  s.subscription_type,
  s.status,
  s.is_premium,
  s.is_unlimited,
  s.billing_cycle,
  s.starts_at,
  s.ends_at,
  s.stripe_subscription_id,
  s.stripe_customer_id,
  s.created_at,
  s.updated_at,
  CASE
    WHEN s.ends_at IS NOT NULL AND s.ends_at < NOW() THEN TRUE
    ELSE FALSE
  END AS is_expired,
  CASE
    WHEN s.ends_at IS NOT NULL THEN
      EXTRACT(DAY FROM s.ends_at - NOW())
    ELSE NULL
  END AS days_remaining
FROM subscriptions s
WHERE s.status = 'active'
ORDER BY s.created_at DESC;

-- Step 8: Create helper function for subscription flags
CREATE OR REPLACE FUNCTION update_subscription_flags()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_premium := (NEW.subscription_type = 'premium' OR NEW.subscription_type = 'unlimited');
  NEW.is_unlimited := (NEW.subscription_type = 'unlimited');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger
DROP TRIGGER IF EXISTS trigger_update_subscription_flags ON subscriptions;
CREATE TRIGGER trigger_update_subscription_flags
  BEFORE INSERT OR UPDATE OF subscription_type ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_flags();

-- Step 10: Insert test data (only if no profiles exist)
INSERT INTO profiles (user_id, email, full_name, wants_premium, wants_notifications, agreed_to_terms, onboarding_completed)
SELECT 'test_user_001', 'test@example.com', 'Test User', FALSE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = 'test_user_001');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database migration completed successfully!';
    RAISE NOTICE 'Your subscription system is now ready to use.';
END $$;