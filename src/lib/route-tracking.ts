// SPA route change tracking for Reddit and other analytics platforms

import { sendTwitterEvent, sendTwitterPageView } from './twitter/events';

// Track route changes for SPA navigation
export const trackRouteChange = (path: string) => {
  if (typeof window === 'undefined') return;

  // Track page view for Reddit
  if (window.rdtTrack) {
    window.rdtTrack('PageVisit');
  }

  // Track page view for Facebook
  if (window.fbTrack) {
    window.fbTrack('PageView');
  }

  sendTwitterPageView(path);

  // Track page view for Google Analytics
  if (window.gtag) {
    window.gtag('config', 'G-J2XXMC9VWV', {
      page_path: path
    });
  }
};

// Set up SPA route tracking listeners
export const initializeRouteTracking = () => {
  if (typeof window === 'undefined') return;

  // Track initial page load
  trackRouteChange(window.location.pathname);

  // Override history methods to track programmatic navigation
  ['pushState', 'replaceState'].forEach(method => {
    const original = history[method as keyof History] as Function;
    (history as any)[method] = function(...args: any[]) {
      const result = original.apply(this, args);
      // Use setTimeout to ensure the navigation has completed
      setTimeout(() => {
        trackRouteChange(window.location.pathname);
      }, 0);
      return result;
    };
  });

  // Track browser back/forward navigation
  window.addEventListener('popstate', () => {
    trackRouteChange(window.location.pathname);
  });

  console.log('✅ SPA route tracking initialized');
};

// Route-specific event tracking
export const trackRouteSpecificEvents = (path: string) => {
  if (typeof window === 'undefined') return;

  const normalizedPath = path.toLowerCase();

  // Assessment start tracking
  if (normalizedPath.startsWith('/assessment')) {
    if (window.rdtTrack) {
      window.rdtTrack('ViewContent', { content_name: 'Assessment' });
    }
    if (window.fbTrack) {
      window.fbTrack('ViewContent', { content_name: 'Assessment' });
    }
    sendTwitterEvent('ContentView', { content_name: 'Assessment' });
  }

  // Results page tracking
  if (normalizedPath.includes('/results/')) {
    if (window.rdtTrack) {
      window.rdtTrack('ViewContent', { content_name: 'PRISM Results' });
    }
    if (window.fbTrack) {
      window.fbTrack('ViewContent', { content_name: 'PRISM Results' });
    }
    sendTwitterEvent(
      'ContentView',
      { content_name: 'PRISM Results' },
      { allowOnResults: true },
    );
  }

  // Sign-up completion tracking
  if (
    normalizedPath.startsWith('/signup/complete') ||
    normalizedPath.startsWith('/welcome') ||
    normalizedPath.includes('/account/create/complete')
  ) {
    if (window.rdtTrack) {
      window.rdtTrack('SignUp');
    }
    if (window.fbTrack) {
      window.fbTrack('CompleteRegistration');
    }
    sendTwitterEvent('SignUp', {});
  }
};