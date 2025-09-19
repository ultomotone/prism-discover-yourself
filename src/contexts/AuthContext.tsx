import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ensureSessionLinked } from '@/services/sessionLinking';
import { IS_PREVIEW } from '@/lib/env';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (IS_PREVIEW) return;

    let cancelled = false;

    (async () => {
      try {
        const cached = localStorage.getItem('prism_last_session');
        if (!cached) return;

        const { id, email } = JSON.parse(cached) as {
          id?: string;
          email?: string;
        };

        if (!id || cancelled) return;

        const linked = await ensureSessionLinked({
          sessionId: id,
          userId: user.id,
          email: user.email ?? email ?? undefined,
        });

        if (linked && !cancelled) {
          localStorage.removeItem('prism_last_session');
        }
      } catch (err) {
        console.warn('Failed to link cached session', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}