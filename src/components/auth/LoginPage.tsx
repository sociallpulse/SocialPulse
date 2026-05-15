import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Loader2, Mail, Lock, Shield, Activity, Fingerprint,
  Eye, EyeOff, UserPlus, LogIn, KeyRound, CheckCircle2, User, Phone,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp]         = useState(false);
  const [fullName, setFullName]         = useState('');
  const [phone, setPhone]               = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPwd, setShowPwd]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);

  const translateError = (msg: string) => {
    if (msg.includes('Invalid login credentials'))   return 'ایمیل یا رمز عبور اشتباه است.';
    if (msg.includes('User already registered'))     return 'این ایمیل قبلاً ثبت شده است.';
    if (msg.includes('Password should be at least')) return 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
    if (msg.includes('Email rate limit exceeded'))   return 'درخواست بیش از حد. کمی صبر کنید.';
    if (msg.includes('Email not confirmed'))         return 'لطفاً ایمیل خود را تایید کنید.';
    return 'خطای سیستمی. دوباره تلاش کنید.';
  };

  const reset = (signup: boolean) => {
    setIsSignUp(signup); setError(null); setSuccess(null);
    if (!signup) { setFullName(''); setPhone(''); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);

    if (!email || !password)               { setError('ایمیل و رمز الزامی است.');          setLoading(false); return; }
    if (password.length < 6)               { setError('رمز باید حداقل ۶ کاراکتر باشد.');   setLoading(false); return; }
    if (isSignUp && (!fullName.trim() || !phone.trim())) {
      setError('نام و شماره تماس الزامی است.'); setLoading(false); return;
    }

    try {
      if (isSignUp) {
        // Personnel ID سمت سرور توسط DB Trigger تولید می‌شود
        const { error: e } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, phone_number: phone } },
        });
        if (e) throw e;
        setSuccess('ثبت‌نام موفق! صندوق ایمیل خود را برای تایید بررسی کنید.');
        setIsSignUp(false); setPassword(''); setFullName(''); setPhone('');
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
      }
    } catch (err: unknown) {
      setError(translateError(err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) { setError('ایمیل خود را وارد کنید.'); return; }
    setLoading(true);
    try {
      const { error: e } = await supabase.auth.resetPasswordForEmail(email);
      if (e) throw e;
      setSuccess('لینک بازیابی رمز ارسال شد.');
    } catch (err: unknown) {
      setError(translateError(err instanceof Error ? err.message : ''));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#F8FAFC] font-sans selection:bg-indigo-500/30 overflow-hidden" dir="rtl">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="w-full flex flex-col items-center justify-center px-4 relative z-10 py-12 overflow-y-auto">
        {/* Logo */}
        <div className="mb-8 text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-white shadow-xl border border-slate-100 mb-6">
            <Activity className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">SocialPulse AI</h1>
          <p className="text-slate-500 text-sm font-medium">درگاه امن سازمانی</p>
        </div>

        {/* Card */}
        <div className="max-w-[420px] w-full bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white animate-slide-up">

          {/* Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-8 border border-slate-200/50">
            {[{ label: 'ورود', icon: LogIn, val: false }, { label: 'ایجاد حساب', icon: UserPlus, val: true }].map(tab => (
              <button key={String(tab.val)} type="button" onClick={() => reset(tab.val)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isSignUp === tab.val ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error   && <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex gap-3 animate-fade-in"><Shield className="w-5 h-5 shrink-0 mt-0.5"/><span>{error}</span></div>}
          {success && <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold flex gap-3 animate-fade-in"><CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5"/><span>{success}</span></div>}

          <form onSubmit={handleAuth} className="space-y-5">

            {/* ثبت‌نام: نام + تلفن */}
            {isSignUp && (
              <>
                <Field label="نام و نام خانوادگی" icon={<User className="w-5 h-5"/>}>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="علی احمدی"
                    className="input-base text-right" />
                </Field>
                <Field label="شماره تماس" icon={<Phone className="w-5 h-5"/>}>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="09123456789" dir="ltr"
                    className="input-base" />
                </Field>
              </>
            )}

            <Field label="پست الکترونیک سازمانی" icon={<Mail className="w-5 h-5"/>}>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@organization.ir" dir="ltr"
                className="input-base" />
            </Field>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">رمز عبور</label>
                {!isSignUp && (
                  <button type="button" onClick={handleResetPassword}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <KeyRound className="w-3 h-3"/> بازیابی رمز
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 group-focus-within:text-indigo-600 pointer-events-none">
                  <Lock className="w-5 h-5"/>
                </div>
                <input type={showPwd ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر" dir="ltr"
                  className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-3.5 pr-12 pl-12 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white outline-none text-sm tracking-widest placeholder:tracking-normal transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors">
                  {showPwd ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold bg-slate-900 hover:bg-black shadow-lg shadow-slate-900/20 transition-all disabled:opacity-70 mt-8">
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin"/>
                : <>{isSignUp ? <UserPlus className="w-5 h-5"/> : <LogIn className="w-5 h-5"/>} {isSignUp ? 'ثبت و تایید اطلاعات' : 'ورود امن به پنل'}</>}
            </button>
          </form>
        </div>

        <p className="mt-8 text-[10px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
          <Fingerprint className="w-3.5 h-3.5 opacity-60"/> System Authentication Log
        </p>
      </div>

      <style>{`
        .input-base { display:block; width:100%; background:#f8fafc; border:1px solid #e2e8f0; color:#0f172a;
          border-radius:1rem; padding:0.875rem 3rem 0.875rem 1rem; font-size:0.875rem; outline:none; transition:all .15s; }
        .input-base:focus { box-shadow:0 0 0 2px rgba(99,102,241,0.5); border-color:#6366f1; background:#fff; }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-fade-in  { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </div>
  );
};

// ───────────────────────────────
const Field: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
        {icon}
      </div>
      {children}
    </div>
  </div>
);
