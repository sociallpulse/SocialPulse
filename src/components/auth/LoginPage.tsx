import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Mail, Lock, Shield, Activity, Fingerprint, Eye, EyeOff, UserPlus, LogIn, KeyRound, CheckCircle2, User, Phone } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ترجمه و بومی‌سازی خطاهای رایج سوپابیس به فارسی
  const translateError = (message: string) => {
    if (message.includes('Invalid login credentials')) return 'ایمیل یا رمز عبور اشتباه است.';
    if (message.includes('User already registered')) return 'این ایمیل قبلاً در سیستم ثبت شده است.';
    if (message.includes('Password should be at least')) return 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
    if (message.includes('Email rate limit exceeded')) return 'درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.';
    if (message.includes('Email not confirmed')) return 'لطفاً ابتدا ایمیل خود را از طریق لینک ارسال شده تایید کنید.';
    return 'خطای سیستمی رخ داده است. لطفاً دوباره تلاش کنید.';
  };

  // تغییر حالت فرم و پاکسازی داده‌ها
  const toggleMode = (signupMode: boolean) => {
    setIsSignUp(signupMode);
    setError(null);
    setSuccess(null);
    if (!signupMode) {
      setFullName('');
      setPhone('');
    }
  };

  // مدیریت فرم (ورود یا ثبت‌نام)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // اعتبارسنجی فرم
    if (!email || !password) {
      setError('لطفاً ایمیل و رمز عبور را به درستی وارد کنید.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('رمز عبور باید حداقل شامل ۶ کاراکتر باشد.');
      setLoading(false);
      return;
    }
    if (isSignUp && (!fullName.trim() || !phone.trim())) {
      setError('لطفاً نام کامل و شماره تماس سازمانی خود را وارد کنید.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // فرآیند ثبت‌نام کاربر جدید به همراه متادیتا (نام و شماره تلفن)
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              phone_number: phone
            }
          }
        });
        if (error) throw error;
        setSuccess('ثبت‌نام با موفقیت انجام شد! صندوق ایمیل خود را برای تایید حساب بررسی کنید.');
        // در صورت موفقیت، فرم را به حالت لاگین برمی‌گردانیم
        setIsSignUp(false);
        setPassword('');
        setFullName('');
        setPhone('');
      } else {
        // فرآیند ورود کاربر موجود
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  // مدیریت فراموشی رمز عبور
  const handleResetPassword = async () => {
    if (!email) {
      setError('برای بازیابی رمز عبور، ابتدا ایمیل خود را در کادر بالا وارد کنید.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSuccess('لینک بازیابی رمز عبور با موفقیت به ایمیل شما ارسال شد.');
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#F8FAFC] font-sans selection:bg-indigo-500/30 overflow-hidden" dir="rtl">
      
      {/* پترن و گرافیک پس‌زمینه */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[100px] transition-all duration-1000"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMSkiLz48L3N2Zz4=')] opacity-60"></div>
      </div>

      <div className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 py-12 h-screen overflow-y-auto custom-scrollbar">
        
        {/* هدر بالای فرم */}
        <div className="mb-8 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-white shadow-xl shadow-indigo-500/10 border border-slate-100 mb-6 relative group cursor-pointer transition-transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[1.25rem] group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-colors"></div>
            <Activity className="w-8 h-8 text-indigo-600 relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">SocialPulse AI</h1>
          <p className="text-slate-500 font-medium tracking-wide text-sm">درگاه امن و یکپارچه سازمانی</p>
        </div>

        {/* بدنه اصلی فرم */}
        <div className="max-w-[420px] w-full bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white animate-slide-up transition-all duration-500" style={{ animationDelay: '0.2s' }}>
          
          {/* تب‌های تغییر حالت فرم */}
          <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-8 border border-slate-200/50">
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                !isSignUp ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LogIn className="w-4 h-4" /> ورود
            </button>
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isSignUp ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" /> ایجاد حساب
            </button>
          </div>

          {/* پیام‌های وضعیت (خطا و موفقیت) */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm font-bold flex items-start gap-3 animate-fade-in">
              <Shield className="w-5 h-5 shrink-0 mt-0.5" /> 
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold flex items-start gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> 
              <span className="leading-relaxed">{success}</span>
            </div>
          )}

          {/* فرم اصلی */}
          <form onSubmit={handleAuth} className="space-y-5">
            
            {/* فیلدهای اختصاصی ثبت‌نام */}
            {isSignUp && (
              <>
                <div className="space-y-2 animate-fade-in">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">نام و نام خانوادگی</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required={isSignUp}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-left outline-none font-medium placeholder:text-slate-400 text-sm text-right"
                      placeholder="مثال: علی احمدی"
                    />
                  </div>
                </div>

                <div className="space-y-2 animate-fade-in">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">شماره تماس</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      required={isSignUp}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-left outline-none font-medium placeholder:text-slate-400 text-sm"
                      placeholder="09123456789"
                      dir="ltr"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">پست الکترونیک سازمانی</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-left outline-none font-medium placeholder:text-slate-400 text-sm"
                  placeholder="name@organization.ir"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">رمز عبور امنیتی</label>
                {!isSignUp && (
                  <button 
                    type="button" 
                    onClick={handleResetPassword}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" /> بازیابی رمز
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-3.5 pr-12 pl-12 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-left tracking-widest outline-none font-medium placeholder:text-slate-400 placeholder:tracking-normal text-sm"
                  placeholder="حداقل ۶ کاراکتر"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-white font-bold bg-slate-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-lg shadow-slate-900/20 transition-all disabled:opacity-70 group mt-8"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isSignUp ? 'ثبت و تایید اطلاعات' : 'ورود امن به پنل'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* فوتر کپی‌رایت / لاگ‌سیس */}
        <div className="mt-8 text-center animate-fade-in pb-8" style={{ animationDelay: '0.4s' }}>
          <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider">
            <Fingerprint className="w-3.5 h-3.5 opacity-60" />
            System Authentication & Verification Log
          </p>
        </div>

      </div>
    </div>
  );
};