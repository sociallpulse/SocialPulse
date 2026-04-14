import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSubmissions = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadAndProcessMultiple = async (files: File[], observerId: string) => {
    setIsUploading(true);
    setError(null);
    setProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(prev => ({ ...prev, current: i + 1 }));
        
        const base64Data = await fileToBase64(files[i]);
        
        // ارسال مستقیم به دیتابیس با وضعیت pending جهت پردازش در پس‌زمینه
        // تبدیل کل تابع from به any برای رفع قطعی خطای never در تایپ‌اسکریپت Vercel
        const { error: insertError } = await (supabase.from('submissions') as any)
          .insert([{
            observer_id: observerId,
            image_path: 'BKG_PROCESS', 
            temp_image_data: base64Data, 
            status: 'pending'
          }]);

        if (insertError) throw insertError;
      }
      
      return true;
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError('خطا در ثبت تصاویر. لطفاً دوباره تلاش کنید.');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { 
    uploadAndProcessMultiple,
    isUploading, 
    error, 
    progress 
  };
};