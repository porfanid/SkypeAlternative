# Call Session Worker

Cloudflare Worker for managing Cloudflare Calls sessions with Firebase authentication.

## Features

- Firebase Auth token verification
- Cloudflare Calls session creation
- Secure session credential distribution
- CORS support for client requests

## Setup

### Prerequisites

- Cloudflare account with Calls enabled
- Firebase project with Admin SDK credentials
- Wrangler CLI installed (`npm install -g wrangler`)

### Configuration

1. Install dependencies:
```bash
npm install
```

2. Configure secrets:
```bash
wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
# Paste your Firebase service account JSON key

wrangler secret put CLOUDFLARE_API_TOKEN
# Paste your Cloudflare API token
```

3. Update `wrangler.toml` with your account details:
```toml
[vars]
FIREBASE_PROJECT_ID = "your-firebase-project-id"
CLOUDFLARE_ACCOUNT_ID = "your-cloudflare-account-id"
```

### Development

Run locally:
```bash
npm run dev
```

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## API

### POST /

Create a new Cloudflare Calls session.

**Request Body:**
```json
{
  "idToken": "firebase-id-token",
  "userId": "user-id"
}
```

**Response (200 OK):**
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

**Error Responses:**
- 400 Bad Request: Missing required fields
- 401 Unauthorized: Invalid or expired token
- 405 Method Not Allowed: Only POST is supported
- 500 Internal Server Error: Server error

## Security

- All requests must include a valid Firebase ID token
- Token is verified against Firebase project
- User ID must match the token's UID
- CORS is configured to accept requests from any origin (configure for production)

## Testing

Test the worker locally:
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"idToken":"your-token","userId":"user-123"}'
```
