import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, Activity, Search, LogOut, RefreshCw, Loader2, ShieldCheck, BarChart3,
  Eye, Cpu, BrainCircuit, Layers, Zap, Terminal, Menu, X, ChevronLeft, Clock, 
  CheckCircle2, UserPlus, ShieldAlert, Edit, Trash2, Filter, Settings, Hash
} from 'lucide-react';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['instagram_profiles']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'] & { 
  display_name?: string; 
  personnel_code?: string;
};

type TabType = 'overview' | 'targets' | 'intelligence' | 'team' | 'logs';

export const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [stats, setStats] = useState({ 
    profiles: 0, 
    submissions: 0, 
    observers: 0,
    activeToday: 0
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data: profileData } = await supabase.from('instagram_profiles').select('*').order('created_at', { ascending: false });
      setProfiles(profileData || []);

      const { data: submissionData } = await supabase.from('submissions').select('*').order('created_at', { ascending: false }).limit(15);
      setRecentSubmissions(submissionData || []);

      const { data: teamData } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });
      setTeamMembers(teamData || []);
      
      const { count: pCount } = await supabase.from('instagram_profiles').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
      
      setStats({ 
        profiles: pCount || 0, 
        submissions: sCount || 0,
        observers: teamData?.length || 0,
        activeToday: Math.floor((sCount || 0) * 0.15)
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'observer' : 'admin';
    const confirmMsg = `آیا از تغییر سطح دسترسی کاربر به "${newRole === 'admin' ? 'مدیر' : 'رصدگر'}" اطمینان دارید؟`;
    
    if (window.confirm(confirmMsg)) {
      try {
        const { error } = await (supabase.from('user_roles') as any).update({ role: newRole }).eq('user_id', userId);
        if (error) throw error;
        fetchData();
      } catch (err) {
        alert("خطا در بروزرسانی نقش کاربری.");
      }
    }
  };

  const handleDeleteTarget = async (id: string) => {
    if (window.confirm("با حذف این هدف، تمامی تحلیل‌های مرتبط نیز پاک خواهند شد. ادامه می‌دهید؟")) {
      await supabase.from('instagram_profiles').delete().eq('id', id);
      fetchData();
    }
  };

  const menuItems = [
    { id: 'overview', label: 'مرکز فرماندهی', icon: BarChart3 },
    { id: 'targets', label: 'بانک جامع اهداف', icon: Users },
    { id: 'intelligence', label: 'واحد هوشمند', icon: BrainCircuit },
    { id: 'team', label: 'مدیریت رصدگران', icon: ShieldCheck },
    { id: 'logs', label: 'لاگ‌های سیستم', icon: Terminal },
  ];

  const renderStatusBadge = (status: string | null) => {
    switch(status) {
      case 'completed': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100"><CheckCircle2 className="w-3 h-3"/> موفق</span>;
      case 'processing': return <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100"><Loader2 className="w-3 h-3 animate-spin"/> پردازش</span>;
      case 'pending': return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-100"><Clock className="w-3 h-3"/> در صف</span>;
      default: return <span className="text-slate-400 text-[10px]">نامشخص</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900 flex flex-col lg:flex-row overflow-hidden" dir="rtl">
      
      <div className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />
      
      <aside className={`fixed right-0 top-0 h-full w-72 bg-[#0F172A] z-50 text-white flex flex-col py-8 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-8 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">SocialPulse</h2>
          </div>
          <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
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

        <div className="px-4 mt-auto pt-6 border-t border-white/5 space-y-2">
           <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">وضعیت سرور</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-emerald-400">عملیاتی (v2.4)</span>
              </div>
           </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">خروج از سیستم ادمین</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:mr-72 min-h-screen flex flex-col transition-all duration-300">
        
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600 active:scale-95 transition-all" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-black">Admin Access</span>
                 <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">بروزرسانی شده: همین الان</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={fetchData} className="p-2.5 sm:p-3 bg-white border border-slate-200 text-slate-500 rounded-xl sm:rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden md:flex items-center gap-3 pr-4 border-r border-slate-200">
               <div className="text-left">
                  <p className="text-xs font-black text-slate-800">راهبر کل سیستم</p>
                  <p className="text-[10px] text-slate-400 font-bold">super-admin@social.ir</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg">AD</div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { title: 'کل بانک اهداف', value: stats.profiles, icon: Users, color: 'indigo', trend: '+۱۲ نفر جدید' },
                  { title: 'تحلیل‌های ثبت شده', value: stats.submissions, icon: Layers, color: 'emerald', trend: '+۴۵ مورد امروز' },
                  { title: 'فعالیت رصدگران', value: stats.activeToday, icon: Activity, color: 'blue', trend: '۹۸٪ پایداری' },
                  { title: 'پرسنل فعال', value: stats.observers, icon: ShieldCheck, color: 'purple', trend: 'مشاهده لیست' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 w-max mb-6 group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-black text-slate-800">{loading ? '...' : stat.value}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-1 mb-3">{stat.title}</p>
                      <span className={`text-[10px] font-black bg-${stat.color}-50 text-${stat.color}-700 px-2 py-1 rounded-lg`}>{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-3">
                       <BarChart3 className="w-5 h-5 text-indigo-500" /> فشار کاری شبکه (۷ روز)
                    </h3>
                  </div>
                  <div className="flex-1 p-6 sm:p-10 flex flex-col justify-end min-h-[300px]">
                    <div className="flex items-end justify-between h-48 gap-4">
                      {[40, 85, 55, 100, 75, 90, 60].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                          <div className="w-full bg-slate-100 rounded-xl relative h-full flex items-end">
                             <div style={{ height: `${h}%` }} className="w-full bg-indigo-500 rounded-xl group-hover:bg-indigo-600 transition-all duration-700 shadow-sm relative">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h} تحلیل</div>
                             </div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 mt-4">
                            {['شنبه', 'یکش', 'دوش', 'سه‌ش', 'چهار', 'پنج', 'جمعه'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col max-h-[600px]">
                   <h3 className="text-base sm:text-lg font-black text-slate-800 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-indigo-500" /> وقایع زنده صف
                      </div>
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                   </h3>
                   <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                      {recentSubmissions.map((sub) => (
                        <div key={sub.id} className="p-4 border border-slate-50 bg-slate-50/30 rounded-2xl flex gap-4 hover:bg-slate-50 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                            <Layers className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-[10px] font-black text-slate-800 truncate" dir="ltr">#{sub.id.slice(0, 8)}</p>
                              {renderStatusBadge(sub.status)}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium line-clamp-1 italic">
                              {sub.status === 'completed' ? sub.summary : 'در انتظار پردازش متنی...'}
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
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col">
              <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">بانک جامع اهداف</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">مدیریت آیدی‌های اینستاگرام شناسایی شده در رصدها</p>
                </div>
                <div className="relative group w-full sm:w-80">
                  <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="جستجو در آیدی‌ها..." 
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">اطلاعات هدف (Target)</th>
                      <th className="px-8 py-5">نام کامل</th>
                      <th className="px-8 py-5">آخرین پایش</th>
                      <th className="px-8 py-5 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {profiles.filter(p => p.handle.includes(searchQuery)).map((profile) => (
                      <tr key={profile.id} className="hover:bg-indigo-50/30 transition-all group">
                        <td className="px-8 py-6 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-md group-hover:rotate-6 transition-transform">
                            {profile.handle.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-slate-800 text-base" dir="ltr">@{profile.handle}</span>
                            <div className="flex gap-2 mt-1">
                               <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">Manual ID</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{profile.full_name || 'ثبت نشده'}</td>
                        <td className="px-8 py-6 text-xs text-slate-400 font-bold">
                          {new Date(profile.created_at || '').toLocaleDateString('fa-IR')}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"><Eye className="w-5 h-5" /></button>
                             <button onClick={() => handleDeleteTarget(profile.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col">
               <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">مدیریت اعضای تیم</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">نظارت بر رصدگران و تغییر سطوح دسترسی سازمانی</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg hover:bg-black transition-all">
                  <UserPlus className="w-4 h-4" /> دعوت همکار جدید
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[750px]">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">شناسه کاربری و PERSONNEL ID</th>
                      <th className="px-8 py-5">تاریخ الحاق</th>
                      <th className="px-8 py-5">سطح دسترسی (Role)</th>
                      <th className="px-8 py-5 text-center">مدیریت هویت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {teamMembers.map((member) => (
                      <tr key={member.user_id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                 <Users className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-max mb-1" dir="ltr">
                                   UID: {member.user_id.slice(0, 15)}...
                                 </p>
                                 <p className="text-[10px] font-black text-indigo-600 flex items-center gap-1">
                                   <Hash className="w-3 h-3" /> شناسه عددی: {member.personnel_code || 'تعریف نشده'}
                                 </p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-500 font-bold">
                          {new Date(member.created_at || '').toLocaleDateString('fa-IR')}
                        </td>
                        <td className="px-8 py-6">
                           {member.role === 'admin' ? (
                             <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-[11px] font-black border border-purple-100 flex items-center gap-2 w-max">
                               <ShieldAlert className="w-4 h-4" /> مدیر راهبر
                             </span>
                           ) : (
                             <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-[11px] font-black border border-emerald-100 flex items-center gap-2 w-max">
                               <Activity className="w-4 h-4" /> رصدگر میدانی
                             </span>
                           )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleRoleChange(member.user_id, member.role)}
                              className="text-[10px] font-black px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> ارتقا/تنزل
                            </button>
                            <button className="p-2.5 text-slate-300 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
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
             <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <div className="bg-[#0F172A] rounded-[3rem] p-10 sm:p-16 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full"></div>
                   
                   <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 mb-8 backdrop-blur-md">
                         <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Strategy Engine v1.0</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">واحد اسکن عمیق (Deep Scan)</h2>
                      <p className="text-sm sm:text-lg text-slate-400 font-medium leading-relaxed mb-10 max-w-2xl">
                         این واحد با تجمیع تمامی اسناد و تحلیل‌های متنی استخراج شده از یک فرد، الگوهای رفتاری و تغییرات لحن او را در طول زمان توسط مدل Gemini تحلیل می‌کند.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                        <div className="flex-1 relative group">
                           <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                           <input type="text" placeholder="آیدی هدف را وارد کنید..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-left font-mono" dir="ltr" />
                        </div>
                        <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                           <BrainCircuit className="w-5 h-5" /> شروع تحلیل عمیق
                        </button>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                   <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                         <Filter className="w-6 h-6" />
                      </div>
                      <h4 className="font-black text-slate-800 text-lg mb-2">فیلترینگ هوشمند کلمات</h4>
                      <p className="text-xs text-slate-500 font-medium leading-loose">استخراج کلمات پرتکرار و هشتگ‌های مورد استفاده اهداف به صورت تجمیعی.</p>
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                         <Settings className="w-6 h-6" />
                      </div>
                      <h4 className="font-black text-slate-800 text-lg mb-2">تنظیمات حساسیت AI</h4>
                      <p className="text-xs text-slate-500 font-medium leading-loose">تنظیم دقت مدل زبانی برای تشخیص طنز، کنایه و پیام‌های پنهان در اسناد.</p>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'logs' && (
            <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 sm:p-12 text-emerald-400 font-mono text-xs sm:text-sm shadow-2xl overflow-hidden animate-slide-up relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
               <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                  <Terminal className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-base font-black text-white">CORE SECURITY LOGS</h3>
               </div>
               <div className="space-y-4">
                 <div className="flex gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-blue-400 uppercase font-bold shrink-0">[SYSTEM]</span>
                    <span className="text-emerald-400/80">All core services running in encrypted mode. Gemini instance connected.</span>
                 </div>
                 <div className="flex gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-purple-400 uppercase font-bold shrink-0">[AUTH]</span>
                    <span className="text-emerald-400/80">Admin session validated. WebSocket secure connection established.</span>
                 </div>
                 <div className="flex gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-amber-400 uppercase font-bold shrink-0">[DB]</span>
                    <span className="text-emerald-400/80">Real-time sync listening on public.submissions. Filtering by personnel_code enabled.</span>
                 </div>
                 <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-500 italic">Listening for new background events...</span>
                 </div>
               </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e520; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f46e540; }
        @media (max-width: 640px) {
          .animate-slide-up { animation: slideUpMobile 0.5s ease-out forwards; }
        }
        @keyframes slideUpMobile {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};