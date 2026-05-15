import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSubmissions = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [progress, setProgress]       = useState({ current: 0, total: 0 });

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload  = () => resolve((r.result as string).split(',')[1]);
      r.onerror = reject;
    });

  const uploadAndProcessMultiple = async (files: File[], observerId: string) => {
    setIsUploading(true);
    setError(null);
    setProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(p => ({ ...p, current: i + 1 }));
        const base64Data = await fileToBase64(files[i]);
        const { error: e } = await supabase.from('submissions').insert({
          observer_id:     observerId,
          image_path:      'BKG_PROCESS',
          temp_image_data: base64Data,
          status:          'pending',
        });
        if (e) throw e;
      }
      return true;
    } catch (err: unknown) {
      setError('خطا در ثبت تصاویر. لطفاً دوباره تلاش کنید.');
      console.error(err);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAndProcessMultiple, isUploading, error, progress };
};
