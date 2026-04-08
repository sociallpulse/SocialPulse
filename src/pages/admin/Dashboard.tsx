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
  Settings,
  Bell,
  Cpu,
  BrainCircuit,
  Calendar,
  Layers,
  MoreVertical
} from 'lucide-react';
import type { Database as DBTypes } from '../../types/database.types';

type Profile = DBTypes['public']['Tables']['instagram_profiles']['Row'];
type Submission = DBTypes['public']['Tables']['submissions']['Row'];

export const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'intelligence' | 'logs'>('overview');
  const [stats, setStats] = useState({ 
    profiles: 0, 
    submissions: 0, 
    observers: 0,
    aiAccuracy: 98.4,
    dailyGrowth: 14,
    activeAlerts: 3
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data: profileData } = await supabase
        .from('instagram_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setProfiles(profileData || []);

      const { data: submissionData } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setRecentSubmissions(submissionData || []);
      
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
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900 selection:bg-indigo-100" dir="rtl">
      
      {/* سایدبار ناوبری کناری */}
      <aside className="fixed right-0 top-0 h-full w-20 lg:w-64 bg-slate-900 z-50 text-white flex flex-col items-center lg:items-stretch py-6 border-l border-slate-800 transition-all shadow-2xl">
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight hidden lg:block">SOCIAL PULSE</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'overview', label: 'پیشخوان مرکزی', icon: BarChart3 },
            { id: 'targets', label: 'بانک اهداف', icon: Users },
            { id: 'intelligence', label: 'واحد هوشمند', icon: BrainCircuit },
            { id: 'logs', label: 'گزارشات فنی', icon: Database },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-bold hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold hidden lg:block">خروج امن</span>
          </button>
        </div>
      </aside>

      {/* محتوای اصلی */}
      <main className="lg:mr-64 mr-20 transition-all">
        
        {/* هدر فوقانی */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-black text-slate-800">
              {activeTab === 'overview' && 'مرکز مانیتورینگ و عملیات'}
              {activeTab === 'targets' && 'مدیریت پایگاه داده اهداف'}
              {activeTab === 'intelligence' && 'واحد تحلیل هوشمند Gemini'}
              {activeTab === 'logs' && 'لاگ‌های امنیتی و فنی'}
            </h1>
            <div className="hidden md:flex items-center gap-3 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Engine: Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <button 
              onClick={fetchData}
              className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* کارت‌های آماری مدرن */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'پروفایل‌های تحت رصد', value: stats.profiles, icon: Users, color: 'indigo', trend: `+${stats.dailyGrowth}%` },
                  { title: 'اسناد تحلیل شده', value: stats.submissions, icon: ImageIcon, color: 'purple', trend: '+۵.۴٪' },
                  { title: 'دقت انجین هوش مصنوعی', value: `${stats.aiAccuracy}%`, icon: BrainCircuit, color: 'emerald', trend: 'ثابت' },
                  { title: 'هشدار‌های سیستمی', value: stats.activeAlerts, icon: AlertCircle, color: 'orange', trend: 'نیاز به بررسی' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 shadow-inner`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-1">{loading ? '...' : stat.value}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.title}</p>
                  </div>
                ))}
              </div>

              {/* بخش نمودار و پایش زنده */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* نمودار روند فعالیت (شبیه‌سازی با SVG) */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">تحلیل روند رصد (۷ روز اخیر)</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">تعداد اسکرین‌شات‌های پردازش شده در هر روز</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-indigo-500 transition-all">هفتگی</button>
                       <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200">ماهانه</button>
                    </div>
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-end min-h-[300px]">
                    <div className="flex items-end justify-between h-48 gap-4">
                      {[45, 60, 40, 85, 55, 95, 75].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                          <div className="w-full bg-slate-50 rounded-t-xl relative overflow-hidden h-full flex items-end">
                             <div 
                              style={{ height: `${h}%` }} 
                              className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl group-hover:from-purple-600 group-hover:to-purple-400 transition-all duration-500 relative"
                             >
                               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                  {h} مورد
                               </div>
                             </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">
                            {['شنبه', '۱شنبه', '۲شنبه', '۳شنبه', '۴شنبه', '۵شنبه', 'جمعه'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* پایش زنده رصدگران */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col">
                   <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                      <Layers className="w-6 h-6 text-indigo-500" />
                      آخرین فعالیت‌ها
                   </h3>
                   <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                      {recentSubmissions.map((sub) => (
                        <div key={sub.id} className="flex gap-4 group">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                              <Activity className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                          </div>
                          <div className="flex-1 border-b border-slate-50 pb-4">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-black text-slate-800">تحلیل #{(sub.id || '').slice(0, 6)}</p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Just Now</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                              {sub.summary || 'در حال پردازش داده‌های بصری...'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {recentSubmissions.length === 0 && (
                        <div className="text-center py-10">
                          <Loader2 className="w-8 h-8 text-slate-200 animate-spin mx-auto mb-4" />
                          <p className="text-xs text-slate-400 font-bold">در انتظار دریافت داده...</p>
                        </div>
                      )}
                   </div>
                   <button className="w-full mt-8 py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100">
                      مشاهده تمام وقایع
                   </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'targets' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">بانک اطلاعاتی اهداف</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium italic">مدیریت متمرکز پروفایل‌های شناسایی شده در رصدها</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="جستجو در آیدی‌ها، متن‌ها یا دسته‌بندی..." 
                      className="w-full sm:w-80 pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                    />
                  </div>
                  <button className="p-3.5 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">اطلاعات پروفایل</th>
                      <th className="px-8 py-5">تعداد تحلیل</th>
                      <th className="px-8 py-5">آخرین بروزرسانی</th>
                      <th className="px-8 py-5">شاخص اولویت</th>
                      <th className="px-8 py-5 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-24">
                          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                          <span className="text-sm text-slate-400 font-bold">در حال بازیابی پایگاه داده...</span>
                        </td>
                      </tr>
                    ) : profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-xl border border-slate-200 shadow-inner group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-500">
                              {profile.handle.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-black text-slate-800 text-base group-hover:text-indigo-700 transition-colors" dir="ltr">@{profile.handle}</span>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System ID: {profile.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                              <ImageIcon className="w-3.5 h-3.5" />
                              {(Math.random() * 20 + 5).toFixed(0)} مورد
                           </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-500 font-bold">
                          {new Date(profile.created_at || '').toLocaleDateString('fa-IR')}
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[100px] overflow-hidden">
                                 <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-600 uppercase">High</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
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
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                   <BrainCircuit className="absolute -bottom-10 -left-10 w-64 h-64 text-white/5 rotate-12" />
                   <div className="relative z-10 max-w-2xl">
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 mb-8">
                         <Zap className="w-5 h-5 text-yellow-400" />
                         <span className="text-xs font-black uppercase tracking-widest">AI Intelligent Unit</span>
                      </div>
                      <h2 className="text-4xl font-black mb-6 leading-tight">واحد تحلیل هوشمند رفتاری</h2>
                      <p className="text-lg text-slate-300 font-medium leading-relaxed mb-10">
                         در این بخش، موتور Gemini با تجمیع تمام داده‌های رصد شده از یک هدف، الگوهای تکرار شونده، تغییر لحن و گرایش‌های موضوعی را استخراج می‌کند.
                      </p>
                      <button className="px-10 py-5 bg-white text-indigo-900 rounded-[1.5rem] font-black shadow-xl shadow-white/10 hover:bg-indigo-50 transition-all flex items-center gap-3 active:scale-95">
                         <Activity className="w-6 h-6" />
                         اجرای پردازش عمیق (Deep Scan)
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {[
                      { icon: Layers, title: 'کشف الگوهای پنهان', desc: 'شناسایی ارتباطات معنایی بین اسکرین‌شات‌های مختلف یک آیدی در بازه‌های زمانی متفاوت.' },
                      { icon: TrendingUp, title: 'پیش‌بینی روند تغییرات', desc: 'بررسی جهت‌گیری‌های احتمالی هدف بر اساس تحلیل محتوای متنی استخراج شده.' },
                      { icon: ShieldCheck, title: 'تأیید اعتبار خودکار', desc: 'بررسی صحت متون استخراج شده توسط انجین‌های موازی برای به حداقل رساندن خطای انسانی.' }
                   ].map((f, i) => (
                      <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                         <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <f.icon className="w-7 h-7" />
                         </div>
                         <h4 className="text-lg font-black text-slate-800 mb-3">{f.title}</h4>
                         <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'logs' && (
             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                      <Database className="w-6 h-6 text-slate-400" />
                      لاگ‌های سیستمی و امنیتی
                   </h3>
                   <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-lg shadow-slate-900/20">
                      <Download className="w-4 h-4" />
                      خروجی گزارش .LOG
                   </button>
                </div>
                <div className="p-12 text-center">
                   <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
                      <Settings className="w-10 h-10 text-slate-300 animate-spin-slow" />
                   </div>
                   <h4 className="text-xl font-black text-slate-800 mb-4 tracking-tight">این بخش در نسخه ۲.۵ فعال خواهد شد</h4>
                   <p className="text-slate-400 max-w-md mx-auto text-sm font-medium leading-relaxed">
                      در نسخه آینده، امکان مشاهده تمام ریکوئست‌های API، تغییرات دیتابیس توسط ادمین‌ها و وضعیت لحظه‌ای منابع سرور فراهم خواهد شد.
                   </p>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* استایل‌های سفارشی برای اسکرول‌بار */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
};

// کامپوننت کمکی آیکون صاعقه
const Zap = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);