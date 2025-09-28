import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  trackStartAssessmentCTA, 
  trackSubscribeCTA, 
  trackShareCTA, 
  trackContactCTA 
} from '@/lib/cta-tracker';
import { trackLead } from '@/lib/plausible-analytics';
import { initScrollTracking } from '@/lib/scroll-tracker';

interface AnalyticsDemoProps {
  section?: string;
}

export function AnalyticsDemo({ section = 'demo' }: AnalyticsDemoProps) {
  useEffect(() => {
    // Initialize scroll tracking for this demo
    const tracker = initScrollTracking({ section });
    
    return () => {
      tracker.stop();
    };
  }, [section]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plausible Analytics Demo</CardTitle>
          <CardDescription>
            Test the enhanced Plausible tracking system with goals, custom events, and scroll depth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* CTA Tracking Examples */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              data-cta="start-assessment"
              data-cta-id="demo_start_header"
              onClick={() => trackStartAssessmentCTA('demo_start_header', section)}
              className="w-full"
            >
              Start Assessment (Auto-tracked)
            </Button>
            
            <Button 
              variant="outline"
              data-cta="subscribe"
              data-cta-id="demo_subscribe"
              onClick={() => trackSubscribeCTA('demo_subscribe', section)}
              className="w-full"
            >
              Subscribe (Auto-tracked)
            </Button>
            
            <Button 
              variant="secondary"
              onClick={() => trackShareCTA('demo_share_manual', section, {
                share_type: 'manual_click',
                content_type: 'demo'
              })}
              className="w-full"
            >
              Share (Manual)
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => trackContactCTA('demo_contact_manual', section, {
                contact_type: 'demo_inquiry'
              })}
              className="w-full"
            >
              Contact (Manual)
            </Button>
          </div>

          {/* Lead Generation Example */}
          <div className="pt-4 border-t">
            <Button 
              onClick={() => {
                // Simulate lead capture
                const email = 'demo@example.com';
                trackLead('Subscribe', {
                  email,
                  source: 'demo_component',
                  section
                });
                alert('Lead tracked! Check Plausible dashboard for "Lead:Subscribe" event.');
              }}
              className="w-full"
            >
              Simulate Lead Capture
            </Button>
          </div>
          
          {/* Scroll Tracking Info */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Scroll Depth Tracking</h4>
            <p className="text-sm text-muted-foreground">
              Scroll through this page to trigger engagement events at 25%, 50%, 75%, and 100% depth.
              Events will appear as "Engagement:Read25", "Engagement:Read50", etc. in your Plausible dashboard.
            </p>
          </div>

          {/* Dummy content for scroll testing */}
          <div className="space-y-4 pt-8">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="p-4 bg-muted rounded-lg">
                <h5 className="font-medium mb-2">Content Block {i + 1}</h5>
                <p className="text-sm">
                  This is dummy content to demonstrate scroll depth tracking. 
                  As you scroll through this content, engagement events will be fired 
                  automatically based on how much of the page you've read.
                </p>
              </div>
            ))}
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}