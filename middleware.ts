import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/subscription(.*)',
  '/api/get-customer(.*)',
  '/api/create-billing-portal(.*)',
  '/api/create-checkout-session(.*)',
  '/api/simple-checkout(.*)',
])

const isPublicAuthRoute = createRouteMatcher([
  '/api/auth/mobile-verify',
])

export default clerkMiddleware((auth, req) => {
  // Allow public auth routes without protection
  if (isPublicAuthRoute(req)) {
    return
  }

  // Protect other routes as configured
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}