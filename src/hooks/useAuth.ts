import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser]       = useState<User | null>(null);
  const [role, setRole]       = useState<'admin' | 'observer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchRole(u.id); else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchRole(u.id); else { setRole(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (uid: string) => {
    try {
      const { data } = await supabase
        .from('user_roles').select('role').eq('user_id', uid).single();
      setRole(data?.role ?? 'observer');
    } catch { setRole('observer'); }
    finally  { setLoading(false); }
  };

  return { user, role, loading };
};
