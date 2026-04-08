import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'observer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // بررسی وضعیت نشست فعلی هنگام بارگذاری اولیه
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkUserRole(currentUser);
      } else {
        setLoading(false);
      }
    });

    // گوش دادن به تغییرات وضعیت احراز هویت (Login/Logout)
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
      // منطق ویژه برای "ورود سریع" (فقط برای فاز توسعه و تست)
      if (currentUser.is_anonymous) {
        const testRole = localStorage.getItem('test_role') as 'admin' | 'observer';
        setRole(testRole || 'observer');
        setLoading(false);
        return;
      }

      // منطق ورود رسمی (جستجو در دیتابیس)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .single();

      // استفاده از casting به any برای عبور از محدودیت تایپ‌اسکریپت در زمان بیلد
      if (data && !error) {
        const userRole = (data as any).role;
        setRole(userRole as 'admin' | 'observer');
      } else {
        setRole('observer'); // نقش پیش‌فرض در صورت نبود رکورد یا خطا
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