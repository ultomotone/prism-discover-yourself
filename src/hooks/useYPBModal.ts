import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'ypb_pop_v1';
const SHOW_DELAY = 10000; // 10 seconds
const SCROLL_THRESHOLD = 0.4; // 40%

export const useYPBModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if we should show the modal
    const shouldShow = () => {
      // Don't show if already shown this session
      if (sessionStorage.getItem(STORAGE_KEY)) {
        return false;
      }

      // Don't show on assessment pages
      if (location.pathname.includes('/assessment') || 
          location.search.includes('assessment=true')) {
        return false;
      }

      return true;
    };

    if (!shouldShow()) {
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let hasTriggered = false;

    // Timer trigger (10 seconds)
    timeoutId = setTimeout(() => {
      if (!hasTriggered && shouldShow()) {
        hasTriggered = true;
        setIsOpen(true);
      }
    }, SHOW_DELAY);

    // Scroll trigger (40%)
    const handleScroll = () => {
      if (hasTriggered || !shouldShow()) {
        return;
      }

      const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      
      if (scrolled >= SCROLL_THRESHOLD) {
        hasTriggered = true;
        clearTimeout(timeoutId);
        setIsOpen(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname, location.search]);

  const closeModal = () => {
    setIsOpen(false);
    // Mark as shown to prevent re-showing this session
    sessionStorage.setItem(STORAGE_KEY, 'true');
  };

  return {
    isOpen,
    closeModal
  };
};