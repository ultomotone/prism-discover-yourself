// Google Analytics tracking utility
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Assessment-specific tracking functions
export const trackAssessmentStart = (sessionId: string) => {
  trackEvent('assessment_started', 'assessment', sessionId);
};

export const trackAssessmentProgress = (questionIndex: number, totalQuestions: number, sessionId: string) => {
  const progress = Math.round((questionIndex + 1) / totalQuestions * 100);
  trackEvent('assessment_progress', 'assessment', `${progress}%_complete`, progress);
  
  // Track milestone progress
  if (progress === 25 || progress === 50 || progress === 75) {
    trackEvent(`milestone_${progress}`, 'assessment', sessionId);
  }
};

export const trackAssessmentComplete = (sessionId: string, totalQuestions: number) => {
  trackEvent('assessment_completed', 'assessment', sessionId, totalQuestions);
};

export const trackAccountCreation = (email: string) => {
  trackEvent('account_created', 'user', 'from_assessment');
  // Don't track the actual email for privacy
  trackEvent('signup_completed', 'user');
};

export const trackResultsViewed = (sessionId: string, typeCode?: string) => {
  trackEvent('results_viewed', 'assessment', typeCode || 'unknown');
};