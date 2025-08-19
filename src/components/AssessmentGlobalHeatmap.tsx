import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface CountryData {
  country: string;
  count: number;
  coordinates?: [number, number];
}

// Country coordinates mapping for major countries
const countryCoordinates: Record<string, [number, number]> = {
  'United States': [-98.5795, 39.8283],
  'Canada': [-106.3468, 56.1304],
  'United Kingdom': [-3.4360, 55.3781],
  'Germany': [10.4515, 51.1657],
  'France': [2.2137, 46.2276],
  'Sweden': [18.6435, 60.1282],
  'Norway': [8.4689, 60.4720],
  'Australia': [133.7751, -25.2744],
  'Japan': [138.2529, 36.2048],
  'Brazil': [-51.9253, -14.2351],
  'India': [78.9629, 20.5937],
  'China': [104.1954, 35.8617],
  'Russia': [105.3188, 61.5240],
  'South Africa': [22.9375, -30.5595],
  'Mexico': [-102.5528, 23.6345],
  'Italy': [12.5674, 41.8719],
  'Spain': [-3.7492, 40.4637],
  'Netherlands': [5.2913, 52.1326],
  'Poland': [19.1343, 51.9194],
  'Turkey': [35.2433, 38.9637],
  'South Korea': [127.9780, 35.9078],
  'Argentina': [-63.6167, -38.4161],
  'Chile': [-71.5430, -35.6751],
  'Egypt': [30.8025, 26.8206],
  'Nigeria': [8.6753, 9.0820],
  'Kenya': [37.9062, -0.0236],
  'Indonesia': [113.9213, -0.7893],
  'Thailand': [100.9925, 15.8700],
  'Vietnam': [108.2772, 14.0583],
  'Philippines': [121.7740, 12.8797],
  'Unknown': [0, 0]
};

interface AssessmentGlobalHeatmapProps {
  countryData: CountryData[];
}

const AssessmentGlobalHeatmap: React.FC<AssessmentGlobalHeatmapProps> = ({ countryData }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get Mapbox token from edge function or use a demo token
    const fetchMapboxToken = async () => {
      try {
        // First try to get from a dedicated edge function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token', {});
        if (data?.token && !error) {
          setMapboxToken(data.token);
        } else {
          // Fallback: Use Mapbox demo token for now
          // In production, users should add their own token
          setMapboxToken('pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA');
        }
      } catch (error) {
        console.warn('Could not fetch Mapbox token, using demo token');
        setMapboxToken('pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA');
      } finally {
        setLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || loading) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark theme matches the dashboard
      projection: 'globe',
      zoom: 1.2,
      center: [30, 20], // Centered on Europe/Africa for good global view
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Disable scroll zoom initially for smoother experience
    map.current.scrollZoom.disable();
    
    // Enable scroll zoom on interaction
    map.current.on('mouseenter', () => {
      map.current?.scrollZoom.enable();
    });

    map.current.on('mouseleave', () => {
      map.current?.scrollZoom.disable();
    });

    // Add fog effects for the globe
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(50, 50, 70)', // Darker fog for dark theme
        'high-color': 'rgb(80, 80, 120)',
        'horizon-blend': 0.3,
      });

      // Add assessment data as markers
      countryData.forEach((country) => {
        if (country.country === 'Unknown' || country.count === 0) return;
        
        const coordinates = countryCoordinates[country.country];
        if (!coordinates) return;

        // Create a marker size based on assessment count
        const size = Math.min(Math.max(country.count * 3, 8), 40);
        const intensity = Math.min(country.count / 10, 1); // Normalize for color intensity

        // Create marker element
        const el = document.createElement('div');
        el.className = 'assessment-marker';
        el.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          background: radial-gradient(circle, 
            hsl(var(--primary) / ${0.8 * intensity}) 0%, 
            hsl(var(--primary) / ${0.4 * intensity}) 70%, 
            transparent 100%
          );
          border-radius: 50%;
          border: 2px solid hsl(var(--primary) / ${0.9 * intensity});
          cursor: pointer;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        `;

        // Add pulsing animation
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `;
        document.head.appendChild(styleSheet);

        // Create marker and popup
        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .addTo(map.current!);

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: 'assessment-popup'
        }).setHTML(`
          <div class="p-2 text-sm">
            <div class="font-semibold text-primary">${country.country}</div>
            <div class="text-muted-foreground">${country.count} assessment${country.count !== 1 ? 's' : ''}</div>
          </div>
        `);

        el.addEventListener('mouseenter', () => {
          popup.addTo(map.current!);
          marker.setPopup(popup);
          popup.addTo(map.current!);
        });

        el.addEventListener('mouseleave', () => {
          popup.remove();
        });
      });
    });

    // Rotation animation for the globe
    const secondsPerRevolution = 180;
    const maxSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;

    function spinGlobe() {
      if (!map.current) return;
      
      const zoom = map.current.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        const distancePerSecond = 360 / secondsPerRevolution;
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    // Event listeners for interaction
    map.current.on('mousedown', () => {
      userInteracting = true;
    });
    
    map.current.on('dragstart', () => {
      userInteracting = true;
    });
    
    map.current.on('mouseup', () => {
      userInteracting = false;
      setTimeout(spinGlobe, 2000); // Resume spinning after 2 seconds
    });
    
    map.current.on('touchend', () => {
      userInteracting = false;
      setTimeout(spinGlobe, 2000);
    });

    map.current.on('moveend', () => {
      if (!userInteracting) {
        spinGlobe();
      }
    });

    // Start the globe spinning
    setTimeout(spinGlobe, 1000);

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [countryData, mapboxToken, loading]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading global assessment map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg overflow-hidden" />
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm text-primary mb-1">Global Assessment Activity</h3>
        <p className="text-xs text-muted-foreground">
          {countryData.reduce((sum, country) => sum + country.count, 0)} total assessments
        </p>
      </div>
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground">
        Hover over markers for details • Scroll to zoom
      </div>
    </div>
  );
};

export default AssessmentGlobalHeatmap;