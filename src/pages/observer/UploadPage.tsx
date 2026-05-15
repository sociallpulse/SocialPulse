import React, { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Upload, CheckCircle, AlertCircle, LogOut, ScanLine, FileImage, Activity,
  Clock, Loader2, CheckCircle2, AlertOctagon, RefreshCw, User, X, Mail,
  Hash, Phone, Lock, Save,
} from 'lucide-react';
import { useSubmissions } from '../../hooks/useSubmissions';
import type { Database } from '../../types/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];

interface ProfileState {
  email: string;
  fullName: string;
  phone: string;
  personnelCode: string;
}

export const UploadPage: React.FC = () => {
  const [dragActive, setDragActive]       = useState(false);
  const [userId, setUserId]               = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [history, setHistory]             = useState<Submission[]>([]);
  const [loadingHist, setLoadingHist]     = useState(true);

  const [profileOpen, setProfileOpen]   = useState(false);
  const [updating, setUpdating]         = useState(false);
  const [profileMsg, setProfileMsg]     = useState({ type: '', text: '' });
  const [profile, setProfile]           = useState<ProfileState>({ email: '', fullName: '', phone: '', personnelCode: '' });
  const [newPassword, setNewPassword]   = useState('');

  const { uploadAndProcessMultiple, isUploading, error, progress } = useSubmissions();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // بارگذاری داده‌های کاربر
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (!u) return;
      setUserId(u.id);
      setProfile({
        email:         u.email ?? '',
        fullName:      u.user_metadata?.full_name ?? '',
        phone:         u.user_metadata?.phone_number ?? '',
        personnelCode: '',
      });

      // واکشی personnel_code از user_profiles
      supabase.from('user_profiles').select('personnel_code').eq('id', u.id).single()
        .then(({ data: pd }) => {
          if (pd) setProfile(prev => ({ ...prev, personnelCode: pd.personnel_code ?? '---' }));
        });
    });
  }, []);

  // واکشی تاریخچه
  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('submissions').select('*')
        .eq('observer_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setHistory(data);
    } catch (e) { console.error(e); }
    finally { setLoadingHist(false); }
  }, [userId]);

  // اشتراک Real-time
  useEffect(() => {
    if (!userId) return;
    fetchHistory();

    channelRef.current = supabase
      .channel(`obs-${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'submissions',
        filter: `observer_id=eq.${userId}`,
      }, fetchHistory)
      .subscribe();

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [userId, fetchHistory]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true); setProfileMsg({ type: '', text: '' });
    try {
      const updates: { data: { full_name: string; phone_number: string }; password?: string } = {
        data: { full_name: profile.fullName, phone_number: profile.phone },
      };
      if (newPassword) {
        if (newPassword.length < 6) throw new Error('رمز جدید باید حداقل ۶ کاراکتر باشد.');
        updates.password = newPassword;
      }
      const { error: e } = await supabase.auth.updateUser(updates);
      if (e) throw e;

      // به‌روزرسانی جدول user_profiles
      await supabase.from('user_profiles')
        .update({ full_name: profile.fullName, phone_number: profile.phone })
        .eq('id', userId);

      setProfileMsg({ type: 'success', text: 'اطلاعات با موفقیت بروزرسانی شد.' });
      setNewPassword('');
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err: unknown) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'خطا' });
    } finally { setUpdating(false); }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files.length && userId) processFiles(Array.from(e.dataTransfer.files));
  }, [userId]);

  const processFiles = async (files: File[]) => {
    setUploadSuccess(false);
    const ok = await uploadAndProcessMultiple(files, userId);
    if (ok) { setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 5000); }
  };

  const badge = (status: string | null) => {
    const map: Record<string, React.ReactNode> = {
      completed: <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5"/> نهایی شد</span>,
      processing: <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100"><Loader2 className="w-3.5 h-3.5 animate-spin"/> در حال تحلیل</span>,
      pending: <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-bold border border-amber-100"><Clock className="w-3.5 h-3.5"/> در صف</span>,
      failed: <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-lg text-xs font-bold border border-red-100"><AlertOctagon className="w-3.5 h-3.5"/> خطا</span>,
    };
    return map[status ?? ''] ?? null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 sm:pb-8" dir="rtl">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 shadow-sm px-4">
        <div className="max-w-4xl mx-auto h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <ScanLine className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-800">SocialPulse</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 p-2 px-3 sm:px-4 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 border border-indigo-100 transition-all">
              <span className="text-sm font-bold hidden sm:block">حساب کاربری</span>
              <User className="w-5 h-5"/>
            </button>
            <button onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-2 p-2 px-3 sm:px-4 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
              <span className="text-sm font-bold hidden sm:block">خروج</span>
              <LogOut className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600"/> پروفایل من
              </h2>
              <button onClick={() => setProfileOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg shadow-sm border border-slate-200">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
              {profileMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                  {profileMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0"/> : <CheckCircle2 className="w-4 h-4 shrink-0"/>}
                  {profileMsg.text}
                </div>
              )}

              {/* فیلدهای Read-only */}
              <div className="grid grid-cols-2 gap-4">
                <ReadonlyField label="شناسه سازمانی (قفل)" icon={<Hash className="w-4 h-4"/>} value={profile.personnelCode} dir="ltr"/>
                <ReadonlyField label="ایمیل (قفل)" icon={<Mail className="w-4 h-4"/>} value={profile.email} dir="ltr"/>
              </div>

              <hr className="border-slate-100 border-dashed"/>

              {/* فیلدهای قابل ویرایش */}
              <EditField label="نام و نام خانوادگی" icon={<User className="w-4 h-4"/>}
                value={profile.fullName} onChange={v => setProfile(p => ({ ...p, fullName: v }))}/>
              <EditField label="شماره تماس" icon={<Phone className="w-4 h-4"/>}
                value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} dir="ltr" type="tel"/>
              <EditField label="رمز عبور جدید (اختیاری)" icon={<Lock className="w-4 h-4"/>}
                value={newPassword} onChange={setNewPassword} placeholder="خالی = بدون تغییر" dir="ltr" type="password"/>

              <button type="submit" disabled={updating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {updating ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5"/> ذخیره تغییرات</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12">

        {/* Upload Zone */}
        <section className="max-w-2xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">تحلیل هوشمند رصد</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold max-w-sm mx-auto">
              ارسال اسکرین‌شات برای پردازش متنی در پس‌زمینه توسط Gemini AI
            </p>
          </div>

          {!isUploading && !uploadSuccess && (
            <label className={`relative border-2 border-dashed rounded-[2.5rem] p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 shadow-inner overflow-hidden
              ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-200 bg-white hover:border-indigo-400'}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
              <input type="file" accept="image/*" multiple className="sr-only"
                onChange={e => { if (e.target.files?.length && userId) processFiles(Array.from(e.target.files)); }} disabled={isUploading}/>
              <div className="p-6 bg-slate-50 text-slate-400 rounded-3xl border border-slate-100">
                <FileImage className="w-10 h-10"/>
              </div>
              <div>
                <p className="text-lg font-black text-slate-800">انتخاب تصاویر رصد</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">کلیک کنید یا فایل‌ها را رها کنید</p>
              </div>
            </label>
          )}

          {isUploading && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 text-center space-y-6 shadow-xl">
              <Upload className="w-8 h-8 text-indigo-600 animate-bounce mx-auto"/>
              <div>
                <h3 className="text-lg font-black text-slate-800">در حال ارسال امن...</h3>
                <p className="text-xs text-slate-500 font-bold mt-2">فایل {progress.current} از {progress.total}</p>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}/>
                </div>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-8 text-center space-y-4">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto"/>
              <h3 className="text-lg font-black text-emerald-800">با موفقیت در صف قرار گرفت</h3>
              <p className="text-xs font-bold text-emerald-600/80">وضعیت پردازش را در جدول زیر دنبال کنید.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-2xl flex items-start gap-3 border border-red-100 mt-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/>
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}
        </section>

        {/* History */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Activity className="w-5 h-5"/>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">تاریخچه رصدهای من</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">بروزرسانی زنده (Real-time)</p>
              </div>
            </div>
            <button onClick={fetchHistory} className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200">
              <RefreshCw className={`w-5 h-5 ${loadingHist ? 'animate-spin' : ''}`}/>
            </button>
          </div>

          <div className="space-y-4">
            {loadingHist ? (
              <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto"/></div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center"><p className="text-sm text-slate-400 font-bold">هنوز هیچ سندی ارسال نشده.</p></div>
            ) : history.map(item => (
              <div key={item.id} className="border border-slate-100 rounded-2xl p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">
                      ID: {item.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {new Date(item.created_at ?? '').toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {badge(item.status)}
                </div>

                {item.status === 'completed' ? (
                  <div className="space-y-2">
                    {item.ai_category && (
                      <span className="text-[10px] bg-purple-50 text-purple-600 font-black px-2.5 py-1 rounded-lg border border-purple-100">{item.ai_category}</span>
                    )}
                    <p className="text-sm font-black text-slate-800 leading-relaxed">{item.summary}</p>
                    {item.extracted_text && (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-inner">
                        <p className="text-xs text-slate-500 leading-loose line-clamp-3">« {item.extracted_text} »</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-bold flex items-center gap-2 py-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"/>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"/>
                    </span>
                    در انتظار پاسخ هسته هوش مصنوعی...
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// ── Sub-components ──────────────────────────────
const ReadonlyField: React.FC<{ label: string; icon: React.ReactNode; value: string; dir?: string }> =
  ({ label, icon, value, dir }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input type="text" value={value} disabled dir={dir}
        className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-2.5 pr-9 pl-3 text-xs font-bold font-mono cursor-not-allowed truncate"/>
    </div>
  </div>
);

const EditField: React.FC<{ label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; dir?: string; type?: string }> =
  ({ label, icon, value, onChange, placeholder, dir, type = 'text' }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-extrabold text-slate-600">{label}</label>
    <div className="relative">
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} dir={dir}
        className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl py-3 pr-9 pl-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"/>
    </div>
  </div>
);
