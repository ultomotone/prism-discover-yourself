import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeRouteTracking } from './lib/route-tracking'

// Initialize route tracking for SPA navigation
initializeRouteTracking()

createRoot(document.getElementById("root")!).render(<App />);
