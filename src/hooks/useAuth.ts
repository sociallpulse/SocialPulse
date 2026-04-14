import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'observer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkUserRole(currentUser);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkUserRole(currentUser);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (currentUser: User) => {
    try {
      if (currentUser.is_anonymous) {
        const testRole = localStorage.getItem('test_role') as 'admin' | 'observer';
        setRole(testRole || 'observer');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .single();

      if (data && !error) {
        // استفاده از any و cast کردن برای رفع خطای Property 'role' does not exist on type 'never'
        setRole((data as any).role as 'admin' | 'observer');
      } else {
        setRole('observer'); 
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      setRole('observer');
    } finally {
      setLoading(false);
    }
  };

  return { user, role, loading };
};