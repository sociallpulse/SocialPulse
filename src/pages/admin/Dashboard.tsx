import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Image as ImageIcon, 
  Activity, 
  Search, 
  ExternalLink, 
  LogOut, 
  TrendingUp, 
  RefreshCw, 
  Loader2, 
  ShieldCheck, 
  Database, 
  AlertCircle,
  BarChart3,
  Filter,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import type { Database as DBTypes } from '../../types/database.types';

type Profile = DBTypes['public']['Tables']['instagram_profiles']['Row'];
type Submission = DBTypes['public']['Tables']['submissions']['Row'];

export const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'logs'>('overview');
  const [stats, setStats] = useState({ 
    profiles: 0, 
    submissions: 0, 
    observers: 0,
    aiAccuracy: 98.4 
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // دریافت پروفایل‌ها
      const { data: profileData } = await supabase
        .from('instagram_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setProfiles(profileData || []);

      // دریافت آخرین ارسال‌ها برای بخش Logs
      const { data: submissionData } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentSubmissions(submissionData || []);
      
      // دریافت آمار کلی
      const { count: pCount } = await supabase.from('instagram_profiles').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
      const { count: uCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
      
      setStats(prev => ({ 
        ...prev,
        profiles: pCount || 0, 
        submissions: sCount || 0,
        observers: uCount || 0
      }));
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100" dir="rtl">
      
      {/* هدر پیشرفته راهبر */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">پنل مدیریت عالی</h1>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">SocialPulse Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold">اتصال سرور: پایدار</span>
             </div>
             <button 
              onClick={fetchData}
              disabled={refreshing}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-indigo-100"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="w-px h-8 bg-slate-200 mx-1"></div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="hidden sm:inline">خروج از سیستم</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* منوی تب‌بندی داخلی */}
        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit">
          {[
            { id: 'overview', label: 'پیشخوان اصلی', icon: BarChart3 },
            { id: 'targets', label: 'مدیریت اهداف', icon: Users },
            { id: 'logs', label: 'گزارشات سیستمی', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* کارت‌های آماری پیشرفته */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'کل اهداف شناسایی شده', value: stats.profiles, icon: Users, trend: '+۱۲٪', color: 'indigo' },
                { title: 'تحلیل‌های انجام شده', value: stats.submissions, icon: ImageIcon, trend: '+۵.۴٪', color: 'purple' },
                { title: 'تعداد رصدگران فعال', value: stats.observers, icon: ShieldCheck, trend: 'پایدار', color: 'emerald' },
                { title: 'دقت پردازش هوش مصنوعی', value: `${stats.aiAccuracy}%`, icon: Activity, trend: '+۰.۲٪', color: 'blue' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1.5 h-full bg-${stat.color}-500 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-tighter">
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-400 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                    {loading ? <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg"></div> : stat.value}
                  </h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* بخش سمت راست: مانیتورینگ سیستم */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                      وضعیت اهداف ویژه (High Priority)
                    </h3>
                    <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">مشاهده کامل</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {profiles.slice(0, 5).map(profile => (
                      <div key={profile.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 border border-indigo-100">
                            {profile.handle.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800" dir="ltr">@{profile.handle}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">ثبت شده در: {new Date(profile.created_at!).toLocaleDateString('fa-IR')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="text-left">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Behavioral Score</p>
                              <div className="flex gap-1 mt-1">
                                {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= 3 ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>)}
                              </div>
                           </div>
                           <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Eye className="w-5 h-5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* بخش سمت چپ: آخرین فعالیت‌های رصدگران */}
              <div className="space-y-6">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
                  <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    پایش لحظه‌ای پردازش
                  </h3>
                  <div className="space-y-6 relative before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {recentSubmissions.map((sub) => (
                      <div key={sub.id} className="relative pr-10">
                        <div className="absolute right-0 top-1 w-8 h-8 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center z-10 shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        </div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{sub.summary || 'در حال استخراج محتوا...'}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">توسط رصدگر #{sub.observer_id?.slice(0, 5)} • ۲ دقیقه پیش</p>
                      </div>
                    ))}
                    {recentSubmissions.length === 0 && <p className="text-xs text-slate-400 text-center py-4">فعالیتی ثبت نشده است.</p>}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
                   <Settings className="absolute -bottom-4 -left-4 w-32 h-32 text-white/5 rotate-12" />
                   <h4 className="font-bold mb-2">گزارش‌گیری تخصصی</h4>
                   <p className="text-xs text-slate-400 leading-relaxed mb-4">دریافت خروجی PDF و Excel از تمام تحلیل‌های رفتاری دوره اخیر.</p>
                   <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all">
                     <Download className="w-4 h-4" />
                     خروجی گزارش جامع
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'targets' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">پایگاه داده اهداف</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">مدیریت و مشاهده جزئیات پروفایل‌های شناسایی شده توسط هوش مصنوعی.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="جستجوی آیدی یا کلمات کلیدی..." 
                    className="w-full sm:w-80 pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <button className="p-3.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">اطلاعات تارگت</th>
                    <th className="px-8 py-5">آخرین پایش</th>
                    <th className="px-8 py-5">شاخص حساسیت</th>
                    <th className="px-8 py-5">وضعیت تحلیل</th>
                    <th className="px-8 py-5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-20">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                        <span className="text-slate-400 font-bold">در حال بازیابی اطلاعات امنیتی...</span>
                      </td>
                    </tr>
                  ) : profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-lg border border-slate-200 shadow-sm group-hover:from-indigo-50 group-hover:to-indigo-100 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-all">
                            {profile.handle.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-slate-800 text-base group-hover:text-indigo-700 transition-colors" dir="ltr">@{profile.handle}</span>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">ID: {profile.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600 font-bold">
                        {new Date(profile.created_at!).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[80px] overflow-hidden">
                            <div className="h-full bg-indigo-500 w-2/3"></div>
                          </div>
                          <span className="text-xs font-black text-slate-700">۶۵٪</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                          <Activity className="w-3.5 h-3.5" />
                          فعال در پایش
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* فوتر جدول (Pagination Mock) */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
               <p className="text-xs font-bold text-slate-400">نمایش ۱۰ مورد از مجموع {stats.profiles} هدف ثبت شده</p>
               <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 disabled:opacity-50" disabled>قبلی</button>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50">بعدی</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-12 text-center space-y-4 animate-fade-in">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="w-10 h-10 text-indigo-600" />
             </div>
             <h3 className="text-xl font-black text-slate-800">گزارشات عمیق سیستمی</h3>
             <p className="text-slate-500 max-w-md mx-auto text-sm font-medium leading-relaxed">این بخش شامل لیست تمام فراخوانی‌های هوش مصنوعی، خطاهای سروری و فعالیت‌های دقیق رصدگران است که به زودی در نسخه آینده در دسترس قرار خواهد گرفت.</p>
             <div className="pt-6">
                <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">درخواست گزارش آرشیوی</button>
             </div>
          </div>
        )}

      </main>

      {/* اعلان‌های شناور پایین صفحه (برای حس حرفه‌ای‌تر) */}
      <div className="fixed bottom-8 left-8 flex flex-col gap-3 z-50">
         <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
               <AlertCircle className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase">System Status</p>
               <p className="text-xs font-bold">هوش مصنوعی Gemini در وضعیت بهینه است.</p>
            </div>
         </div>
      </div>

    </div>
  );
};