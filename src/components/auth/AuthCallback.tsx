import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAuthText } from '@/hooks/useAuthText';
import PublicShell from '@/components/layout/PublicShell';

export default function AuthCallback() {
  return (
    <PublicShell>
      <AuthCallbackContent />
    </PublicShell>
  );
}

function AuthCallbackContent() {
  const t = useAuthText();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      window.location.href = '/lessons';
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || '/lessons';

    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        return;
      }
      if (session) {
        window.location.replace(next);
        return;
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
        if (event === 'SIGNED_IN' && s) {
          subscription.unsubscribe();
          window.location.replace(next);
        }
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      {error ? (
        <>
          <p className="text-[var(--color-incorrect)]">{error}</p>
          <a href="/login" className="mt-4 text-[var(--color-accent)] no-underline hover:underline">
            {t.signIn}
          </a>
        </>
      ) : (
        <p className="text-[var(--color-text-muted)]">{t.redirecting}</p>
      )}
    </div>
  );
}
