import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { linkSessionsToUser, linkSessionToAccount } from '@/services/sessionLinking';

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

    if (user.email) {
      linkSessionsToUser(supabase, user.email, user.id).catch((err) => {
        console.error('Failed to link sessions to account', err);
      });
    }

    try {
      const cached = localStorage.getItem('prism_last_session');
      if (cached) {
        const { id, email } = JSON.parse(cached) as {
          id?: string;
          email?: string;
        };
        if (id) {
          linkSessionToAccount(
            supabase,
            id,
            user.id,
            user.email ?? email ?? ''
          ).catch((err) => {
            console.error('Failed to link cached session', err);
          });
        }
      }
    } catch (err) {
      console.warn('Failed to parse cached session', err);
    }
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