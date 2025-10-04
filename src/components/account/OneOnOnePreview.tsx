import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Lock, Calendar, CheckCircle, UserCircle, Clock } from 'lucide-react';

interface OneOnOnePreviewProps {
  isMember: boolean;
  onJoinBeta: () => void;
}

const mockSessions = [
  { day: 'Tue', time: '2:00 PM', title: 'Type Deep Dive', duration: '60 min' },
  { day: 'Thu', time: '10:00 AM', title: 'Career Strategy', duration: '45 min' },
  { day: 'Fri', time: '3:00 PM', title: 'Relationship Dynamics', duration: '60 min' },
];

const coachSpecialties = ['Career', 'Relationships', 'Team Dynamics'];

const unlockBenefits = [
  '1:1 sessions with type-certified coaches who understand your 1D–4D stack',
  'Custom action plans tied to your drift patterns and state trends',
  'Flexible scheduling (30/45/60 min sessions)',
  'Session notes + follow-up resources in your dashboard',
];

export function OneOnOnePreview({ onJoinBeta }: OneOnOnePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Mock Calendar Interface */}
      <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20">
        <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-muted-foreground z-10" />
        <div className="absolute inset-0 backdrop-blur-[1px] z-[5]" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Available Sessions
          </CardTitle>
          <CardDescription>Book a session with a type-certified coach</CardDescription>
        </CardHeader>
        <CardContent className="opacity-60">
          <div className="space-y-3">
            {mockSessions.map((session, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-muted-foreground/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-muted-foreground">{session.day}</div>
                    <div className="text-sm font-medium">{session.time}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium blur-[1px]">{session.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.duration}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coach Profile Teaser */}
      <Card className="relative overflow-hidden">
        <Lock className="absolute top-4 right-4 h-5 w-5 text-muted-foreground z-10" />
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10">
                <UserCircle className="h-10 w-10 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">Type-Certified Coach</CardTitle>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {coachSpecialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <p className="text-sm text-muted-foreground blur-[2px] select-none">
              15 years experience with cognitive function coaching, specializing in ESTJ → LSE
              drift patterns and dimensional stack optimization for career transitions...
            </p>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
        </CardContent>
      </Card>

      {/* What Beta Unlocks Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            What Beta Unlocks
          </CardTitle>
          <CardDescription>Type-aware coaching, not generic life coaching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {unlockBenefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{benefit}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-8 text-center">
          <Button size="lg" onClick={onJoinBeta} className="mb-2">
            <Calendar className="h-5 w-5 mr-2" />
            Book Your First Session
          </Button>
          <p className="text-sm text-muted-foreground">
            Type-aware coaching, not generic life coaching
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
