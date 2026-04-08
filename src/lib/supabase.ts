/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// خواندن آدرس و کلید از متغیرهای محیطی Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// ساخت و اکسپورت کردن کلاینت اصلی سوپابیس
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return '';
  const { data } = supabase.storage.from('screenshots').getPublicUrl(imagePath);
  return data.publicUrl;
};