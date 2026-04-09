import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Loader2, CheckCircle, AlertCircle, LogOut, ScanLine, Tag, AlignLeft, UserCircle, RefreshCw, FileImage, Activity } from 'lucide-react';
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
  }, [userId]);

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
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-200 pb-20 sm:pb-0" dir="rtl">
      {/* هدر هوشمند */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm px-4">
        <div className="max-w-4xl mx-auto h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <ScanLine className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">SocialPulse</h1>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="p-2 text-slate-400 hover:text-red-600 active:scale-90 transition-all"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-16 space-y-8 animate-fade-in">
        
        <div className="text-center space-y-2 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">تحلیل هوشمند رصد</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold max-w-xs mx-auto">
            ارسال سریع اسکرین‌شات و استخراج متون با هوش مصنوعی
          </p>
        </div>

        {/* منطقه آپلود اختصاصی موبایل */}
        {!lastResult && !error && (
          <div 
            className={`relative border-2 border-dashed rounded-[2.5rem] p-8 sm:p-16 text-center transition-all shadow-inner overflow-hidden
              ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-200 bg-white hover:border-indigo-400'} 
              ${isUploading ? 'hidden' : 'block'}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            <input type="file" accept="image/*" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" disabled={isUploading} />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-6 bg-slate-50 text-slate-400 rounded-3xl border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <FileImage className="w-12 h-12" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800">انتخاب تصویر رصد</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">برای انتخاب کلیک کنید یا عکس را رها کنید</p>
              </div>
            </div>
          </div>
        )}

        {/* لودینگ */}
        {isUploading && previewUrl && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 text-center space-y-6 shadow-xl animate-fade-in">
            <div className="relative w-32 h-32 mx-auto">
               <img src={previewUrl} alt="Loading" className="w-full h-full object-cover rounded-3xl opacity-30 grayscale" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
               </div>
            </div>
            <div>
               <h3 className="text-lg font-black text-slate-800">در حال تحلیل با Gemini...</h3>
               <p className="text-xs text-slate-400 font-bold mt-1">شناسایی آیدی و استخراج متن اسناد</p>
            </div>
          </div>
        )}

        {/* نمایش نتیجه در موبایل */}
        {lastResult && previewUrl && !isUploading && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl animate-slide-up">
            <div className="bg-emerald-500 p-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-black">تحلیل نهایی شد</span>
              </div>
              <button onClick={resetUpload} className="bg-white/20 p-2 rounded-xl active:scale-90 transition-transform">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-6">
              <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                <img src={previewUrl} alt="Result" className="w-full h-full object-contain" />
              </div>
              
              <div className="space-y-4">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">آیدی شناسایی شده</p>
                  <p className="text-xl font-black text-indigo-700" dir="ltr">@{lastResult.profile_id}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">دسته بندی</p>
                    <p className="text-xs font-black text-slate-800">{lastResult.ai_category || 'عمومی'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">وضعیت</p>
                    <p className="text-xs font-black text-emerald-600">ثبت شد</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <AlignLeft className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase">خلاصه تحلیل هوشمند</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">{lastResult.summary}</p>
                </div>
              </div>

              <button onClick={resetUpload} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-lg">
                ارسال سند جدید
              </button>
            </div>
          </div>
        )}

      </main>

      {/* اعلان شناور موبایل */}
      <div className="fixed bottom-6 right-6 left-6 z-50 pointer-events-none">
        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between opacity-95 animate-slide-up pointer-events-auto">
           <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold">واحد پردازش فعال است</span>
           </div>
        </div>
      </div>

    </div>
  );
};