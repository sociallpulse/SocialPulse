import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];

export const useSubmissions = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<Submission | null>(null);

  const uploadAndProcessImage = async (file: File, observerId: string) => {
    setIsUploading(true);
    setError(null);
    setLastResult(null);

    try {
      // ۱. تولید نام یکتا برای فایل و مسیر آپلود
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${observerId}/${fileName}`;

      // ۲. آپلود تصویر در Supabase Storage (Bucket: screenshots)
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(`خطا در آپلود تصویر: ${uploadError.message}`);

      // ۳. فراخوانی تابع هوش مصنوعی (Edge Function) برای پردازش تصویر
      const { data, error: functionError } = await supabase.functions.invoke('process-image', {
        body: { image_path: filePath, observer_id: observerId }
      });

      if (functionError) throw new Error(`خطا در پردازش هوش مصنوعی: ${functionError.message}`);
      
      if (!data?.success) {
         throw new Error(data?.error || 'خطای ناشناخته در پردازش تصویر');
      }

      // ۴. ذخیره نتیجه موفقیت‌آمیز
      setLastResult(data.data as Submission);
      return data.data;

    } catch (err: any) {
      console.error('Upload Process Error:', err);
      setError(err.message || 'خطایی در سیستم رخ داده است.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { 
    uploadAndProcessImage, 
    isUploading, 
    error, 
    lastResult 
  };
};