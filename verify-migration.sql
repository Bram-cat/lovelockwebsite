-- Database Migration Verification Script
-- Run this after the migration to check if everything is set up correctly

-- Check if all required columns exist in subscriptions table
SELECT
    CASE
        WHEN COUNT(*) = 4 THEN '✅ All subscription columns added successfully'
        ELSE '❌ Missing subscription columns'
    END as subscription_columns_status
FROM information_schema.columns
WHERE table_name = 'subscriptions'
AND column_name IN ('is_premium', 'is_unlimited', 'billing_cycle', 'stripe_customer_id');

-- Check if all required columns exist in profiles table
SELECT
    CASE
        WHEN COUNT(*) = 4 THEN '✅ All profile columns added successfully'
        ELSE '❌ Missing profile columns'
    END as profile_columns_status
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('wants_premium', 'wants_notifications', 'agreed_to_terms', 'onboarding_completed');

-- Check if indexes were created
SELECT
    CASE
        WHEN COUNT(*) >= 7 THEN '✅ Performance indexes created successfully'
        ELSE '❌ Missing performance indexes'
    END as indexes_status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- Check if RLS is enabled on all tables
SELECT
    tablename,
    CASE
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'subscriptions', 'love_matches', 'numerology_readings', 'trust_assessments')
ORDER BY tablename;

-- Check if the subscription_status view exists
SELECT
    CASE
        WHEN COUNT(*) = 1 THEN '✅ Subscription status view created'
        ELSE '❌ Missing subscription status view'
    END as view_status
FROM information_schema.views
WHERE table_name = 'subscription_status';

-- Check if the trigger function exists
SELECT
    CASE
        WHEN COUNT(*) = 1 THEN '✅ Subscription trigger function created'
        ELSE '❌ Missing subscription trigger function'
    END as function_status
FROM information_schema.routines
WHERE routine_name = 'update_subscription_flags';

-- Sample data check
SELECT
    COUNT(*) as total_profiles,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Database has user profiles'
        ELSE 'ℹ️ No user profiles yet (normal for new setup)'
    END as profile_data_status
FROM profiles;

SELECT
    COUNT(*) as total_subscriptions,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Database has subscriptions'
        ELSE 'ℹ️ No subscriptions yet (normal for new setup)'
    END as subscription_data_status
FROM subscriptions;

-- Final verification summary
SELECT
    '🎉 Migration verification complete!' as message,
    'Your subscription system is ready for testing' as next_step;