import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { linkSessionToAccount } from '@/services/sessionLinking';

export default function ContinueSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await linkSessionToAccount(
            supabase,
            sessionId,
            user.id,
            user.email ?? undefined,
          );
        } catch (err) {
          console.error('Failed to link session', err);
        }
      } else {
        try {
          localStorage.setItem('prism_last_session', JSON.stringify({ id: sessionId }));
        } catch (err) {
          console.warn('Failed to cache session', err);
        }
      }
      navigate(`/assessment?resume=${sessionId}`, { replace: true });
    })();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading session...</p>
    </div>
  );
}

