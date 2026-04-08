import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Loader2, CheckCircle, AlertCircle, LogOut, ScanLine, Tag, AlignLeft, UserCircle, RefreshCw, FileImage } from 'lucide-react';
import { useSubmissions } from '../../hooks/useSubmissions';

export const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { uploadAndProcessImage, isUploading, error, lastResult } = useSubmissions();
  
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    supabase.auth.getSession().then(({data}) => setUserId(data.session?.user.id || ''));
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [uploadAndProcessImage, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    await uploadAndProcessImage(file, userId);
  };

  const resetUpload = () => {
    setPreviewUrl(null);
    // Resetting state naturally happens on next upload, but we clear preview here
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-200" dir="rtl">
      {/* هدر شیشه‌ای */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl">
              <ScanLine className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">پلتفرم رصد SocialPulse</h1>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all"
          >
            <span className="hidden sm:inline">خروج</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 sm:space-y-12 animate-fade-in">
        
        <div className="text-center space-y-3 sm:space-y-4 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">تحلیل هوشمند اسکرین‌شات</h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            تصویر پست، استوری یا ریلز مورد نظر را آپلود کنید تا هوش مصنوعی در کسری از ثانیه اطلاعات آن را استخراج کند.
          </p>
        </div>

        {/* منطقه آپلود (نمایش فقط زمانی که نتیجه‌ای نداریم یا در حال آپلودیم) */}
        {!lastResult && !error && (
          <div 
            className={`relative group overflow-hidden border-2 border-dashed rounded-[2rem] p-10 sm:p-16 text-center transition-all duration-300 ease-out animate-slide-up shadow-sm
              ${dragActive ? 'border-indigo-500 bg-indigo-50/80 scale-[1.02]' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'} 
              ${isUploading ? 'opacity-0 hidden' : 'opacity-100'}`}
            style={{ animationDelay: '0.1s' }}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            <input type="file" accept="image/*" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" disabled={isUploading} />
            
            <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
              <div className={`p-6 rounded-full transition-all duration-300 shadow-sm ${dragActive ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                <FileImage className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-slate-700">تصویر را اینجا بکشید و رها کنید</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">یا برای انتخاب فایل کلیک کنید (فرمت‌های JPG, PNG)</p>
              </div>
              <button className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md group-hover:bg-indigo-600 transition-colors pointer-events-none">
                انتخاب تصویر
              </button>
            </div>
          </div>
        )}

        {/* وضعیت لودینگ */}
        {isUploading && previewUrl && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 flex flex-col items-center justify-center gap-6 animate-fade-in text-center">
            <div className="relative">
              <img src={previewUrl} alt="Uploading" className="w-32 h-32 object-cover rounded-2xl opacity-50 blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">در حال پردازش توسط Gemini...</h3>
              <p className="text-slate-500 text-sm font-medium">استخراج متن، شناسایی آیدی و دسته‌بندی محتوا</p>
            </div>
          </div>
        )}

        {/* وضعیت ارور */}
        {error && (
          <div className="bg-white border border-red-100 rounded-[2rem] p-8 sm:p-12 text-center shadow-lg animate-slide-up">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-red-800 font-extrabold text-2xl mb-3">خطا در پردازش تصویر</h3>
            <p className="text-red-600 text-sm sm:text-base mb-8 max-w-md mx-auto">{error}</p>
            <button onClick={resetUpload} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md shadow-red-500/20">
              <RefreshCw className="w-5 h-5" /> تلاش مجدد
            </button>
          </div>
        )}

        {/* نمایش نتیجه هوش مصنوعی */}
        {lastResult && previewUrl && !isUploading && (
          <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-200/60 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-white w-6 h-6 sm:w-7 sm:h-7" />
                <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight">گزارش استخراج موفق</span>
              </div>
              <button onClick={resetUpload} className="text-emerald-50 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" /> <span className="hidden sm:inline">سند جدید</span>
              </button>
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
              {/* پیش‌نمایش تصویر */}
              <div className="md:col-span-5 bg-slate-50 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-200/60 shadow-inner relative group">
                <img src={previewUrl} alt="Preview" className="w-full object-contain max-h-[500px]" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none"></div>
              </div>
              
              {/* نتایج آنالیز */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-6">
                
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <UserCircle className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">پروفایل شناسایی شده</span>
                  </div>
                  <div className="inline-block bg-white text-indigo-700 font-mono font-bold text-2xl px-5 py-2.5 rounded-2xl border border-indigo-100 shadow-sm" dir="ltr">
                    @{lastResult.profile_id || 'نامشخص'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:border-purple-100 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <Tag className="w-5 h-5 text-purple-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">دسته‌بندی موضوعی</span>
                    </div>
                    <p className="font-extrabold text-slate-800 text-lg">{lastResult.ai_category || 'عمومی'}</p>
                  </div>
                  
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:border-teal-100 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <AlignLeft className="w-5 h-5 text-teal-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">خلاصه تحلیل</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed line-clamp-3">{lastResult.summary || 'خلاصه‌ای در دسترس نیست.'}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};