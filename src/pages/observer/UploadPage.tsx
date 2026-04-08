import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Loader2, CheckCircle, AlertCircle, LogOut, ScanLine, Tag, AlignLeft, UserCircle } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-200" dir="rtl">
      {/* هدر ساده رصدگر */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-800">پنل رصدگر پلتفرم</h1>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-slate-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
        
        <div className="text-center space-y-3 animate-slide-up">
          <h2 className="text-3xl font-extrabold text-slate-800">ارسال سند و اسکرین‌شات جدید</h2>
          <p className="text-slate-500 font-medium">تصویر پست یا استوری را آپلود کنید تا بلافاصله توسط هوش مصنوعی پردازش شود.</p>
        </div>

        {/* منطقه دراپ زون */}
        <div 
          className={`relative group overflow-hidden border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 ease-out animate-slide-up shadow-sm
            ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'} 
            ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
          style={{ animationDelay: '0.1s' }}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
          <input type="file" accept="image/*" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" disabled={isUploading} />
          
          <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
            <div className={`p-5 rounded-3xl transition-colors duration-300 ${dragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
              <Upload className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-700">تصویر را اینجا بکشید و رها کنید</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">یا برای انتخاب فایل کلیک کنید (حداکثر ۵ مگابایت)</p>
            </div>
          </div>
        </div>

        {/* وضعیت لودینگ */}
        {isUploading && (
          <div className="glass-panel rounded-2xl p-6 flex items-center justify-center gap-4 animate-fade-in">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-slate-700 font-bold">هوش مصنوعی Gemini در حال استخراج اطلاعات...</span>
          </div>
        )}

        {/* وضعیت ارور */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 animate-slide-up">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="text-red-800 font-bold text-lg mb-1">خطا در پردازش تصویر</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* نمایش نتیجه هوش مصنوعی */}
        {lastResult && previewUrl && !isUploading && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-4 flex items-center gap-3">
              <CheckCircle className="text-white w-6 h-6" />
              <span className="text-white font-bold text-lg">پردازش با موفقیت به پایان رسید</span>
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* پیش‌نمایش تصویر */}
              <div className="md:col-span-5 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/60 shadow-inner">
                <img src={previewUrl} alt="Preview" className="w-full object-contain max-h-[400px]" />
              </div>
              
              {/* نتایج آنالیز */}
              <div className="md:col-span-7 space-y-6">
                
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <UserCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">آیدی شناسایی شده</span>
                  </div>
                  <div className="inline-block bg-indigo-100 text-indigo-700 font-mono font-bold text-xl px-4 py-2 rounded-xl border border-indigo-200" dir="ltr">
                    @{lastResult.profile_id || 'ناشناخته'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Tag className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">دسته‌بندی موضوعی</span>
                    </div>
                    <p className="font-bold text-slate-800">{lastResult.ai_category || 'نامشخص'}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <AlignLeft className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">خلاصه تحلیل</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed line-clamp-2">{lastResult.summary}</p>
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