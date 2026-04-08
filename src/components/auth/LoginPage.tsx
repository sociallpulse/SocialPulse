import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Mail, Lock, Shield, Activity, Fingerprint, ChevronLeft, UserCircle2, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [loginMode, setLoginMode] = useState<'observer' | 'admin'>('observer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ورود با ایمیل و رمز (برای مدیران)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('ایمیل یا رمز عبور اشتباه است یا دسترسی مسدود می‌باشد.');
    setLoading(false);
  };

  // ورود سریع و بدون رمز (برای رصدگران)
  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) setError('خطا در ایجاد نشست امن. لطفاً دوباره تلاش کنید.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-900 font-sans selection:bg-purple-500/30 overflow-hidden" dir="rtl">
      
      {/* بخش راست: فرم لاگین */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-6 sm:px-12 lg:px-20 bg-white relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.1)] animate-fade-in min-h-screen lg:min-h-0">
        <div className="max-w-md w-full mx-auto animate-slide-up">
          
          <div className="mb-8 text-center lg:text-right">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-500/30 mb-6">
              <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">SocialPulse AI</h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">پلتفرم هوشمند رصد و تحلیل محتوای شبکه‌های اجتماعی</p>
          </div>

          {/* انتخابگر نوع ورود (Tabs) */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setLoginMode('observer'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-xl transition-all ${
                loginMode === 'observer' 
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <UserCircle2 className="w-4 h-4" />
              ورود رصدگر
            </button>
            <button 
              onClick={() => { setLoginMode('admin'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-xl transition-all ${
                loginMode === 'admin' 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              ورود مدیریت
            </button>
          </div>

          {/* نمایش خطا */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm font-medium flex items-center gap-3 animate-fade-in">
              <Shield className="w-5 h-5 shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          {/* فرم ورود رصدگر (بدون رمز) */}
          {loginMode === 'observer' ? (
            <div className="space-y-6 animate-fade-in text-center lg:text-right">
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mb-6">
                <h3 className="text-purple-800 font-bold text-lg mb-2">آپلود سریع و ناشناس</h3>
                <p className="text-purple-600/80 text-sm leading-relaxed">
                  برای ارسال اسکرین‌شات‌ها و استفاده از هوش مصنوعی، نیازی به ثبت‌نام ندارید. با یک کلیک وارد محیط کاربری شوید.
                </p>
              </div>
              
              <button
                onClick={handleAnonymousLogin}
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-70 group active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 ml-2 opacity-80 group-hover:scale-110 transition-transform" />
                    ورود سریع به پلتفرم
                  </>
                )}
              </button>
            </div>
          ) : (
            /* فرم ورود مدیریت (با ایمیل و رمز) */
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">پست الکترونیک</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-left text-sm sm:text-base outline-none"
                    placeholder="admin@socialpulse.ir"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-700">رمز عبور</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-left tracking-widest text-sm sm:text-base outline-none"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-lg shadow-slate-900/20 transition-all disabled:opacity-70 group mt-8 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    احراز هویت مدیریت
                    <ChevronLeft className="w-5 h-5 mr-2 opacity-70 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                  </>
                )}
              </button>
            </form>
          )}
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              <Fingerprint className="w-4 h-4 inline-block ml-1 opacity-50" />
              تمامی فعالیت‌های کاربران در سیستم ثبت می‌گردد.
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
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">پلتفرم جامع تحلیل<br/>الگوهای شبکه‌های اجتماعی</h2>
          <p className="text-lg text-slate-300 leading-relaxed font-medium">
            بدون نیاز به ایجاد حساب کاربری، اسکرین‌شات‌ها را آپلود کنید و اجازه دهید هوش مصنوعی داده‌ها را برای تیم مدیریت استخراج کند.
          </p>
        </div>

        {/* پترن نقطه‌ای پس‌زمینه */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-40"></div>
      </div>
    </div>
  );
};