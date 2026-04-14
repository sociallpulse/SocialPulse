import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Upload, CheckCircle, AlertCircle, LogOut, ScanLine, FileImage, 
  Activity, Clock, Loader2, CheckCircle2, AlertOctagon, RefreshCw, 
  User, X, Mail, Hash, Phone, Lock, Save 
} from 'lucide-react';
import { useSubmissions } from '../../hooks/useSubmissions';
import type { Database } from '../../types/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];

export const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [myHistory, setMyHistory] = useState<Submission[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // وضعیت‌های مربوط به پنل حساب کاربری
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    email: '',
    fullName: '',
    phone: '',
    personnelCode: '',
  });
  const [newPassword, setNewPassword] = useState('');

  const { uploadAndProcessMultiple, isUploading, error, progress } = useSubmissions();
  
  // ۱. دریافت آیدی و اطلاعات متادیتا کاربر
  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      if (data.session?.user) {
         setUserId(data.session.user.id);
         setProfileData({
           email: data.session.user.email || '',
           fullName: data.session.user.user_metadata?.full_name || '',
           phone: data.session.user.user_metadata?.phone_number || '',
           personnelCode: data.session.user.user_metadata?.personnel_code || 'ثبت نشده'
         });
      }
    });
  }, []);

  // ۲. دریافت تاریخچه و اتصال زنده
  const fetchMyHistory = async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('observer_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setMyHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchMyHistory();

    const subscription = supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions', filter: `observer_id=eq.${userId}` }, () => {
        fetchMyHistory(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [userId]);

  // آپدیت اطلاعات حساب کاربری
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const updates: any = {
        data: {
          full_name: profileData.fullName,
          phone_number: profileData.phone
        }
      };

      if (newPassword) {
        if (newPassword.length < 6) throw new Error('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
        updates.password = newPassword;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      setProfileMsg({ type: 'success', text: 'اطلاعات حساب با موفقیت بروزرسانی شد.' });
      setNewPassword(''); // خالی کردن رمز بعد از موفقیت
      
      // پاک کردن پیام موفقیت بعد از ۳ ثانیه
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // هندلرهای آپلود
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
      setTimeout(() => setUploadSuccess(false), 5000);
    }
  };

  const renderStatusBadge = (status: string | null) => {
    switch(status) {
      case 'completed': return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5"/> نهایی شد</span>;
      case 'processing': return <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100"><Loader2 className="w-3.5 h-3.5 animate-spin"/> در حال تحلیل</span>;
      case 'pending': return <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-bold border border-amber-100"><Clock className="w-3.5 h-3.5"/> در صف پردازش</span>;
      case 'failed': return <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-lg text-xs font-bold border border-red-100"><AlertOctagon className="w-3.5 h-3.5"/> خطای سرور</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-200 pb-20 sm:pb-8" dir="rtl">
      
      {/* هدر */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 shadow-sm px-4">
        <div className="max-w-4xl mx-auto h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <ScanLine className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">SocialPulse</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setIsProfileOpen(true)} 
              className="flex items-center gap-2 p-2 px-3 sm:px-4 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 active:scale-95 transition-all border border-indigo-100"
            >
              <span className="text-sm font-bold hidden sm:block">حساب کاربری</span>
              <User className="w-5 h-5" />
            </button>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="flex items-center gap-2 p-2 px-3 sm:px-4 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 transition-all"
            >
              <span className="text-sm font-bold hidden sm:block">خروج</span>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* مدال (پاپ‌آپ) حساب کاربری */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> پروفایل من
              </h2>
              <button onClick={() => setIsProfileOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg shadow-sm border border-slate-200 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
              
              {/* پیام خطا یا موفقیت */}
              {profileMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                  {profileMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {profileMsg.text}
                </div>
              )}

              {/* فیلدهای قفل شده (Read-only) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">شناسه سازمانی (غیرقابل تغییر)</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={profileData.personnelCode} disabled className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-2.5 pr-9 pl-3 text-xs font-bold font-mono text-left cursor-not-allowed" dir="ltr" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">ایمیل (غیرقابل تغییر)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={profileData.email} disabled className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-2.5 pr-9 pl-3 text-xs font-bold font-mono text-left cursor-not-allowed truncate" dir="ltr" />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 border-dashed" />

              {/* فیلدهای قابل تغییر */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-600 ml-1">نام و نام خانوادگی</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl py-3 pr-9 pl-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-600 ml-1">شماره تماس</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl py-3 pr-9 pl-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-left" dir="ltr" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-600 ml-1 flex justify-between">
                  <span>رمز عبور جدید (اختیاری)</span>
                  <span className="text-slate-400 font-normal">خالی بگذارید تا تغییر نکند</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••" className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl py-3 pr-9 pl-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-left" dir="ltr" />
                </div>
              </div>

              <button type="submit" disabled={isUpdatingProfile} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70">
                {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> ذخیره تغییرات</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12 animate-fade-in">
        
        {/* بخش آپلود */}
        <section className="max-w-2xl mx-auto">
          <div className="text-center space-y-2 sm:space-y-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">تحلیل هوشمند رصد</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold max-w-sm mx-auto">
              ارسال سریع اسکرین‌شات‌ها برای پردازش متنی و یافتن الگو در پس‌زمینه
            </p>
          </div>

          {!isUploading && !uploadSuccess && (
            <div 
              className={`relative border-2 border-dashed rounded-[2.5rem] p-8 sm:p-12 text-center transition-all shadow-inner overflow-hidden cursor-pointer
                ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-200 bg-white hover:border-indigo-400'} `}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <input type="file" accept="image/*" multiple onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" disabled={isUploading} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-6 bg-slate-50 text-slate-400 rounded-3xl border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <FileImage className="w-10 h-10" />
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
                 <p className="text-xs text-slate-500 font-bold mt-2">ارسال فایل {progress.current} از {progress.total}</p>
                 <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                   <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                 </div>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-8 text-center space-y-4 shadow-sm animate-fade-in">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-black text-emerald-800">با موفقیت در صف قرار گرفت</h3>
              <p className="text-xs font-bold text-emerald-600/80 leading-relaxed max-w-sm mx-auto">
                می‌توانید صفحه را ببندید یا در پایین صفحه وضعیت زنده تحلیل‌ها را مشاهده کنید.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-2xl flex items-start gap-3 border border-red-100 animate-fade-in mt-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}
        </section>

        {/* بخش تاریخچه کاربری */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-10 relative z-10">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
             <div className="flex items-center gap-3">
               <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                 <Activity className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-800">تاریخچه رصدهای من</h3>
                 <p className="text-xs text-slate-400 font-bold mt-1">بروزرسانی زنده (Real-time)</p>
               </div>
             </div>
             <button onClick={fetchMyHistory} className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
               <RefreshCw className={`w-5 h-5 ${loadingHistory ? 'animate-spin' : ''}`} />
             </button>
          </div>

          <div className="space-y-4">
            {loadingHistory ? (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
              </div>
            ) : myHistory.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400 font-bold">هنوز هیچ سندی ارسال نکرده‌اید.</p>
              </div>
            ) : (
              myHistory.map((item) => (
                <div key={item.id} className="border border-slate-100 rounded-2xl p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-start group">
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                          ID: {item.id.slice(0, 8)}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          {new Date(item.created_at || '').toLocaleDateString('fa-IR', { hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      {renderStatusBadge(item.status)}
                    </div>

                    {item.status === 'completed' ? (
                      <div className="space-y-2 mt-3">
                        <div className="flex gap-2 mb-2">
                           {item.ai_category && <span className="text-[10px] bg-purple-50 text-purple-600 font-black px-2.5 py-1 rounded-lg border border-purple-100">{item.ai_category}</span>}
                        </div>
                        <p className="text-sm font-black text-slate-800 leading-relaxed">
                          {item.summary}
                        </p>
                        {item.extracted_text && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 mt-3 shadow-inner relative">
                             <p className="text-xs text-slate-500 leading-loose line-clamp-2 hover:line-clamp-none transition-all">
                               « {item.extracted_text} »
                             </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-2 text-xs text-slate-400 font-bold flex items-center gap-2">
                         <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                         </span>
                         در انتظار پاسخ از هسته هوش مصنوعی...
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
};