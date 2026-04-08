import React, { useState, useCallback } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, User, Tag, FileText } from 'lucide-react';
import { useSubmissions } from '../../hooks/useSubmissions';

// فرض می‌کنیم آیدی کاربر لاگین شده را از کانتکست دریافت می‌کنیم (در اینجا برای تست یک آیدی ثابت دادیم)
const MOCK_OBSERVER_ID = '00000000-0000-0000-0000-000000000000'; 

export const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { uploadAndProcessImage, isUploading, error, lastResult } = useSubmissions();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    // ایجاد پیش‌نمایش تصویر
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // شروع فرآیند آپلود و تحلیل
    await uploadAndProcessImage(file, MOCK_OBSERVER_ID);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* هدر صفحه */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">ارسال اسکرین‌شات جدید</h1>
          <p className="text-slate-500">تصویر مورد نظر را اینجا رها کنید تا توسط هوش مصنوعی پردازش شود.</p>
        </header>

        {/* منطقه Drag & Drop */}
        <div 
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 ease-in-out ${
            dragActive ? 'border-purple-500 bg-purple-50' : 'border-slate-300 bg-white hover:bg-slate-50'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-4 rounded-full ${dragActive ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700">برای آپلود کلیک کنید یا عکس را اینجا بکشید</p>
              <p className="text-sm text-slate-400 mt-1">PNG, JPG, JPEG (حداکثر ۵ مگابایت)</p>
            </div>
          </div>
        </div>

        {/* وضعیت بارگذاری */}
        {isUploading && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-center space-x-4 space-x-reverse animate-pulse">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            <span className="text-slate-700 font-medium">در حال تحلیل تصویر توسط مدل Gemini...</span>
          </div>
        )}

        {/* نمایش خطا */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start space-x-4 space-x-reverse">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-bold mb-1">خطا در پردازش</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* نمایش نتیجه موفقیت‌آمیز */}
        {lastResult && previewUrl && !isUploading && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center gap-3">
              <CheckCircle className="text-emerald-600 w-6 h-6" />
              <span className="text-emerald-800 font-bold">پردازش و استخراج با موفقیت انجام شد</span>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* پیش‌نمایش عکس */}
              <div className="bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center max-h-[400px]">
                <img src={previewUrl} alt="Preview" className="object-contain w-full h-full" />
              </div>
              
              {/* اطلاعات استخراج شده */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <User className="w-3 h-3" /> آیدی شناسایی شده
                  </span>
                  <div className="bg-purple-50 text-purple-700 font-mono font-bold text-lg px-4 py-3 rounded-xl border border-purple-100 inline-block">
                    @{lastResult.profile_id ? 'Profile Linked' : 'New Profile'} {/* In a real app, join with profiles table to get handle */}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <Tag className="w-3 h-3" /> دسته‌بندی موضوعی
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-medium px-4 py-2 rounded-lg inline-block">
                    {lastResult.ai_category || 'نامشخص'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <ImageIcon className="w-3 h-3" /> خلاصه تصویر
                  </span>
                  <p className="text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                    {lastResult.summary}
                  </p>
                </div>
                
                {lastResult.extracted_text && (
                   <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <FileText className="w-3 h-3" /> متن خام تصویر
                    </span>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 h-32 overflow-y-auto leading-relaxed">
                      {lastResult.extracted_text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};