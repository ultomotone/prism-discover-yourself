import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeRouteTracking } from './lib/route-tracking'
import { initializeRedditSPATracking } from './lib/reddit/spa-tracker'

// Initialize route tracking for SPA navigation
initializeRouteTracking()

// Initialize Reddit SPA tracking with conversions API
initializeRedditSPATracking({
  trackPixel: true,
  trackConversions: true,
  debounceMs: 100
})

createRoot(document.getElementById("root")!).render(<App />);
