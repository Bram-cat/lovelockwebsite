# Secure Mobile Authentication Integration

This document outlines the secure authentication flow to replace the current insecure URL-based credential passing.

## Security Issues with Current Approach

The current method of passing credentials in URL parameters:
```
https://lovelock.it.com/account?userId=user_31yK29VRF1fXjDvXOe9yLCZr4IN&email=vsbharaniram%40gmail.com&source=mobile&section=billing
```

Has several critical security vulnerabilities:
- Credentials exposed in browser history
- Server log exposure
- Referrer header leakage
- Social engineering risks
- Cache pollution

## New Secure Authentication Flow

### 1. Mobile App Side

Instead of redirecting with credentials, your mobile app should:

```javascript
// Generate a secure token on your mobile backend
const response = await fetch('YOUR_MOBILE_API/generate-web-token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userAuthToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: user.id,
    email: user.email,
    section: 'billing' // or 'profile', etc.
  })
})

const { token } = await response.json()

// Redirect to web app with secure token
const webUrl = `https://lovelock.it.com/auth/mobile-redirect?token=${token}`
window.open(webUrl, '_blank')
```

### 2. Web App Integration

The web app now has three new endpoints:

#### A. Mobile Redirect Endpoint: `/api/auth/mobile-redirect`

**Purpose**: Exchanges mobile token for web session token

**Request**:
```javascript
POST /api/auth/mobile-redirect
Content-Type: application/json

{
  "token": "secure_mobile_token_here",
  "section": "billing" // optional
}
```

**Response**:
```javascript
{
  "success": true,
  "redirectUrl": "https://lovelock.it.com/auth/session?token=web_session_token",
  "message": "Authentication successful"
}
```

#### B. Session Verification Endpoint: `/api/auth/verify-session`

**Purpose**: Verifies web session token and creates Clerk session

**Request**:
```javascript
POST /api/auth/verify-session
Content-Type: application/json

{
  "token": "web_session_token"
}
```

**Response**:
```javascript
{
  "success": true,
  "clerkSessionToken": "clerk_session_id",
  "section": "billing",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

#### C. Session Page: `/auth/session`

**Purpose**: Client-side session establishment and redirect

This page:
1. Extracts session token from URL
2. Calls verify-session endpoint
3. Establishes Clerk session
4. Redirects to account page

### 3. Implementation Steps

#### Step 1: Update Mobile App Backend

Create a token generation endpoint on your mobile backend:

```javascript
// Example implementation
app.post('/generate-web-token', async (req, res) => {
  const { userId, email, section } = req.body

  // Verify user is authenticated
  const user = await verifyAuthToken(req.headers.authorization)
  if (!user || user.id !== userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex')

  // Store token with expiration (Redis recommended)
  await redis.setex(`mobile_token:${token}`, 300, JSON.stringify({
    userId,
    email,
    section,
    createdAt: new Date().toISOString()
  }))

  res.json({ token })
})
```

#### Step 2: Update Mobile App Client

Replace direct URL redirects with token-based flow:

```javascript
// Old (insecure):
const url = `https://lovelock.it.com/account?userId=${userId}&email=${email}&section=billing`

// New (secure):
const token = await generateWebToken(userId, email, 'billing')
const url = `https://lovelock.it.com/api/auth/mobile-redirect`

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, section: 'billing' })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    window.open(data.redirectUrl, '_blank')
  }
})
```

#### Step 3: Configure Token Storage

The current implementation uses in-memory storage (not production-ready). For production:

**Option A: Redis**
```javascript
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)

async function storeSessionToken(token, data) {
  await redis.setex(`session:${token}`, 300, JSON.stringify(data))
}

async function getSessionTokenData(token) {
  const data = await redis.get(`session:${token}`)
  return data ? JSON.parse(data) : null
}
```

**Option B: Database**
```sql
CREATE TABLE session_tokens (
  token VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  section VARCHAR(50),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Environment Variables

Add these to your `.env.local`:

```
# Your mobile app backend URL for token verification
MOBILE_API_URL=https://your-mobile-api.com

# Redis URL for session storage (if using Redis)
REDIS_URL=redis://localhost:6379

# Your web app URL
NEXT_PUBLIC_APP_URL=https://lovelock.it.com
```

### 5. Security Considerations

1. **Token Expiration**: All tokens expire within 5 minutes
2. **One-time Use**: Session tokens are deleted after use
3. **HTTPS Only**: All communication must use HTTPS
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Logging**: Log auth attempts for monitoring
6. **Validation**: Validate all input parameters

### 6. Error Handling

The implementation includes comprehensive error handling:

- Invalid tokens return 401 Unauthorized
- Expired tokens are automatically cleaned up
- Clerk user creation/lookup failures return appropriate errors
- All errors are logged for debugging

### 7. Testing

Test the flow with these scenarios:

1. **Valid token**: Should create session and redirect
2. **Invalid token**: Should show error message
3. **Expired token**: Should show token expired error
4. **Missing token**: Should show invalid request error
5. **Network failure**: Should handle gracefully

### 8. Migration Plan

1. Deploy the new endpoints alongside existing functionality
2. Update mobile app to use new flow
3. Monitor both flows during transition
4. Remove old insecure parameter handling after migration

## Benefits of New Approach

✅ **Security**: No credentials in URLs
✅ **Audit Trail**: All auth attempts logged
✅ **Expiration**: Tokens automatically expire
✅ **One-time Use**: Prevents replay attacks
✅ **Flexibility**: Easy to add new auth parameters
✅ **Monitoring**: Clear success/failure metrics

## Production Deployment Checklist

- [ ] Configure Redis or database for token storage
- [ ] Set up environment variables
- [ ] Implement mobile backend token generation
- [ ] Update mobile app client code
- [ ] Test all error scenarios
- [ ] Set up monitoring and logging
- [ ] Deploy with feature flag for rollback
- [ ] Monitor auth success rates
- [ ] Clean up old insecure code after migration