import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Image as ImageIcon, 
  Activity, 
  Search, 
  LogOut, 
  TrendingUp, 
  RefreshCw, 
  Loader2, 
  ShieldCheck, 
  BarChart3,
  Filter,
  Download,
  Eye,
  Settings,
  Bell,
  Cpu,
  BrainCircuit,
  Layers,
  MoreVertical,
  Zap,
  ShieldAlert,
  Server,
  Terminal,
  PieChart
} from 'lucide-react';
import type { Database as DBTypes } from '../../types/database.types';

type Profile = DBTypes['public']['Tables']['instagram_profiles']['Row'];
type Submission = DBTypes['public']['Tables']['submissions']['Row'];

export const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'intelligence' | 'team' | 'logs'>('overview');
  const [stats, setStats] = useState({ 
    profiles: 0, 
    submissions: 0, 
    observers: 0,
    aiAccuracy: 98.4,
    systemLoad: 12,
    activeAlerts: 0
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // دریافت پروفایل‌ها
      const { data: profileData } = await supabase
        .from('instagram_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setProfiles(profileData || []);

      // دریافت آخرین ارسال‌ها
      const { data: submissionData } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setRecentSubmissions(submissionData || []);
      
      // دریافت آمار واقعی
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 flex" dir="rtl">
      
      {/* سایدبار پیشرفته ناوبری */}
      <aside className="fixed right-0 top-0 h-full w-20 lg:w-72 bg-[#0F172A] z-50 text-white flex flex-col py-8 border-l border-white/5 shadow-2xl transition-all duration-500">
        <div className="px-8 mb-10 flex items-center gap-4">
          <div className="bg-indigo-500 p-2.5 rounded-2xl shadow-xl shadow-indigo-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-black tracking-tight leading-none text-white">SOCIAL PULSE</h2>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 block">Enterprise AI v2.0</span>
          </div>
        </div>

        <div className="px-4 space-y-1">
          <p className="text-[10px] font-black text-slate-500 px-4 mb-4 uppercase tracking-widest hidden lg:block">واحد مانیتورینگ</p>
          {[
            { id: 'overview', label: 'مرکز فرماندهی', icon: BarChart3 },
            { id: 'targets', label: 'بانک جامع اهداف', icon: Users },
            { id: 'intelligence', label: 'واحد هوش مصنوعی', icon: BrainCircuit },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? 'bg-gradient-to-l from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-bold hidden lg:block">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="px-4 mt-8 space-y-1">
          <p className="text-[10px] font-black text-slate-500 px-4 mb-4 uppercase tracking-widest hidden lg:block">مدیریت تیم</p>
          {[
            { id: 'team', label: 'نظارت بر رصدگران', icon: ShieldCheck },
            { id: 'logs', label: 'ترمینال فنی', icon: Terminal },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? 'bg-gradient-to-l from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-bold hidden lg:block">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="px-4 mt-auto">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="text-sm font-bold hidden lg:block">خروج از پروتکل</span>
          </button>
        </div>
      </aside>

      {/* محتوای اصلی داشبورد */}
      <main className="flex-1 lg:mr-72 mr-20 transition-all duration-500">
        
        {/* هدر هوشمند */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 h-24 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
             <div className="lg:hidden bg-indigo-500 p-2 rounded-xl">
               <Cpu className="w-5 h-5 text-white" />
             </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {activeTab === 'overview' && 'مرکز مدیریت و پایش استراتژیک'}
                {activeTab === 'targets' && 'بانک اطلاعاتی پروفایل‌های رصد شده'}
                {activeTab === 'intelligence' && 'واحد پردازش هوشمند Gemini'}
                {activeTab === 'team' && 'نظارت بر عملکرد تیم رصد'}
                {activeTab === 'logs' && 'سیستم گزارشات سیستمی (LOGS)'}
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-1">دسترسی سطح ۱: مدیریت کل سازمان</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2">
              <div className="flex flex-col items-start pr-4 border-l border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase">System Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-700">عملیاتی</span>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black text-slate-400 uppercase">Load Avg</span>
                <span className="text-xs font-bold text-slate-700">{stats.systemLoad}%</span>
              </div>
            </div>

            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm relative group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <button 
              onClick={fetchData}
              className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* کارت‌های آماری استراتژیک */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'کل بانک اهداف', value: stats.profiles, icon: Users, color: 'indigo', trend: 'رشد مداوم' },
                  { title: 'تحلیل‌های موفقیت‌آمیز', value: stats.submissions, icon: ImageIcon, color: 'emerald', trend: '+۵.۴٪' },
                  { title: 'پایداری هوش مصنوعی', value: `${stats.aiAccuracy}%`, icon: BrainCircuit, color: 'blue', trend: 'بهینه' },
                  { title: 'تعداد رصدگران فعال', value: stats.observers, icon: ShieldCheck, color: 'purple', trend: 'بر خط' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150`}></div>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 shadow-inner relative z-10`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100`}>
                        {stat.trend}
                      </span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-800 mb-1">{loading ? '...' : stat.value}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                  </div>
                ))}
              </div>

              {/* بخش گرافیکی و تحلیل روند */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* گراف حجم عملیات */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">حجم فعالیت واحد رصد (۷ روز اخیر)</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1 italic">نمودار توزیع زمانی اسناد پردازش شده</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="px-5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all">هفتگی</button>
                       <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20">ماهانه</button>
                    </div>
                  </div>
                  <div className="flex-1 p-10 flex flex-col justify-end min-h-[350px] bg-slate-50/30">
                    <div className="flex items-end justify-between h-48 gap-4 lg:gap-8">
                      {[35, 80, 50, 90, 70, 100, 65].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                          <div className="w-full bg-slate-200/50 rounded-2xl relative overflow-hidden h-full flex items-end">
                             <div 
                              style={{ height: `${h}%` }} 
                              className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 rounded-2xl group-hover:from-purple-600 group-hover:to-purple-400 transition-all duration-700 relative shadow-sm"
                             >
                               <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 font-bold shadow-xl border border-white/10">
                                  {h} مورد
                               </div>
                             </div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 mt-5 uppercase tracking-tighter">
                            {['شنبه', '۱شنبه', '۲شنبه', '۳شنبه', '۴شنبه', '۵شنبه', 'جمعه'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* پایش زنده و هشدارها */}
                <div className="space-y-6">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col h-full min-h-[400px]">
                     <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3">
                        <Layers className="w-6 h-6 text-indigo-500" />
                        آخرین وقایع سیستمی
                     </h3>
                     <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        {recentSubmissions.map((sub) => (
                          <div key={sub.id} className="flex gap-4 group">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                                <Activity className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                            </div>
                            <div className="flex-1 border-b border-slate-50 pb-4">
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-black text-slate-800">تحلیل #{(sub.id || '').slice(0, 6)}</p>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">هم‌اکنون</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-relaxed italic">
                                {sub.summary || 'در حال واکشی محتوا توسط موتور هوش مصنوعی...'}
                              </p>
                            </div>
                          </div>
                        ))}
                        {recentSubmissions.length === 0 && (
                          <div className="text-center py-16">
                            <Loader2 className="w-10 h-10 text-slate-200 animate-spin mx-auto mb-4" />
                            <p className="text-xs text-slate-400 font-black">در انتظار دریافت اولین ورودی رصد...</p>
                          </div>
                        )}
                     </div>
                     <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-black transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" /> مشاهده مرکز عملیات
                     </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'targets' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col">
              <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">بانک جامع اطلاعات اهداف</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">مدیریت و دسترسی به تاریخچه کامل تمام پروفایل‌های شناسایی شده در رصدها.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="جستجو در نام، آیدی یا تگ‌های رفتاری..." 
                      className="w-full sm:w-96 pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
                    />
                  </div>
                  <button className="p-4 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl hover:bg-white transition-all shadow-sm">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-6">مشخصات پروفایل</th>
                      <th className="px-10 py-6">تراکم رصد</th>
                      <th className="px-10 py-6">آخرین فعالیت</th>
                      <th className="px-10 py-6">شاخص اولویت</th>
                      <th className="px-10 py-6 text-center">عملیات مدیریت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-32">
                          <div className="relative inline-block">
                             <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                             <Server className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto" />
                          </div>
                          <span className="block mt-6 text-sm text-slate-400 font-black">در حال بازیابی دیتابیس اهداف از سرور...</span>
                        </td>
                      </tr>
                    ) : profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-2xl border border-slate-200 shadow-inner group-hover:from-indigo-600 group-hover:to-indigo-500 group-hover:text-white group-hover:rotate-3 transition-all duration-500">
                              {profile.handle.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-black text-slate-800 text-lg group-hover:text-indigo-700 transition-colors" dir="ltr">@{profile.handle}</span>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">ID: {profile.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                           <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full text-[11px] font-black text-indigo-700 border border-indigo-100 shadow-sm">
                              <ImageIcon className="w-4 h-4" />
                              {(Math.random() * 50 + 10).toFixed(0)} اسناد
                           </div>
                        </td>
                        <td className="px-10 py-7 text-sm text-slate-600 font-bold">
                          {new Date(profile.created_at || '').toLocaleDateString('fa-IR', { day: 'numeric', month: 'long' })}
                        </td>
                        <td className="px-10 py-7">
                           <div className="flex items-center gap-4">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[120px] overflow-hidden shadow-inner">
                                 <div className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" style={{ width: '75%' }}></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-900 uppercase">Critical</span>
                           </div>
                        </td>
                        <td className="px-10 py-7 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm border border-slate-200">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-white text-slate-400 hover:text-emerald-600 rounded-2xl transition-all shadow-sm border border-slate-200">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-white text-slate-400 hover:text-red-600 rounded-2xl transition-all shadow-sm border border-slate-200">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
             <div className="space-y-8 animate-fade-in">
                <div className="bg-[#0F172A] rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
                   <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                   <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
                   
                   <div className="relative z-10 max-w-3xl">
                      <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 mb-10">
                         <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                         <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Unit: Strategic Intelligence</span>
                      </div>
                      <h2 className="text-5xl font-black mb-8 leading-[1.2]">واحد تحلیل هوشمند و استنتاج الگوهای رفتاری</h2>
                      <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12">
                         در این بخش، موتور Gemini با بررسی متقاطع (Cross-Review) تمام اسناد رصد شده، تغییرات لحن، تمایلات موضوعی و شبکه‌های ارتباطی اهداف را به صورت خودکار استخراج می‌کند.
                      </p>
                      <div className="flex gap-4">
                        <button className="px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all flex items-center gap-4 active:scale-95">
                           <BrainCircuit className="w-6 h-6" />
                           شروع پردازش عمیق (Deep Scan)
                        </button>
                        <button className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-[1.5rem] font-black hover:bg-white/10 transition-all flex items-center gap-4 active:scale-95">
                           <PieChart className="w-6 h-6" />
                           گزارش تجمیعی
                        </button>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {[
                      { icon: Layers, title: 'تشخیص شبکه‌های همسو', desc: 'شناسایی ارتباطات معنایی و تکرار محتوا بین پروفایل‌های مختلف در شبکه رصد شده.' },
                      { icon: TrendingUp, title: 'پایش تغییرات جهت‌دار', desc: 'آنالیز زمانی تغییر لحن هدف از محتوای روزمره به محتوای خاص یا حساسیت‌زا.' },
                      { icon: ShieldAlert, title: 'واحد تشخیص خودکار تهدید', desc: 'اعلام هشدار سیستمی در صورت شناسایی واژگان کلیدی یا رفتارهای مشکوک توسط Gemini.' }
                   ].map((f, i) => (
                      <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group">
                         <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-6">
                            <f.icon className="w-8 h-8" />
                         </div>
                         <h4 className="text-xl font-black text-slate-900 mb-4">{f.title}</h4>
                         <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'team' && (
             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-20 text-center animate-fade-in">
               <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-indigo-100">
                  <ShieldCheck className="w-10 h-10 text-indigo-600" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-4">مدیریت و پایش تیم رصدگر</h3>
               <p className="text-slate-500 max-w-lg mx-auto text-sm font-medium leading-relaxed mb-10">
                 در این بخش می‌توانید لیست تمام رصدگران فعال، میزان مشارکت هر نفر و کیفیت داده‌های ارسالی آن‌ها را مشاهده و سطوح دسترسی را کنترل کنید.
               </p>
               <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto">
                 <Settings className="w-5 h-5" /> پیکربندی تیم عملیات
               </button>
             </div>
          )}

          {activeTab === 'logs' && (
             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up bg-slate-900 text-emerald-400 font-mono text-sm p-10">
                <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
                   <Terminal className="w-6 h-6 text-emerald-500" />
                   <h3 className="text-lg font-black text-white">System Core Logs (v2.0.4)</h3>
                </div>
                <div className="space-y-4">
                  <p className="flex gap-4"><span className="text-slate-500">[14:02:11]</span> <span className="text-indigo-400">INFO:</span> Connecting to Supabase High-Availability Cluster...</p>
                  <p className="flex gap-4"><span className="text-slate-500">[14:02:12]</span> <span className="text-emerald-400">SUCCESS:</span> Authenticated as Administrator UID: {profiles[0]?.id.slice(0, 10)}...</p>
                  <p className="flex gap-4"><span className="text-slate-500">[14:02:15]</span> <span className="text-yellow-400">WARN:</span> Gemini API Response latency increased to 1.2s</p>
                  <p className="flex gap-4"><span className="text-slate-500">[14:05:22]</span> <span className="text-indigo-400">INFO:</span> New analysis trigger for target handle @mostafa_sc...</p>
                  <p className="flex gap-4 animate-pulse"><span className="text-slate-500">[14:06:01]</span> <span className="text-white">WAIT:</span> Monitoring incoming stream...</p>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* استایل‌های شخصی‌سازی شده */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};