import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Image as ImageIcon, Activity, Search, ExternalLink, LogOut, TrendingUp, RefreshCw } from 'lucide-react';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['instagram_profiles']['Row'];

export const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ profiles: 0, submissions: 0 });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data } = await supabase.from('instagram_profiles').select('*').order('created_at', { ascending: false }).limit(20);
      setProfiles(data || []);
      
      const { count: pCount } = await supabase.from('instagram_profiles').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
      setStats({ profiles: pCount || 0, submissions: sCount || 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900 selection:bg-purple-200" dir="rtl">
      
      {/* هدر بالایی */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl shadow-md shadow-purple-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight hidden sm:block">
              مرکز فرماندهی SocialPulse
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
             <button 
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all disabled:opacity-50"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
            </button>
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in overflow-hidden">
        
        {/* بخش خوش‌آمدگویی */}
        <div className="mb-8 animate-slide-up flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ animationDelay: '0.1s' }}>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">خلاصه وضعیت سیستم</h2>
            <p className="text-slate-500 mt-2 font-medium">آمار لحظه‌ای از پردازش‌های هوش مصنوعی و شبکه‌های رصد شده.</p>
          </div>
        </div>

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {[
            { title: 'پروفایل‌های کشف شده', value: stats.profiles, icon: Users, color: 'from-blue-600 to-cyan-500', shadow: 'shadow-blue-500/20' },
            { title: 'اسناد تحلیل شده', value: stats.submissions, icon: ImageIcon, color: 'from-purple-600 to-indigo-600', shadow: 'shadow-purple-500/20' },
            { title: 'وضعیت پایداری API', value: '100%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all animate-slide-up flex items-center gap-5" style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}>
              <div className={`p-4 rounded-2xl bg-gradient-to-tr ${stat.color} shadow-lg ${stat.shadow} text-white shrink-0`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{loading ? '-' : stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* بخش جدول داده‌ها */}
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden animate-slide-up flex flex-col" style={{ animationDelay: '0.5s' }}>
          
          {/* هدر جدول */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <h3 className="text-xl font-extrabold text-slate-800">آخرین تارگت‌های شناسایی شده</h3>
            <div className="relative max-w-md w-full sm:w-auto">
              <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="جستجوی آیدی..." 
                className="w-full sm:w-80 pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* بدنه جدول (اسکرول افقی برای موبایل) */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] w-full">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-50/80 text-slate-500 text-xs font-black uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5">آیدی تارگت</th>
                    <th className="px-8 py-5">تاریخ ثبت در سیستم</th>
                    <th className="px-8 py-5">وضعیت هوش مصنوعی</th>
                    <th className="px-8 py-5 text-center">پرونده</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
                        <span className="text-slate-400 font-bold">در حال بارگذاری پایگاه داده...</span>
                      </td>
                    </tr>
                  ) : profiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-slate-400 font-medium">
                        هیچ تارگتی یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 font-black text-lg border border-slate-200 shadow-sm group-hover:border-purple-300 group-hover:text-purple-700 group-hover:bg-purple-50 transition-all">
                              {profile.handle.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-extrabold text-slate-700 text-base group-hover:text-purple-700 transition-colors" dir="ltr">@{profile.handle}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-500 font-bold">
                          {new Date(profile.created_at || '').toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            تحلیل شده
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 active:scale-95">
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};