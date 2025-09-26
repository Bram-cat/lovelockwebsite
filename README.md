# 💖 Lovelock Payment Website

A beautiful, cosmic-themed payment website for the Lovelock mobile app, built with Next.js 14, Clerk authentication, Stripe payments, and Supabase database.

![Lovelock](https://img.shields.io/badge/Lovelock-Payment%20Website-FF69B4?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)

## ✨ Features

### 🎨 Beautiful UI/UX
- **Cosmic Theme**: Pink/purple gradients matching the mobile app
- **Glass Morphism**: Modern translucent card designs
- **Responsive Design**: Perfect on mobile and desktop
- **Smooth Animations**: Framer Motion powered transitions
- **shadcn/ui Components**: Beautiful, accessible components

### 💳 Payment Processing
- **Stripe Integration**: Secure payment processing
- **Three Subscription Tiers**:
  - 🆓 **Free**: Basic features (3 numerology, 2 love matches, 1 trust assessment)
  - 💎 **Premium** ($4.99/month): Enhanced features (25 numerology, 15 love matches, 10 trust assessments)
  - 🚀 **Unlimited** ($12.99/month): Unlimited access to all features
- **Flexible Billing**: Monthly and yearly options
- **Secure Checkout**: PCI compliant payment forms

### 🔐 Authentication & Security
- **Clerk Auth**: Seamless user authentication
- **Protected Routes**: Dashboard and payment flows secured
- **Email Verification**: Secure account creation
- **Session Management**: Persistent login state

### 📊 Dashboard Features
- **Subscription Management**: View current plan and usage
- **Usage Tracking**: Monitor feature consumption
- **Billing Portal**: Manage payment methods and invoices
- **Account Settings**: Update profile and preferences

### 📱 Mobile App Integration
- **Deep Linking**: Seamless transitions from mobile app
- **Parameter Handling**: Process user data from app
- **Success Redirects**: Return users to mobile app after payment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Clerk account
- Stripe account
- Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bram-cat/Loveweb.git
   cd Loveweb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables (see [Environment Variables](#environment-variables))

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

### 🔐 Clerk Authentication
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 💳 Stripe Configuration
```env
STRIPE_SECRET_KEY=sk_live_... # or sk_test_ for development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (create these in your Stripe dashboard)
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_UNLIMITED_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...
STRIPE_UNLIMITED_YEARLY_PRICE_ID=price_...
```

### 🗄️ Supabase Database
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🌐 Domain
```env
NEXT_PUBLIC_DOMAIN=https://lovelock.it.com
```

## 🏗️ Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── dashboard/         # User dashboard
│   ├── pay/              # Payment handler
│   ├── pricing/          # Subscription plans
│   ├── privacy/          # Privacy policy
│   ├── success/          # Payment success
│   ├── terms/            # Terms & conditions
│   └── api/              # API routes
│       └── stripe-webhook/ # Stripe webhook handler
├── components/           # Reusable components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utility libraries
│   ├── stripe.ts        # Stripe configuration
│   ├── supabase.ts      # Supabase client
│   └── subscription.ts  # Subscription management
└── public/              # Static assets
```

## 🎯 Pages & Routes

### Public Pages
- **`/`** - Landing page with features and testimonials
- **`/pricing`** - Subscription plans comparison
- **`/privacy`** - Privacy policy
- **`/terms`** - Terms and conditions

### Protected Pages
- **`/dashboard`** - User dashboard (requires authentication)
- **`/pay`** - Payment handler for mobile app
- **`/success`** - Payment success page

### API Routes
- **`/api/stripe-webhook`** - Stripe webhook handler

## 🔗 Stripe Webhook Setup

### Webhook Endpoint
For your Vercel deployment, use:
```
https://lovelock.it.com/api/stripe-webhook
```

Or if using the Vercel preview URL:
```
https://loveweb-[hash].vercel.app/api/stripe-webhook
```

### Required Events
Add these events in your Stripe Dashboard → Webhooks:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Testing Webhooks
For local development, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## 🗃️ Database Schema

### Supabase Tables

#### `user_subscriptions`
```sql
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  tier TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### `usage_tracking`
```sql
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  numerology_count INTEGER DEFAULT 0,
  love_match_count INTEGER DEFAULT 0,
  trust_assessment_count INTEGER DEFAULT 0,
  reset_date TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
Make sure to update:
- Use `pk_live_` and `sk_live_` for Stripe (production keys)
- Set `NEXT_PUBLIC_DOMAIN` to your actual domain
- Configure webhook endpoint in Stripe dashboard

### Custom Domain Setup
1. Add your domain in Vercel dashboard
2. Update DNS records
3. Update `NEXT_PUBLIC_DOMAIN` environment variable

## 📱 Mobile App Integration

### Deep Link Parameters
The mobile app can send users to the payment page with:
```
https://lovelock.it.com/pay?userId=clerk_123&email=user@example.com&tier=premium
```

### Success Redirect
After successful payment, users are redirected back to the mobile app:
```
lovelock://success?subscription=premium&status=active
```

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🎨 Customization

### Theme Colors
Update the cosmic theme colors in `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      'cosmic-pink': '#ec4899',
      'cosmic-purple': '#8b5cf6',
      'cosmic-indigo': '#6366f1'
    }
  }
}
```

### Glass Morphism
The glass effect is defined in `globals.css`:
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## 📞 Support

### Contact Information
- **Email**: lovelock.bugs@gmail.com
- **Subject**: Website Support - [Your Issue]

### Common Issues
1. **Payments not processing**: Check Stripe webhook configuration
2. **Authentication issues**: Verify Clerk environment variables
3. **Database errors**: Ensure Supabase connection and RLS policies

## 📄 Legal Pages

- **Privacy Policy**: `/privacy` - Comprehensive privacy protection information
- **Terms & Conditions**: `/terms` - Service usage terms and conditions
- **Contact**: All legal inquiries directed to lovelock.bugs@gmail.com

## 📋 Recent Updates

### Latest Changes (Current)
- ✅ Fixed privacy policy and terms page layouts
- ✅ Removed "Open Lovelock App" links
- ✅ Added proper favicon support
- ✅ Enhanced mobile responsiveness
- ✅ Improved content positioning

## 📄 License

This project is private and proprietary to Lovelock.

## 🤖 Generated with Claude Code

This website was built with assistance from [Claude Code](https://claude.ai/code), Anthropic's AI coding assistant.

---

**Made with 💖 for the Lovelock community**