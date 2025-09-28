import React from 'react';
import { trackEngagement } from './plausible-analytics';

interface ScrollTrackerOptions {
  section?: string;
  signal?: string;
  thresholds?: number[];
}

class ScrollTracker {
  private trackedThresholds = new Set<number>();
  private section?: string;
  private signal?: string;
  private thresholds: number[];
  private isTracking = false;

  constructor(options: ScrollTrackerOptions = {}) {
    this.section = options.section;
    this.signal = options.signal;
    this.thresholds = options.thresholds || [25, 50, 75, 100];
  }

  start() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.trackedThresholds.clear();
    
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  stop() {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  private handleScroll = () => {
    const scrollPercent = this.getScrollPercent();
    
    for (const threshold of this.thresholds) {
      if (scrollPercent >= threshold && !this.trackedThresholds.has(threshold)) {
        this.trackedThresholds.add(threshold);
        trackEngagement(`Read${threshold}` as any, this.section, this.signal);
        
        // Stop tracking after 100%
        if (threshold === 100) {
          this.stop();
          break;
        }
      }
    }
  };

  private handleBeforeUnload = () => {
    // Track final scroll position on page unload
    const scrollPercent = this.getScrollPercent();
    const maxThreshold = Math.max(...Array.from(this.trackedThresholds));
    
    if (scrollPercent > maxThreshold) {
      const nextThreshold = this.thresholds.find(t => t > maxThreshold && scrollPercent >= t);
      if (nextThreshold) {
        trackEngagement(`Read${nextThreshold}` as any, this.section, this.signal);
      }
    }
  };

  private getScrollPercent(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
  }
}

// Convenience function for easy setup
export function initScrollTracking(options: ScrollTrackerOptions = {}) {
  const tracker = new ScrollTracker(options);
  
  // Auto-start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tracker.start());
  } else {
    tracker.start();
  }
  
  return tracker;
}

// Hook for React components
export function useScrollTracking(options: ScrollTrackerOptions = {}) {
  const tracker = new ScrollTracker(options);
  
  React.useEffect(() => {
    tracker.start();
    return () => tracker.stop();
  }, [tracker]);
  
  return tracker;
}

export { ScrollTracker };