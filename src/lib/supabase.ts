import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// خواندن آدرس و کلید از متغیرهای محیطی Vite
// اگر فایل .env هنوز ساخته نشده باشد، مقادیر پیش‌فرض قرار می‌گیرند تا برنامه کرش نکند
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// ساخت و اکسپورت کردن کلاینت اصلی سوپابیس به همراه تایپ‌های دیتابیس
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// یک تابع کمکی (Helper) برای گرفتن لینک عمومی و قابل نمایشِ عکس‌های آپلود شده
export const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return '';
  const { data } = supabase.storage.from('screenshots').getPublicUrl(imagePath);
  return data.publicUrl;
};