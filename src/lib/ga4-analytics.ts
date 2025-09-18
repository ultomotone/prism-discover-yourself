/**
 * GA4 Analytics Integration
 * Provides client-side GA4 tracking with server-side deduplication support
 */

// Public GA4 Measurement ID (safe to include in client bundle)
const GA4_MEASUREMENT_ID = 'G-J2XXMC9VWV';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Initialize GA4 gtag (call after user consent)
 */
export const initializeGA4 = () => {
  if (typeof window === 'undefined') return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID);
};

/**
 * Track assessment scoring completion
 * Uses event_id for server-side deduplication
 */
export const trackAssessmentScored = (params: {
  sessionId: string;
  score?: number;
  typeCode?: string;
  confidence?: string;
  fitBand?: string;
  overlay?: string;
  eventId?: string;
}) => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.log('GA4 not initialized, skipping client event');
    return;
  }

  const eventId = params.eventId || crypto.randomUUID();

  window.gtag('event', 'assessment_scored', {
    event_id: eventId,
    assessment_id: params.sessionId,
    score: params.score || 0,
    type_code: params.typeCode,
    confidence: params.confidence,
    fit_band: params.fitBand,
    overlay: params.overlay,
    realtime: false // client-side event
  });

  console.log(`📊 GA4 client event sent for session ${params.sessionId} (event_id: ${eventId})`);
};

/**
 * Track other assessment events
 */
export const trackAssessmentStarted = (sessionId: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'assessment_started', {
    assessment_id: sessionId,
    event_category: 'assessment',
    event_label: 'started'
  });
};

export const trackAssessmentCompleted = (sessionId: string, questionCount: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'assessment_completed', {
    assessment_id: sessionId,
    question_count: questionCount,
    event_category: 'assessment',
    event_label: 'completed'
  });
};

/**
 * Check if GA4 is loaded and ready
 */
export const isGA4Ready = (): boolean => {
  return typeof window !== 'undefined' && !!window.gtag;
};