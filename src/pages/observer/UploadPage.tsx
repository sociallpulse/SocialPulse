import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Loader2, CheckCircle, AlertCircle, LogOut, ScanLine, FileImage, Activity } from 'lucide-react';
import { useSubmissions } from '../../hooks/useSubmissions';

export const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { uploadAndProcessMultiple, isUploading, error, progress } = useSubmissions();
  
  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      // هدایت به صفحه ورود در صورت نبود کاربر
      if (!data.session?.user) {
         window.location.reload();
         return;
      }
      setUserId(data.session.user.id);
    });
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && userId) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0 && userId) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setUploadSuccess(false);
    const success = await uploadAndProcessMultiple(files, userId);
    if (success) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000); // بازنشانی پیام موفقیت بعد از ۵ ثانیه
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-200 pb-20 sm:pb-0" dir="rtl">
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
            ارسال سریع اسکرین‌شات‌ها (حتی به صورت گروهی) برای پردازش در پس‌زمینه
          </p>
        </div>

        {!isUploading && !uploadSuccess && (
          <div 
            className={`relative border-2 border-dashed rounded-[2.5rem] p-8 sm:p-16 text-center transition-all shadow-inner overflow-hidden
              ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-200 bg-white hover:border-indigo-400'} `}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            {/* اضافه کردن multiple برای انتخاب چند عکس همزمان */}
            <input type="file" accept="image/*" multiple onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" disabled={isUploading} />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-6 bg-slate-50 text-slate-400 rounded-3xl border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <FileImage className="w-12 h-12" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800">انتخاب تصاویر رصد</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">برای انتخاب کلیک کنید یا عکس‌ها را رها کنید</p>
              </div>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 text-center space-y-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-center gap-4 text-indigo-600">
               <Upload className="w-8 h-8 animate-bounce" />
            </div>
            <div>
               <h3 className="text-lg font-black text-slate-800">در حال ارسال امن به سرور...</h3>
               <p className="text-xs text-slate-500 font-bold mt-2">
                 ارسال عکس {progress.current} از {progress.total}
               </p>
               <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                 <div 
                    className="h-full bg-indigo-600 transition-all duration-300" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                 ></div>
               </div>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-8 text-center space-y-4 shadow-sm animate-fade-in">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-black text-emerald-800">با موفقیت در صف پردازش قرار گرفت</h3>
            <p className="text-xs font-bold text-emerald-600/80 leading-relaxed max-w-sm mx-auto">
              شما می‌توانید صفحه را ببندید. هوش مصنوعی اطلاعات را تحلیل کرده و به صورت خودکار در سیستم ثبت خواهد کرد.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-2xl flex items-start gap-3 border border-red-100 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

      </main>

      <div className="fixed bottom-6 right-6 left-6 z-50 pointer-events-none">
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between opacity-95 pointer-events-auto">
           <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold">هسته پردازش فعال است</span>
           </div>
        </div>
      </div>
    </div>
  );
};