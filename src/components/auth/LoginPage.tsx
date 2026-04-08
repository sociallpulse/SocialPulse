import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Mail, Lock, Shield, Activity, Fingerprint, ChevronLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('ایمیل یا رمز عبور اشتباه است یا دسترسی مسدود می‌باشد.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-900 font-sans selection:bg-purple-500/30 overflow-hidden" dir="rtl">
      
      {/* بخش راست: فرم لاگین */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-6 sm:px-12 lg:px-20 bg-white relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.1)] animate-fade-in min-h-screen lg:min-h-0">
        <div className="max-w-md w-full mx-auto animate-slide-up">
          
          <div className="mb-10 text-center lg:text-right">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-500/30 mb-6">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">ورود به پلتفرم</h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">سامانه هوشمند رصد و تحلیل الگوهای رفتاری SocialPulse</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm font-medium flex items-center gap-3 animate-fade-in">
                <Shield className="w-5 h-5 shrink-0" /> 
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">پست الکترونیک سازمانی</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 sm:py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all text-left text-sm sm:text-base outline-none"
                  placeholder="admin@socialpulse.ir"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-slate-700">رمز عبور</label>
                <a href="#" className="text-xs font-bold text-purple-600 hover:text-purple-500 transition-colors">فراموشی رمز؟</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 sm:py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all text-left tracking-widest text-sm sm:text-base outline-none"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-8 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  احراز هویت و ورود
                  <ChevronLeft className="w-5 h-5 mr-2 opacity-70 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              <Fingerprint className="w-4 h-4 inline-block ml-1 opacity-50" />
              دسترسی به این سامانه فقط برای پرسنل مجاز است.<br/>تمامی فعالیت‌ها رمزنگاری و ثبت می‌شود.
            </p>
          </div>
        </div>
      </div>

      {/* بخش چپ: تصویر و گرادیان تزئینی (فقط در دسکتاپ) */}
      <div className="hidden lg:flex w-7/12 relative bg-slate-900 items-center justify-center overflow-hidden">
        {/* افکت‌های نوری پس‌زمینه */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }}></div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[3rem] p-16 max-w-xl text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Activity className="w-20 h-20 text-purple-400 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]" />
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">هوش مصنوعی در خدمت<br/>تحلیل رفتار اجتماعی</h2>
          <p className="text-lg text-slate-300 leading-relaxed font-medium">
            با استفاده از قدرت موتور پردازشگر Gemini، اسکرین‌شات‌ها و داده‌های خام را در کسری از ثانیه به بینش‌های ساختاریافته تبدیل کنید.
          </p>
        </div>

        {/* پترن نقطه‌ای پس‌زمینه */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-40"></div>
      </div>
    </div>
  );
};