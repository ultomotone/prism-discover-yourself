// Plausible Analytics Integration
declare global {
  interface Window {
    plausible?: ((
      eventName: string,
      options?: {
        props?: Record<string, string | number | boolean>;
        revenue?: { currency: string; amount: number };
        callback?: () => void;
      }
    ) => void) & {
      q?: any[];
    };
  }
}

export interface PlausibleEventProps {
  [key: string]: string | number | boolean;
}

export interface PlausibleRevenue {
  currency: string;
  amount: number;
}

export interface PlausibleEventOptions {
  props?: PlausibleEventProps;
  revenue?: PlausibleRevenue;
  callback?: () => void;
}

// Initialize Plausible Analytics
export function initPlausible() {
  if (typeof window === 'undefined') return;

  // Add the plausible function to window if it doesn't exist
  window.plausible = window.plausible || function() { 
    (window.plausible!.q = window.plausible!.q || []).push(arguments as any);
  };

  // Check if script already exists
  if (document.querySelector('script[data-domain="prismpersonality.com"]')) {
    return;
  }

  // Create and add the Plausible script
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = "prismpersonality.com";
  script.dataset.api = "https://plausible.io/api/event";
  script.src = "https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js";
  
  document.getElementsByTagName('head')[0].appendChild(script);
}

// Track custom events
export function trackPlausibleEvent(
  eventName: string,
  options?: PlausibleEventOptions
) {
  if (typeof window === 'undefined' || !window.plausible) {
    console.warn('Plausible not initialized');
    return;
  }

  try {
    window.plausible(eventName, options);
  } catch (error) {
    console.error('Plausible tracking error:', error);
  }
}

// Track page views with custom properties
export function trackPlausiblePageView(props?: PlausibleEventProps) {
  trackPlausibleEvent('pageview', { props });
}

// Content view goals
export function trackContentView(section: string, props?: PlausibleEventProps) {
  const goalMap: Record<string, string> = {
    'signals': 'View:Signals',
    'dimensionality': 'View:Dimensionality', 
    'blocks': 'View:Blocks',
    'core-alignments': 'View:CoreAlignments',
    'how-it-works': 'View:HowItWorks',
    'real-time-type': 'View:RealTimeType',
    'profiles': 'View:Profiles',
    'roadmap': 'View:Roadmap',
    'typing-lab': 'View:TypingLab'
  };

  const goalName = goalMap[section];
  if (goalName) {
    trackPlausibleEvent(goalName, { 
      props: { 
        section,
        ...props 
      } 
    });
  }
}

// CTA tracking
export function trackCTAClick(
  action: 'StartAssessment' | 'Subscribe' | 'Share' | 'Contact',
  ctaId?: string,
  section?: string,
  props?: PlausibleEventProps
) {
  trackPlausibleEvent(`CTA:${action}`, {
    props: {
      cta_id: ctaId,
      section,
      ...props
    }
  });
}

// Engagement tracking
export function trackEngagement(
  type: 'Read75' | 'Read50' | 'Read25' | 'Read100',
  section?: string,
  signal?: string,
  props?: PlausibleEventProps
) {
  trackPlausibleEvent(`Engagement:${type}`, {
    props: {
      section,
      signal,
      reading_depth: type.replace('Read', ''),
      ...props
    }
  });
}

// Lead tracking
export function trackLead(type: 'Contact' | 'Subscribe', props?: PlausibleEventProps) {
  trackPlausibleEvent(`Lead:${type}`, { props });
}

// Assessment events
export function trackAssessmentEvent(
  action: 'start' | 'complete' | 'abandon',
  props?: PlausibleEventProps
) {
  trackPlausibleEvent(`Assessment ${action}`, { props });
}

// Result views
export function trackResultView(props?: PlausibleEventProps) {
  trackPlausibleEvent('Result View', { props });
}

// Revenue tracking
export function trackRevenue(
  eventName: string,
  revenue: PlausibleRevenue,
  props?: PlausibleEventProps
) {
  trackPlausibleEvent(eventName, { revenue, props });
}