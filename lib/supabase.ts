import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations that need elevated permissions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string | null
          full_name: string | null
          birth_date: string | null
          birth_time: string | null
          birth_location: string | null
          wants_premium: boolean
          wants_notifications: boolean
          agreed_to_terms: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          full_name?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_location?: string | null
          wants_premium?: boolean
          wants_notifications?: boolean
          agreed_to_terms?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
          full_name?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_location?: string | null
          wants_premium?: boolean
          wants_notifications?: boolean
          agreed_to_terms?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_type: 'free' | 'premium' | 'unlimited'
          status: 'active' | 'canceled' | 'past_due' | 'incomplete'
          is_premium: boolean
          is_unlimited: boolean
          billing_cycle: 'monthly' | 'yearly'
          starts_at: string | null
          ends_at: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_type?: 'free' | 'premium' | 'unlimited'
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete'
          is_premium?: boolean
          is_unlimited?: boolean
          billing_cycle?: 'monthly' | 'yearly'
          starts_at?: string | null
          ends_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_type?: 'free' | 'premium' | 'unlimited'
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete'
          is_premium?: boolean
          is_unlimited?: boolean
          billing_cycle?: 'monthly' | 'yearly'
          starts_at?: string | null
          ends_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      love_matches: {
        Row: {
          id: string
          user_id: string
          partner_name: string
          partner_birth_date: string | null
          compatibility_score: number | null
          match_details: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          partner_name: string
          partner_birth_date?: string | null
          compatibility_score?: number | null
          match_details?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          partner_name?: string
          partner_birth_date?: string | null
          compatibility_score?: number | null
          match_details?: any | null
          created_at?: string
        }
      }
      numerology_readings: {
        Row: {
          id: string
          user_id: string
          reading_type: string
          reading_data: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reading_type: string
          reading_data?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reading_type?: string
          reading_data?: any | null
          created_at?: string
        }
      }
      trust_assessments: {
        Row: {
          id: string
          user_id: string
          assessment_data: any | null
          trust_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_data?: any | null
          trust_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_data?: any | null
          trust_score?: number | null
          created_at?: string
        }
      }
    }
  }
}