import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useEntitlementsContext } from '@/contexts/EntitlementsContext';

type MembershipGateProps = {
  feature?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  blurWhenLocked?: boolean;
};

export function MembershipGate({ 
  feature, 
  children, 
  fallback, 
  blurWhenLocked = true 
}: MembershipGateProps) {
  const { isMember, loading } = useEntitlementsContext();
  const navigate = useNavigate();

  if (loading) {
    return <div className="animate-pulse bg-muted h-32 rounded-md" />;
  }

  if (isMember) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {blurWhenLocked && (
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
      )}
      <Card className="absolute inset-0 bg-background/80 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center">
        <CardContent className="text-center p-6">
          <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">
            {feature ? `${feature} - Beta Members Only` : 'Beta Members Only'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Join the Founding Beta to unlock this feature
          </p>
          <Button onClick={() => navigate('/membership')}>
            Join Beta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
