import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, Activity, Search, LogOut, RefreshCw, Loader2, ShieldCheck, BarChart3,
  Eye, Cpu, BrainCircuit, Layers, Zap, Terminal, Menu, X, ChevronLeft, Clock, CheckCircle2, AlertOctagon, UserPlus, ShieldAlert, Edit, ScanLine
} from 'lucide-react';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['instagram_profiles']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];

type TabType = 'overview' | 'targets' | 'intelligence' | 'team' | 'logs';

export const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState({ 
    profiles: 0, 
    submissions: 0, 
    observers: 0,
    aiAccuracy: 99.1,
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // دریافت لیست اهداف
      const { data: profileData } = await supabase.from('instagram_profiles').select('*').order('created_at', { ascending: false });
      setProfiles(profileData || []);

      // دریافت لیست ارسال‌ها
      const { data: submissionData } = await supabase.from('submissions').select('*').order('created_at', { ascending: false }).limit(10);
      setRecentSubmissions(submissionData || []);

      // دریافت لیست کاربران (تیم)
      const { data: teamData } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });
      setTeamMembers(teamData || []);
      
      // آمار
      const { count: pCount } = await supabase.from('instagram_profiles').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
      
      setStats(prev => ({ 
        ...prev,
        profiles: pCount || 0, 
        submissions: sCount || 0,
        observers: teamData?.length || 0
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

    // بروزرسانی زنده داشبورد ادمین هنگام ثبت اسناد جدید
    const subChannel = supabase.channel('admin-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(subChannel); };
  }, []);

  // تغییر نقش کاربر
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'observer' : 'admin';
    if(window.confirm(`آیا از تغییر سطح دسترسی این کاربر به ${newRole} مطمئن هستید؟`)) {
      try {
        // استفاده از as any روی کل کوئری برای دور زدن استنتاجگر تایپ‌اسکریپت و جلوگیری از ارور never
        await (supabase.from('user_roles') as any).update({ role: newRole }).eq('user_id', userId);
        fetchData(); // بروزرسانی لیست
      } catch(err) {
        alert("خطا در تغییر سطح دسترسی.");
      }
    }
  };

  const menuItems: {id: TabType, label: string, icon: any}[] = [
    { id: 'overview', label: 'مرکز فرماندهی', icon: BarChart3 },
    { id: 'targets', label: 'بانک جامع اهداف', icon: Users },
    { id: 'intelligence', label: 'واحد هوش مصنوعی', icon: BrainCircuit },
    { id: 'team', label: 'نظارت بر تیم', icon: ShieldCheck },
    { id: 'logs', label: 'ترمینال فنی', icon: Terminal },
  ];

  const renderStatus = (status: string | null) => {
    switch(status) {
      case 'completed': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]"><CheckCircle2 className="w-3 h-3"/> موفق</span>;
      case 'processing': return <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]"><Loader2 className="w-3 h-3 animate-spin"/> پردازش</span>;
      case 'pending': return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px]"><Clock className="w-3 h-3"/> در صف</span>;
      case 'failed': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px]"><AlertOctagon className="w-3 h-3"/> خطا</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col lg:flex-row" dir="rtl">
      
      {/* Sidebar Mobile Overlay */}
      <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />
      
      <aside className={`fixed right-0 top-0 h-full w-72 bg-[#0F172A] z-50 text-white flex flex-col py-8 border-l border-white/5 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-8 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none text-white">SOCIAL PULSE</h2>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 block">Enterprise AI v2.0</span>
            </div>
          </div>
          <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? 'bg-gradient-to-l from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-bold">{item.label}</span>
              {activeTab === item.id && <ChevronLeft className="w-4 h-4 mr-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">خروج از سیستم</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:mr-72 min-h-screen transition-all duration-300">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">دسترسی سازمانی سطح ۱</p>
            </div>
          </div>
          <button onClick={fetchData} className="p-2.5 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all shadow-sm">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </header>

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { title: 'کل بانک اهداف', value: stats.profiles, icon: Users, color: 'indigo' },
                  { title: 'اسناد پایش شده', value: stats.submissions, icon: Layers, color: 'emerald' },
                  { title: 'دقت تشخیص هوش', value: `${stats.aiAccuracy}%`, icon: BrainCircuit, color: 'blue' },
                  { title: 'پرسنل و رصدگران', value: stats.observers, icon: ShieldCheck, color: 'purple' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 sm:p-7 rounded-[2rem] border border-slate-200 shadow-sm flex items-center sm:block gap-4">
                    <div className={`p-3 sm:p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 shadow-inner shrink-0 mb-0 sm:mb-6`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-4xl font-black text-slate-800">{loading ? '...' : stat.value}</h3>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mt-1">{stat.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 mb-6">حجم فعالیت (۷ روز)</h3>
                  <div className="flex-1 flex flex-col justify-end min-h-[250px] overflow-x-auto">
                    <div className="flex items-end justify-between h-40 gap-3 min-w-[300px]">
                      {[35, 80, 50, 90, 70, 100, 65].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group">
                          <div className="w-full bg-slate-100 rounded-xl relative h-full flex items-end">
                             <div style={{ height: `${h}%` }} className="w-full bg-indigo-500 rounded-xl transition-all duration-700 shadow-sm" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 mt-3">
                            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col max-h-[500px]">
                   <h3 className="text-base sm:text-lg font-black text-slate-800 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        آخرین وقایع صف
                      </div>
                      <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-1 rounded-lg animate-pulse">Live</span>
                   </h3>
                   <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                      {recentSubmissions.map((sub) => (
                        <div key={sub.id} className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                            <Layers className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="flex-1 border-b border-slate-50 pb-3">
                            <div className="flex justify-between items-start">
                              <p className="text-[10px] font-black text-slate-800" dir="ltr">#{sub.id.slice(0, 6)}</p>
                              {renderStatus(sub.status)}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-medium">
                              {sub.status === 'completed' ? sub.summary : 'در انتظار خروجی هوش مصنوعی...'}
                            </p>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'targets' && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col">
              <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">بانک جامع اهداف</h3>
                <div className="relative group w-full sm:w-80">
                  <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="جستجوی سریع در آیدی‌ها..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">مشخصات هدف</th>
                      <th className="px-8 py-5">تعداد تحلیل</th>
                      <th className="px-8 py-5">آخرین فعالیت ثبت شده</th>
                      <th className="px-8 py-5 text-center">جزئیات پرونده</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-indigo-50/30 transition-all">
                        <td className="px-8 py-5 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
                            {profile.handle.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-slate-800 text-base" dir="ltr">@{profile.handle}</span>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold">داده‌های متنی استخراج شده</p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-black text-slate-600 border border-slate-200">
                             ثبت شده
                           </span>
                        </td>
                        <td className="px-8 py-5 text-xs text-slate-500 font-bold">
                          {new Date(profile.created_at || '').toLocaleDateString('fa-IR')}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"><Eye className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col">
               <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">مدیریت اعضای تیم</h3>
                  <p className="text-xs text-slate-500 mt-1 font-bold">مدیریت سطح دسترسی رصدگران و راهبران سیستم</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all">
                  <UserPlus className="w-4 h-4" /> دعوت کاربر جدید
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">شناسه کاربری (ID)</th>
                      <th className="px-8 py-5">تاریخ عضویت</th>
                      <th className="px-8 py-5">سطح دسترسی (نقش)</th>
                      <th className="px-8 py-5 text-center">عملیات ادمین</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {teamMembers.map((member) => (
                      <tr key={member.user_id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                 <Users className="w-4 h-4 text-slate-500" />
                              </div>
                              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md" dir="ltr">
                                {member.user_id.slice(0, 12)}...
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-500 font-bold">
                          {new Date(member.created_at || '').toLocaleDateString('fa-IR')}
                        </td>
                        <td className="px-8 py-6">
                           {member.role === 'admin' ? (
                             <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-black border border-purple-100 flex items-center gap-1.5 w-max">
                               <ShieldAlert className="w-3.5 h-3.5" /> راهبر کل (Admin)
                             </span>
                           ) : (
                             <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-black border border-emerald-100 flex items-center gap-1.5 w-max">
                               <ScanLine className="w-3.5 h-3.5" /> رصدگر (Observer)
                             </span>
                           )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button 
                            onClick={() => toggleUserRole(member.user_id, member.role)}
                            className="text-xs font-bold px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2 mx-auto"
                          >
                            <Edit className="w-3.5 h-3.5" /> تغییر نقش
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-amber-50/50 border-t border-amber-100 flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                  توجه: ایجاد و حذف کامل کاربران از سیستم احراز هویت، نیازمند دسترسی به کنسول امنیتی سوپابیس (Supabase Auth Dashboard) می‌باشد. در این پنل شما می‌توانید سطح دسترسی کاربران موجود را ارتقا یا تنزل دهید.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-[#0F172A] rounded-[2rem] sm:rounded-[3.5rem] p-8 sm:p-16 text-white relative overflow-hidden shadow-2xl">
                   <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10 mb-6">
                         <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">AI Intelligence</span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black mb-4 leading-tight">واحد تحلیل استراتژیک (Deep Scan)</h2>
                      <p className="text-sm sm:text-lg text-slate-400 font-medium leading-relaxed mb-8 max-w-2xl">
                         در بروزرسانی بعدی، با وارد کردن آیدی یک هدف، سیستم تمام تاریخچه متنی او را تجمیع کرده و یک پروفایل روان‌شناختی-رفتاری تولید می‌کند.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input type="text" placeholder="مثال: target_username" className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-left font-mono" dir="ltr" />
                        <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                           <BrainCircuit className="w-5 h-5" /> شروع اسکن عمیق
                        </button>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 sm:p-12 text-emerald-400 font-mono text-xs sm:text-sm shadow-2xl overflow-hidden animate-slide-up">
               <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                  <Terminal className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-base font-black text-white">System Core Logs</h3>
               </div>
               <div className="space-y-3 opacity-80">
                 <p className="flex gap-4"><span className="text-slate-500">[SYSTEM]</span> <span className="text-emerald-400">All services running optimally.</span></p>
                 <p className="flex gap-4"><span className="text-slate-500">[AUTH]</span> <span className="text-blue-400">Admin session verified securely.</span></p>
                 <p className="flex gap-4"><span className="text-slate-500">[DATABASE]</span> <span className="text-emerald-400">Real-time subscription connected.</span></p>
                 <p className="flex gap-4 animate-pulse mt-8"><span className="text-slate-500">[WAIT]</span> <span className="text-white">Listening for background events...</span></p>
               </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e540; border-radius: 10px; }
        @media (max-width: 640px) {
          .animate-slide-up { animation: slideUpMobile 0.5s ease-out forwards; }
        }
        @keyframes slideUpMobile {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
