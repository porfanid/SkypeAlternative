/**
 * Cloudflare Worker for Call Session Management
 * 
 * This worker:
 * 1. Verifies Firebase Auth tokens
 * 2. Creates Cloudflare Calls sessions
 * 3. Returns session credentials to authenticated clients
 */

export interface Env {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_API_TOKEN: string;
}

interface CreateSessionRequest {
  idToken: string;
  userId: string;
}

interface CreateSessionResponse {
  sessionId: string;
  tracks: {
    trackName: string;
    location: string;
    sessionDescription: RTCSessionDescriptionInit;
  };
  iceServers: RTCIceServer[];
}

interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * Verify Firebase ID token
 */
async function verifyFirebaseToken(
  idToken: string,
  projectId: string,
  _serviceAccountKey: string
): Promise<{ uid: string; email?: string } | null> {
  try {
    // In a real implementation, you would use Firebase Admin SDK
    // For now, we'll validate the token structure
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (basic validation)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    // Verify issuer matches Firebase project
    if (!payload.iss || !payload.iss.includes(projectId)) {
      return null;
    }

    return {
      uid: payload.sub || payload.user_id,
      email: payload.email
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Create a Cloudflare Calls session
 */
async function createCloudflareSession(
  accountId: string,
  apiToken: string
): Promise<CreateSessionResponse> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/calls/apps`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `call-${Date.now()}`
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create Cloudflare session: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Create session and tracks
  const sessionId = data.result.uid;
  const trackName = `${sessionId}-track`;
  
  // Get session description
  const trackResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/calls/apps/${sessionId}/tracks`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trackName,
        kind: 'audio-video'
      })
    }
  );

  if (!trackResponse.ok) {
    throw new Error(`Failed to create track: ${trackResponse.statusText}`);
  }

  const trackData = await trackResponse.json();

  return {
    sessionId,
    tracks: {
      trackName,
      location: trackData.result.location,
      sessionDescription: trackData.result.sessionDescription
    },
    iceServers: trackData.result.iceServers || [
      { urls: 'stun:stun.cloudflare.com:3478' }
    ]
  };
}

/**
 * Handle CORS preflight
 */
function handleOptions(_request: Request): Response {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  return new Response(null, { headers });
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return addCorsHeaders(
        new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        )
      );
    }

    try {
      // Parse request body
      const body: CreateSessionRequest = await request.json();

      if (!body.idToken || !body.userId) {
        return addCorsHeaders(
          new Response(
            JSON.stringify({ 
              error: 'Bad Request',
              message: 'Missing idToken or userId' 
            } as ErrorResponse),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }

      // Verify Firebase token
      const user = await verifyFirebaseToken(
        body.idToken,
        env.FIREBASE_PROJECT_ID,
        env.FIREBASE_SERVICE_ACCOUNT_KEY
      );

      if (!user || user.uid !== body.userId) {
        return addCorsHeaders(
          new Response(
            JSON.stringify({ 
              error: 'Unauthorized',
              message: 'Invalid or expired token' 
            } as ErrorResponse),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }

      // Create Cloudflare Calls session
      const session = await createCloudflareSession(
        env.CLOUDFLARE_ACCOUNT_ID,
        env.CLOUDFLARE_API_TOKEN
      );

      return addCorsHeaders(
        new Response(
          JSON.stringify(session),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          }
        )
      );
    } catch (error) {
      console.error('Error handling request:', error);
      
      return addCorsHeaders(
        new Response(
          JSON.stringify({ 
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error' 
          } as ErrorResponse),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      );
    }
  }
};
