import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail } from 'lucide-react';

export default function ResetPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [canUpdatePassword, setCanUpdatePassword] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      // If a recovery session exists (from the email link), allow password update
      setCanUpdatePassword(!!data.session);
    })();
    return () => { mounted = false; };
  }, []);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSending(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast({
        title: 'Check your email',
        description: 'We sent a secure link to reset your password.',
      });
    } catch (err: any) {
      toast({
        title: 'Could not send reset email',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Use at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({
        title: 'Password updated',
        description: 'You can now sign in with your new password.',
      });
      navigate('/login');
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.message || 'Open the link from your email again and retry.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 prism-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Reset your password</CardTitle>
              <p className="text-muted-foreground">We will send a secure link to your email</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendReset} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSending}>
                  {isSending ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 prism-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Set a new password</CardTitle>
              <p className="text-muted-foreground">
                Open the recovery link from your email, then set a new password here.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!canUpdatePassword || isUpdating}>
                  {isUpdating ? 'Updating…' : canUpdatePassword ? 'Update password' : 'Open link from your email first'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
