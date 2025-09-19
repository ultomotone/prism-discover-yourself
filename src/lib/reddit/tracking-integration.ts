// Integration layer for Reddit tracking with existing analytics

import { trackRedditFull, generateConversionId } from './client';
import { IS_PREVIEW } from '@/lib/env';

/**
 * Enhanced assessment start tracking with Reddit Conversions API
 */
export async function trackAssessmentStartEnhanced(sessionId: string): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(sessionId, 'assessment-start');
  
  await trackRedditFull('Lead', {
    conversion_id,
    product_category: 'personality-assessment',
    product_name: 'PRISM Assessment Started',
    product_id: sessionId
  });
}

/**
 * Enhanced assessment completion tracking
 */
export async function trackAssessmentCompleteEnhanced(
  sessionId: string,
  questionCount: number = 248
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(sessionId, 'assessment-complete');
  
  // Use SignUp for major milestone completion
  await trackRedditFull('SignUp', {
    conversion_id,
    product_category: 'personality-assessment',
    product_name: 'PRISM Assessment Completed',
    product_id: sessionId,
    item_count: questionCount
  });
}

/**
 * Enhanced results viewing tracking
 */
export async function trackResultsViewedEnhanced(
  sessionId: string,
  typeCode?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(sessionId, 'results-view');
  
  await trackRedditFull('ViewContent', {
    conversion_id,
    product_category: 'personality-results',
    product_name: 'PRISM Results Viewed',
    product_id: typeCode || sessionId
  });
}

/**
 * Enhanced account creation tracking
 */
export async function trackAccountCreationEnhanced(
  email: string,
  sessionId?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(
    sessionId || 'account-signup', 
    'account-created'
  );
  
  await trackRedditFull('SignUp', {
    conversion_id,
    email, // Will be hashed server-side
    product_category: 'account',
    product_name: 'Account Registration'
  });
}

/**
 * Enhanced payment success tracking
 */
export async function trackPaymentSuccessEnhanced(
  value: number,
  currency: string = 'USD',
  transactionId: string,
  sessionId?: string,
  productName?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(transactionId, 'purchase');
  
  await trackRedditFull('Purchase', {
    conversion_id,
    value,
    currency,
    item_count: 1,
    product_category: 'premium-report',
    product_name: productName || 'Premium Report',
    product_id: transactionId
  });
}

/**
 * Track content engagement (for typing lab, about pages, etc.)
 */
export async function trackContentEngagement(
  contentType: string,
  contentName: string,
  sessionId?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(
    sessionId || 'content-engagement',
    'content-view',
    contentType
  );
  
  await trackRedditFull('ViewContent', {
    conversion_id,
    product_category: contentType,
    product_name: contentName
  });
}

/**
 * Track search events
 */
export async function trackSearchEnhanced(
  query: string,
  sessionId?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(
    sessionId || 'search',
    'search',
    query.slice(0, 10)
  );
  
  await trackRedditFull('Search', {
    conversion_id,
    product_category: 'search',
    product_name: query
  });
}

/**
 * Track wishlist/favorite actions (if implemented)
 */
export async function trackAddToWishlist(
  itemId: string,
  itemName: string,
  sessionId?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(
    sessionId || 'wishlist',
    'add-to-wishlist',
    itemId
  );
  
  await trackRedditFull('AddToWishlist', {
    conversion_id,
    product_category: 'wishlist',
    product_name: itemName,
    product_id: itemId
  });
}

/**
 * Track cart actions (if e-commerce is implemented)
 */
export async function trackAddToCart(
  itemId: string,
  itemName: string,
  value?: number,
  currency?: string,
  sessionId?: string
): Promise<void> {
  if (IS_PREVIEW) return;
  const conversion_id = generateConversionId(
    sessionId || 'cart',
    'add-to-cart',
    itemId
  );
  
  await trackRedditFull('AddToCart', {
    conversion_id,
    value,
    currency,
    item_count: 1,
    product_category: 'cart',
    product_name: itemName,
    product_id: itemId
  });
}