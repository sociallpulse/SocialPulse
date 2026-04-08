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
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${observerId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`خطا در آپلود: ${uploadError.message}`);

      const { data, error: functionError } = await supabase.functions.invoke('process-image', {
        body: { image_path: filePath, observer_id: observerId }
      });

      if (functionError) throw new Error(`خطای سرور هوش مصنوعی: ${functionError.message}`);
      if (!data?.success) throw new Error(data?.error || 'خطای ناشناخته در پردازش تصویر');

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

  return { uploadAndProcessImage, isUploading, error, lastResult };
};