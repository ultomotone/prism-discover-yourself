// Reddit Pixel + Conversions API client-side tracking utility

import { IS_PREVIEW } from "@/lib/env";

export interface AttributionContext {
  uuid: string;
  click_id?: string | null;
  screen_width?: number | null;
  screen_height?: number | null;
}

export interface RedditEventPayload {
  // Event metadata
  value?: number;
  currency?: string;
  item_count?: number;
  product_id?: string;
  product_category?: string;
  product_name?: string;
  conversion_id?: string; // Idempotency key
  
  // Attribution (PII will be hashed server-side)
  email?: string;
  phone?: string;
  external_id?: string;
  maid?: string;
}

/**
 * Get attribution context from URL params and browser environment
 */
export function getAttributionContext(): AttributionContext {
  if (IS_PREVIEW || typeof window === 'undefined') {
    return {
      uuid: crypto.randomUUID(),
      click_id: null,
      screen_width: null,
      screen_height: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  
  // Reddit click ID - various possible parameter names
  const click_id = params.get('rdt_cid') || 
                   params.get('reddit_cid') || 
                   (window as any).__rdt_cid || 
                   null;
                   
  // Store click ID in localStorage for session persistence
  if (click_id) {
    try {
      localStorage.setItem('reddit_click_id', click_id);
    } catch (e) {
      // Ignore localStorage errors
    }
  }
  
  // Try to retrieve stored click ID if not in URL
  const storedClickId = click_id || (() => {
    try {
      return localStorage.getItem('reddit_click_id');
    } catch (e) {
      return null;
    }
  })();

  return {
    uuid: crypto.randomUUID(),
    click_id: storedClickId,
    screen_width: window.screen?.width ?? null,
    screen_height: window.screen?.height ?? null,
  };
}

/**
 * Track Reddit event server-to-server via our Edge Function
 * Never sends raw PII from client - only hashed server-side
 */
export async function trackRedditS2S(
  event_name: string,
  payload: RedditEventPayload = {}
): Promise<void> {
  if (IS_PREVIEW) return;
  try {
    const ctx = getAttributionContext();
    
    // Check if Reddit tracking is properly configured
    const redditAppId = localStorage.getItem('reddit_app_id');
    if (!redditAppId) {
      console.log('Reddit tracking disabled - no app ID configured');
      return;
    }
    
    await fetch('/functions/v1/reddit-conversions', {
      method: 'POST',
      headers: { 
        'content-type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
      },
      body: JSON.stringify({ 
        event_name, 
        ctx, 
        payload 
      }),
      keepalive: true
    });
  } catch (error) {
    // Never break UX - just log and continue silently
    console.log('Reddit S2S tracking skipped:', error?.message || 'endpoint not available');
  }
}

/**
 * Track Reddit pixel event (client-side only)
 */
export function trackRedditPixel(event_name: string, metadata: Record<string, any> = {}): void {
  if (IS_PREVIEW) return;
  try {
    if (typeof window !== 'undefined' && (window as any).rdt) {
      (window as any).rdt('track', event_name, metadata);
    }
  } catch (error) {
    console.warn('Reddit pixel tracking failed:', error);
  }
}

/**
 * Combined tracking: both pixel and server-to-server
 */
export async function trackRedditFull(
  event_name: string,
  payload: RedditEventPayload = {}
): Promise<void> {
  if (IS_PREVIEW) return;
  // Fire pixel event immediately
  trackRedditPixel(event_name, payload);
  
  // Fire server-to-server conversion
  await trackRedditS2S(event_name, payload);
}

/**
 * Generate deterministic conversion ID for idempotency
 */
export function generateConversionId(
  sessionId: string, 
  eventType: string, 
  additional?: string
): string {
  const parts = [sessionId, eventType, additional].filter(Boolean);
  return parts.join('-');
}

// Pre-defined event tracking functions for common PRISM events

export async function trackAssessmentStart(sessionId: string): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(sessionId, 'assessment-start');
  
  await trackRedditFull('Lead', {
    conversion_id,
    product_category: 'personality-assessment',
    product_name: 'PRISM Assessment Start'
  });
}

export async function trackAssessmentComplete(
  sessionId: string,
  questionCount: number = 248
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(sessionId, 'assessment-complete');
  
  // Use SignUp for comprehensive assessment completion
  await trackRedditFull('SignUp', {
    conversion_id,
    product_category: 'personality-assessment',
    product_name: 'PRISM Assessment Complete',
    item_count: questionCount
  });
}

export async function trackResultsView(
  sessionId: string,
  typeCode?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(sessionId, 'results-view');
  
  await trackRedditFull('ViewContent', {
    conversion_id,
    product_category: 'personality-results',
    product_name: 'PRISM Results',
    product_id: typeCode || 'unknown'
  });
}

export async function trackAccountCreation(
  sessionId: string,
  email?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(sessionId, 'account-created');
  
  await trackRedditFull('SignUp', {
    conversion_id,
    email, // Will be hashed server-side
    product_category: 'account',
    product_name: 'Account Registration'
  });
}

export async function trackPurchase(
  orderId: string,
  value: number,
  currency: string = 'USD',
  itemCount: number = 1,
  productName?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(orderId, 'purchase');
  
  await trackRedditFull('Purchase', {
    conversion_id,
    value,
    currency,
    item_count: itemCount,
    product_category: 'premium-report',
    product_name: productName || 'Premium Report',
    product_id: orderId
  });
}

export async function trackSearch(query: string, sessionId?: string): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(
    sessionId || 'anonymous', 
    'search', 
    query.slice(0, 10)
  );
  
  await trackRedditFull('Search', {
    conversion_id,
    product_category: 'search',
    product_name: query
  });
}