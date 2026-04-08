import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'observer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkUserRole(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkUserRole(session.user);
      else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (currentUser: User) => {
    try {
      // ۱. اگر کاربر بدون رمز (ناشناس) وارد شده باشد، قطعا رصدگر است
      if (currentUser.is_anonymous) {
        setRole('observer');
        return;
      }

      // ۲. اگر با ایمیل وارد شده، نقش او را از دیتابیس می‌گیریم
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .single();
        
      if (!error && data) setRole((data as any).role as 'admin' | 'observer');
      else setRole('observer'); // پیش‌فرض ایمنی
    } catch (err) {
      setRole('observer');
    } finally {
      setLoading(false);
    }
  };

  return { user, role, loading };
};