# Cloudflare Worker Deployment Guide

This guide explains how to deploy the Cloudflare Worker for managing video call sessions.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Cloudflare Calls Enabled**: Enable Cloudflare Calls in your account
3. **Firebase Project**: Active Firebase project with Admin SDK access
4. **Wrangler CLI**: Install globally with `npm install -g wrangler`

## Setup Steps

### 1. Install Worker Dependencies

```bash
cd workers/call-session
npm install
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

### 3. Configure Environment Variables

Edit `workers/call-session/wrangler.toml` and set:

```toml
[vars]
FIREBASE_PROJECT_ID = "your-firebase-project-id"
CLOUDFLARE_ACCOUNT_ID = "your-cloudflare-account-id"
```

### 4. Set Secrets

Set sensitive credentials as secrets (not in version control):

```bash
cd workers/call-session

# Set Firebase service account key (paste the entire JSON content)
wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
# When prompted, paste your Firebase service account JSON

# Set Cloudflare API token
wrangler secret put CLOUDFLARE_API_TOKEN
# When prompted, paste your Cloudflare API token with Calls permissions
```

#### Getting Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file securely
6. Copy and paste its contents when running `wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY`

#### Getting Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to My Profile → API Tokens
3. Click "Create Token"
4. Use the "Edit Cloudflare Calls" template or create a custom token with:
   - Permission: Calls - Edit
   - Account Resources: Include - Your Account
5. Copy the token and paste it when running `wrangler secret put CLOUDFLARE_API_TOKEN`

### 5. Deploy the Worker

```bash
# Deploy to production
npm run deploy

# Or deploy with wrangler directly
wrangler deploy
```

### 6. Get the Worker URL

After deployment, Wrangler will output the URL:

```
Deployed call-session-worker to https://call-session-worker.<your-subdomain>.workers.dev
```

### 7. Configure the Frontend

Update your `.env` file in the main project root:

```env
VITE_CLOUDFLARE_WORKER_URL=https://call-session-worker.<your-subdomain>.workers.dev
```

## Development

### Local Development

Run the worker locally for testing:

```bash
cd workers/call-session
npm run dev
```

The worker will be available at `http://localhost:8787`

For local development, update your `.env`:

```env
VITE_CLOUDFLARE_WORKER_URL=http://localhost:8787
```

### Testing the Worker

Test with curl:

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "your-firebase-id-token",
    "userId": "user-id"
  }'
```

Expected response:

```json
{
  "sessionId": "session-id",
  "tracks": {
    "trackName": "track-name",
    "location": "wss://...",
    "sessionDescription": {
      "type": "offer",
      "sdp": "..."
    }
  },
  "iceServers": [
    { "urls": "stun:stun.cloudflare.com:3478" }
  ]
}
```

## Security Considerations

1. **Never commit secrets**: Secrets should only be set via `wrangler secret put`
2. **Rotate tokens regularly**: Update Firebase and Cloudflare tokens periodically
3. **CORS configuration**: The worker is configured with `Access-Control-Allow-Origin: *` for development. For production, restrict to your app's domain:

```typescript
// In workers/call-session/src/index.ts
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', 'https://your-app-domain.com');
  // ... rest of headers
}
```

4. **Rate limiting**: Consider adding rate limiting to prevent abuse
5. **Logging**: Review CloudFlare logs regularly for suspicious activity

## Troubleshooting

### Worker Returns 401 Unauthorized

- Check that Firebase service account key is valid
- Ensure the Firebase ID token is not expired
- Verify the user ID matches the token's UID

### Worker Returns 500 Internal Server Error

- Check Cloudflare API token has correct permissions
- Verify Cloudflare account ID is correct
- Check Cloudflare Calls is enabled for your account
- Review worker logs: `wrangler tail`

### CORS Errors in Frontend

- Ensure CORS headers are properly configured in the worker
- Check that `OPTIONS` preflight requests are handled correctly

### View Worker Logs

```bash
cd workers/call-session
wrangler tail
```

## Updating the Worker

When you make changes to the worker code:

```bash
cd workers/call-session
npm run deploy
```

Changes are deployed immediately, no need to update secrets unless they changed.

## Cost Considerations

Cloudflare Workers free tier includes:
- 100,000 requests/day
- 10ms CPU time per request

Cloudflare Calls pricing is separate. Check [Cloudflare Calls pricing](https://developers.cloudflare.com/calls/pricing/) for details.

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Calls Documentation](https://developers.cloudflare.com/calls/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
