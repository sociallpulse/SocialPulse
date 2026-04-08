import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Image as ImageIcon, Activity, Search, ExternalLink, LogOut, TrendingUp } from 'lucide-react';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['instagram_profiles']['Row'];

export const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ profiles: 0, submissions: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('instagram_profiles').select('*').order('created_at', { ascending: false }).limit(10);
        setProfiles(data || []);
        
        const { count: pCount } = await supabase.from('instagram_profiles').select('*', { count: 'exact', head: true });
        const { count: sCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
        setStats({ profiles: pCount || 0, submissions: sCount || 0 });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900" dir="rtl">
      
      {/* هدر بالایی شیشه‌ای */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-500 p-2 rounded-xl shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
              داشبورد مدیریت SocialPulse
            </h1>
          </div>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج از سیستم</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        {/* بخش خوش‌آمدگویی */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-slate-800">خلاصه وضعیت سیستم</h2>
          <p className="text-slate-500 mt-1">آمار لحظه‌ای از پردازش‌های هوش مصنوعی و پروفایل‌های رصد شده.</p>
        </div>

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'کل پروفایل‌ها', value: stats.profiles, icon: Users, color: 'from-blue-500 to-cyan-400' },
            { title: 'اسکرین‌شات‌های تحلیل شده', value: stats.submissions, icon: ImageIcon, color: 'from-purple-500 to-indigo-500' },
            { title: 'وضعیت پایداری API', value: '100%', icon: TrendingUp, color: 'from-emerald-400 to-teal-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all animate-slide-up flex items-center gap-5" style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}>
              <div className={`p-4 rounded-2xl bg-gradient-to-tr ${stat.color} shadow-lg text-white`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* جدول داده‌ها */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">آخرین پروفایل‌های کشف شده</h3>
            <div className="relative max-w-md w-full sm:w-auto">
              <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="جستجوی آیدی اینستاگرام..." 
                className="w-full sm:w-72 pl-4 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">آیدی پروفایل</th>
                  <th className="px-6 py-4">تاریخ کشف</th>
                  <th className="px-6 py-4">وضعیت تحلیل</th>
                  <th className="px-6 py-4 text-center">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-400 font-medium animate-pulse">در حال بارگذاری اطلاعات...</td></tr>
                ) : profiles.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-400">هیچ داده‌ای یافت نشد.</td></tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm group-hover:border-purple-200 group-hover:text-purple-600 transition-colors">
                            {profile.handle.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700 group-hover:text-purple-700 transition-colors" dir="ltr">@{profile.handle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {new Date(profile.created_at || '').toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          فعال
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500">
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

      </main>
    </div>
  );
};