import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RedditTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface ConversionPayload {
  event_name: string;
  ctx: {
    uuid: string;
    click_id?: string | null;
    screen_width?: number | null;
    screen_height?: number | null;
  };
  payload: {
    value?: number;
    currency?: string;
    item_count?: number;
    product_id?: string;
    product_category?: string;
    product_name?: string;
    conversion_id?: string;
    email?: string;
    phone?: string;
    external_id?: string;
    maid?: string;
  };
}

/**
 * Get Reddit OAuth2 access token using client credentials
 */
async function getRedditToken(): Promise<string> {
  const apiBase = Deno.env.get('REDDIT_API_BASE') || 'https://ads-api.reddit.com';
  const clientId = Deno.env.get('REDDIT_APP_ID');
  const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing Reddit OAuth credentials');
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(`${apiBase}/api/v2/access_token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'PrismPersonality/1.0'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Reddit OAuth failed:', response.status, error);
    throw new Error(`Reddit OAuth failed: ${response.status}`);
  }

  const tokenData: RedditTokenResponse = await response.json();
  return tokenData.access_token;
}

/**
 * SHA-256 hash function for PII
 */
async function sha256Hash(input?: string): Promise<string | undefined> {
  if (!input) return undefined;
  
  const normalized = input.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Build Reddit Conversions API payload
 */
async function buildConversionPayload(
  input: ConversionPayload,
  clientIp?: string,
  userAgent?: string
): Promise<any> {
  const adAccountId = Deno.env.get('REDDIT_AD_ACCOUNT_ID');
  const pixelId = Deno.env.get('REDDIT_PIXEL_ID');

  if (!adAccountId) {
    throw new Error('Missing REDDIT_AD_ACCOUNT_ID');
  }

  const eventTime = Math.floor(Date.now() / 1000);

  // Hash PII server-side
  const hashedEmail = await sha256Hash(input.payload.email);
  const hashedPhone = await sha256Hash(input.payload.phone);
  const hashedExternalId = await sha256Hash(input.payload.external_id);

  return {
    ad_account_id: adAccountId,
    data: [{
      event_name: input.event_name,
      event_time: eventTime,
      pixel_id: pixelId,
      attribution: {
        // Client context
        click_id: input.ctx.click_id || undefined,
        uuid: input.ctx.uuid,
        // Server context  
        ip_address: clientIp,
        user_agent: userAgent,
        screen_width: input.ctx.screen_width || undefined,
        screen_height: input.ctx.screen_height || undefined,
        // Hashed PII
        email: hashedEmail,
        phone: hashedPhone,
        external_id: hashedExternalId,
        maid: input.payload.maid || undefined,
      },
      metadata: {
        value: input.payload.value || undefined,
        currency: input.payload.currency || undefined,
        item_count: input.payload.item_count || undefined,
        product_id: input.payload.product_id || undefined,
        product_category: input.payload.product_category || undefined,
        product_name: input.payload.product_name || undefined,
        conversion_id: input.payload.conversion_id || undefined,
      }
    }]
  };
}

/**
 * Send conversion to Reddit Conversions API
 */
async function sendConversion(token: string, payload: any): Promise<any> {
  const apiBase = Deno.env.get('REDDIT_API_BASE') || 'https://ads-api.reddit.com';
  
  // Note: Exact endpoint path may vary - keeping configurable
  const endpoint = `${apiBase}/api/v3/measurements/conversions`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'PrismPersonality/1.0'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Reddit Conversions API error:', response.status, error);
    throw new Error(`Reddit Conversions API error ${response.status}: ${error}`);
  }

  return await response.json();
}

/**
 * Retry with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof Error && error.message.includes('4')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Parse request
    const body: ConversionPayload = await req.json();
    
    if (!body.event_name || !body.ctx) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract client info
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log(`Processing Reddit conversion: ${body.event_name} for ${clientIp}`);

    // Get OAuth token and send conversion with retry
    const result = await withRetry(async () => {
      const token = await getRedditToken();
      const conversionPayload = await buildConversionPayload(body, clientIp, userAgent);
      return await sendConversion(token, conversionPayload);
    });

    console.log('Reddit conversion successful:', result);

    return new Response(
      JSON.stringify({ ok: true, result }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Reddit conversion error:', error);
    
    // Never break UX - always return 200 with error info
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
