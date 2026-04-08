import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Mail, Lock, Shield, Activity, Fingerprint, ScanLine, LayoutDashboard, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ورود رسمی (فعلاً فقط فرم آن وجود دارد)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'خطا در احراز هویت. دسترسی مسدود است.');
    } finally {
      setLoading(false);
    }
  };

  // ورود سریع با قابلیت تعیین نقش (برای فاز توسعه)
  const handleQuickLogin = async (role: 'admin' | 'observer') => {
    setLoading(true);
    setError(null);
    try {
      // ذخیره نقش انتخابی در حافظه مرورگر تا هوک useAuth متوجه آن شود
      localStorage.setItem('test_role', role);
      
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    } catch (err: any) {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#F8FAFC] font-sans selection:bg-indigo-500/30 overflow-hidden" dir="rtl">
      
      {/* پترن و گرافیک پس‌زمینه */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMSkiLz48L3N2Zz4=')] opacity-60"></div>
      </div>

      <div className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in py-12">
        
        {/* هدر کوچک بالای فرم */}
        <div className="mb-8 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-white shadow-xl shadow-indigo-500/10 border border-slate-100 mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[1.25rem]"></div>
            <Activity className="w-8 h-8 text-indigo-600 relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">SocialPulse</h1>
          <p className="text-slate-500 font-medium tracking-wide">درگاه امن یکپارچه سازمانی</p>
        </div>

        {/* بدنه اصلی فرم */}
        <div className="max-w-[420px] w-full bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white animate-slide-up" style={{ animationDelay: '0.2s' }}>
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
              <Shield className="w-5 h-5 shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          {/* فرم لاگین اصلی (رسمی) */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider ml-1">پست الکترونیک</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-left outline-none font-medium"
                  placeholder="name@organization.ir"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">رمز عبور</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-left tracking-widest outline-none font-medium"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-4 rounded-2xl text-white font-bold bg-slate-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-lg shadow-slate-900/20 transition-all disabled:opacity-70 group mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ورود امن'}
            </button>
          </form>

          {/* جداکننده */}
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">دسترسی‌های توسعه</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* دکمه‌های ورود سریع (Development Mode) */}
          <div className="space-y-3">
            <button
              onClick={() => handleQuickLogin('admin')}
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-between py-3.5 px-5 rounded-2xl text-indigo-700 font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                ورود به داشبورد راهبر
              </div>
              <ArrowLeft className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => handleQuickLogin('observer')}
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-between py-3.5 px-5 rounded-2xl text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <ScanLine className="w-5 h-5 text-emerald-500" />
                ورود به پنل رصدگر
              </div>
              <ArrowLeft className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
            </button>
          </div>
          
        </div>

        {/* فوتر */}
        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 opacity-60" />
            سیستم مانیتورینگ داخلی - دسترسی فقط برای پرسنل مجاز
          </p>
        </div>

      </div>
    </div>
  );
};