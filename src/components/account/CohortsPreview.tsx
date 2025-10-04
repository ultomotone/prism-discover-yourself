import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Lock, Users, CheckCircle } from 'lucide-react';

interface CohortsPreviewProps {
  isMember: boolean;
  onJoinBeta: () => void;
}

const mockCohorts = [
  {
    name: 'Core Cluster: xSTJ Family',
    members: 12,
    types: ['ESTJ', 'ISTJ', 'ENTJ'],
    status: 'Active • 3 new posts',
    preview: "This week's prompt: How do you handle Te-overload when deadlines stack?...",
    avatars: [
      { initials: 'JD', color: 'bg-blue-500' },
      { initials: 'SK', color: 'bg-purple-500' },
      { initials: 'AL', color: 'bg-green-500' },
      { initials: 'MR', color: 'bg-orange-500' },
      { initials: 'TC', color: 'bg-pink-500' },
      { initials: 'BW', color: 'bg-indigo-500' },
      { initials: 'NH', color: 'bg-red-500' },
      { initials: 'KP', color: 'bg-yellow-500' },
    ],
  },
  {
    name: 'Complementary Mix: Strategists + Executors',
    members: 8,
    types: ['INTJ', 'ENTJ', 'ESTJ', 'ISTJ'],
    status: 'Active • Live call tomorrow',
    preview: 'Monthly sync: Balancing Ni vision with Te execution...',
    avatars: [
      { initials: 'DL', color: 'bg-cyan-500' },
      { initials: 'EM', color: 'bg-violet-500' },
      { initials: 'FG', color: 'bg-teal-500' },
      { initials: 'RP', color: 'bg-rose-500' },
      { initials: 'LK', color: 'bg-amber-500' },
      { initials: 'WJ', color: 'bg-lime-500' },
    ],
  },
  {
    name: 'Beta Testers Circle',
    members: 24,
    types: ['Mixed Types'],
    status: 'Active • 12 new posts',
    preview: 'Share your drift map insights and retest patterns...',
    avatars: [
      { initials: 'AN', color: 'bg-emerald-500' },
      { initials: 'BC', color: 'bg-fuchsia-500' },
      { initials: 'CD', color: 'bg-sky-500' },
      { initials: 'DE', color: 'bg-orange-500' },
      { initials: 'EF', color: 'bg-purple-500' },
      { initials: 'FG', color: 'bg-blue-500' },
      { initials: 'GH', color: 'bg-pink-500' },
      { initials: 'HI', color: 'bg-green-500' },
    ],
  },
];

const unlockBenefits = [
  'Type-clustered cohorts (similar types) + complementary mixes',
  'Weekly prompts tied to your 1D–4D profile with async discussions',
  'Monthly live calls with type-aware facilitation',
  'Private notes + shared insights (you control what you share)',
];

export function CohortsPreview({ onJoinBeta }: CohortsPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Mock Cohort Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockCohorts.map((cohort, idx) => (
          <Card key={idx} className="relative overflow-hidden">
            <Lock className="absolute top-4 right-4 h-5 w-5 text-muted-foreground z-10" />
            <CardHeader>
              <CardTitle className="text-lg">{cohort.name}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {cohort.members} members
                </Badge>
                {cohort.types.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Avatar Grid */}
              <div className="flex -space-x-2">
                {cohort.avatars.slice(0, 4).map((avatar, i) => (
                  <Avatar key={i} className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className={`${avatar.color} text-white text-xs`}>
                      {avatar.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {cohort.avatars.length > 4 && (
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      +{cohort.avatars.length - 4}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">{cohort.status}</span>
              </div>

              {/* Blurred Preview */}
              <div className="relative">
                <p className="text-sm text-muted-foreground blur-[2px] select-none">
                  {cohort.preview}
                </p>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What Beta Unlocks Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            What Beta Unlocks
          </CardTitle>
          <CardDescription>Connect with people who understand your cognitive wiring</CardDescription>
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
            <Users className="h-5 w-5 mr-2" />
            Join a Cohort
          </Button>
          <p className="text-sm text-muted-foreground">
            Connect with 8-12 people who get your wiring
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
