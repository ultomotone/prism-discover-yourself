// SPA route tracking for Reddit Pixel + Conversions API

import { trackRedditPixel, trackRedditS2S } from './client';
import { IS_PREVIEW } from '@/lib/env';

interface RouteTrackingOptions {
  trackPixel?: boolean;
  trackConversions?: boolean;
  debounceMs?: number;
}

let isInitialized = false;
let lastPath = '';
let trackingTimeout: NodeJS.Timeout | null = null;

/**
 * Track page visit on route change
 */
function trackPageVisit(path: string, options: RouteTrackingOptions = {}): void {
  if (IS_PREVIEW) return;
  const {
    trackPixel = true,
    trackConversions = true,
    debounceMs = 100
  } = options;

  // Clear existing timeout
  if (trackingTimeout) {
    clearTimeout(trackingTimeout);
  }

  // Debounce rapid route changes
  trackingTimeout = setTimeout(() => {
    console.log('Reddit SPA tracking: PageVisit for', path);

    // Track pixel event
    if (trackPixel) {
      trackRedditPixel('PageVisit', {
        page_path: path,
        page_title: document.title
      });
    }

    // Track server-to-server conversion
    if (trackConversions) {
      trackRedditS2S('PageVisit', {
        product_category: 'page-view',
        product_name: document.title,
        product_id: path
      });
    }

    // Track specific page types
    trackSpecificPageEvents(path);
  }, debounceMs);
}

/**
 * Track specific events based on route patterns
 */
function trackSpecificPageEvents(path: string): void {
  if (IS_PREVIEW) return;
  const lowerPath = path.toLowerCase();

  // Assessment pages
  if (lowerPath.includes('/assessment')) {
    trackRedditS2S('ViewContent', {
      product_category: 'assessment-page',
      product_name: 'Assessment Page View'
    });
  }

  // Results pages
  if (lowerPath.includes('/result')) {
    trackRedditS2S('ViewContent', {
      product_category: 'results-page',
      product_name: 'Results Page View'
    });
  }

  // Dashboard/profile pages
  if (lowerPath.includes('/dashboard') || lowerPath.includes('/profile')) {
    trackRedditS2S('ViewContent', {
      product_category: 'user-dashboard',
      product_name: 'User Dashboard View'
    });
  }

  // About/info pages
  if (lowerPath.includes('/about') || lowerPath.includes('/typing-lab')) {
    trackRedditS2S('ViewContent', {
      product_category: 'info-content',
      product_name: 'Information Content View'
    });
  }
}

/**
 * Initialize SPA route tracking
 */
export function initializeRedditSPATracking(options: RouteTrackingOptions = {}): void {
  if (IS_PREVIEW || isInitialized || typeof window === 'undefined') {
    return;
  }

  console.log('Initializing Reddit SPA tracking...');

  // Track initial page load
  const currentPath = window.location.pathname;
  lastPath = currentPath;
  trackPageVisit(currentPath, options);

  // Override History API methods to track programmatic navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    const result = originalPushState.apply(this, args);
    const newPath = window.location.pathname;
    if (newPath !== lastPath) {
      lastPath = newPath;
      trackPageVisit(newPath, options);
    }
    return result;
  };

  history.replaceState = function(...args) {
    const result = originalReplaceState.apply(this, args);
    const newPath = window.location.pathname;
    if (newPath !== lastPath) {
      lastPath = newPath;
      trackPageVisit(newPath, options);
    }
    return result;
  };

  // Listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    const newPath = window.location.pathname;
    if (newPath !== lastPath) {
      lastPath = newPath;
      trackPageVisit(newPath, options);
    }
  });

  // Listen for custom app events for specific milestones
  window.addEventListener('app:assessment:start', (event: any) => {
    const sessionId = event.detail?.sessionId;
    if (sessionId) {
      trackRedditS2S('Lead', {
        conversion_id: `${sessionId}-assessment-start`,
        product_category: 'personality-assessment',
        product_name: 'PRISM Assessment Started'
      });
    }
  });

  window.addEventListener('app:assessment:complete', (event: any) => {
    const { sessionId, totalQuestions } = event.detail || {};
    if (sessionId) {
      trackRedditS2S('SignUp', {
        conversion_id: `${sessionId}-assessment-complete`,
        product_category: 'personality-assessment',
        product_name: 'PRISM Assessment Completed',
        item_count: totalQuestions || 248
      });
    }
  });

  window.addEventListener('app:user:signup', (event: any) => {
    const { email, sessionId } = event.detail || {};
    trackRedditS2S('SignUp', {
      conversion_id: `${sessionId || 'signup'}-account-created`,
      email, // Will be hashed server-side
      product_category: 'account',
      product_name: 'Account Registration'
    });
  });

  window.addEventListener('app:results:viewed', (event: any) => {
    const { sessionId, typeCode } = event.detail || {};
    trackRedditS2S('ViewContent', {
      conversion_id: `${sessionId}-results-viewed`,
      product_category: 'personality-results',
      product_name: 'PRISM Results Viewed',
      product_id: typeCode || 'unknown'
    });
  });

  isInitialized = true;
  console.log('Reddit SPA tracking initialized');
}

/**
 * Manually track a route change (useful for React Router or other SPA frameworks)
 */
export function trackRouteChange(path: string, options: RouteTrackingOptions = {}): void {
  if (path !== lastPath) {
    lastPath = path;
    trackPageVisit(path, options);
  }
}

/**
 * Clean up tracking
 */
export function cleanupRedditSPATracking(): void {
  if (trackingTimeout) {
    clearTimeout(trackingTimeout);
    trackingTimeout = null;
  }
  isInitialized = false;
}