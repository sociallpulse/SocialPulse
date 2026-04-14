import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, Activity, Search, LogOut, RefreshCw, Loader2, ShieldCheck, BarChart3,
  Eye, Cpu, BrainCircuit, Layers, Zap, Terminal, Menu, X, ChevronLeft, Clock, 
  CheckCircle2, UserPlus, ShieldAlert, Trash2, AlertTriangle, PlayCircle, FileText, Hash
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
  
  // وضعیت برای مشاهده جزئیات پرونده یک هدف
  const [selectedTarget, setSelectedTarget] = useState<Profile | null>(null);
  const [targetSubmissions, setTargetSubmissions] = useState<Submission[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [stats, setStats] = useState({ 
    profiles: 0, 
    submissions: 0, 
    observers: 0,
    pendingItems: 0,
    stuckItems: 0
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data: profileData } = await supabase.from('instagram_profiles').select('*').order('created_at', { ascending: false });
      setProfiles(profileData || []);

      const { data: submissionData } = await supabase.from('submissions').select('*').order('created_at', { ascending: false }).limit(20);
      setRecentSubmissions(submissionData || []);

      const { data: teamData } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });
      setTeamMembers(teamData || []);
      
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count: pCount } = await supabase.from('instagram_profiles').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
      const { count: pendingCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      const stuckItemsCount = ((submissionData as any[]) || []).filter(s => s.status === 'pending' && s.created_at && s.created_at < tenMinutesAgo).length;

      setStats({ 
        profiles: pCount || 0, 
        submissions: sCount || 0,
        observers: teamData?.length || 0,
        pendingItems: pendingCount || 0,
        stuckItems: stuckItemsCount
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
    const channel = supabase.channel('admin-realtime-v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // مشاهده پرونده اسناد یک هدف خاص
  const handleViewTargetDetails = async (profile: Profile) => {
    setSelectedTarget(profile);
    setLoadingDetails(true);
    try {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });
      setTargetSubmissions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'observer' : 'admin';
    if (window.confirm(`آیا از تغییر سطح دسترسی کاربر اطمینان دارید؟`)) {
      try {
        const { error } = await (supabase.from('user_roles') as any).update({ role: newRole }).eq('user_id', userId);
        if (error) throw error;
        fetchData();
      } catch (err) {
        alert("خطا در بروزرسانی نقش.");
      }
    }
  };

  const handleDeleteTarget = async (id: string) => {
    if (window.confirm("حذف هدف؟")) {
      await supabase.from('instagram_profiles').delete().eq('id', id);
      fetchData();
    }
  };

  const handleResetStuckItems = async () => {
    if (window.confirm("آیا می‌خواهید وضعیت موارد گیر کرده را به 'failed' تغییر دهید؟")) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      await (supabase.from('submissions') as any)
        .update({ status: 'failed' })
        .eq('status', 'pending')
        .lt('created_at', tenMinutesAgo);
      fetchData();
    }
  };

  const menuItems = [
    { id: 'overview', label: 'مرکز فرماندهی', icon: BarChart3 },
    { id: 'targets', label: 'بانک جامع اهداف', icon: Users },
    { id: 'intelligence', label: 'پایش صف هوشمند', icon: BrainCircuit },
    { id: 'team', label: 'مدیریت رصدگران', icon: ShieldCheck },
    { id: 'logs', label: 'ترمینال سیستم', icon: Terminal },
  ];

  const renderStatusBadge = (status: string | null) => {
    switch(status) {
      case 'completed': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100"><CheckCircle2 className="w-3 h-3"/> موفق</span>;
      case 'processing': return <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100"><Loader2 className="w-3 h-3 animate-spin"/> پردازش</span>;
      case 'pending': return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-100"><Clock className="w-3 h-3"/> در صف</span>;
      case 'failed': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-100"><AlertTriangle className="w-3 h-3"/> خطا</span>;
      default: return <span className="text-slate-400 text-[10px]">نامشخص</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900 flex flex-col lg:flex-row overflow-hidden" dir="rtl">
      
      {/* Sidebar */}
      <div className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />
      
      <aside className={`fixed right-0 top-0 h-full w-72 bg-[#0F172A] z-50 text-white flex flex-col py-8 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-8 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white uppercase">SocialPulse</h2>
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
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">خروج از سیستم</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:mr-72 min-h-screen flex flex-col transition-all duration-300 h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600 active:scale-95 transition-all" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-black">Admin Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {stats.stuckItems > 0 && (
               <button onClick={handleResetStuckItems} className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-[10px] font-black animate-pulse">
                  <AlertTriangle className="w-4 h-4" /> آزادسازی صف ({stats.stuckItems})
               </button>
            )}
            <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { title: 'کل بانک اهداف', value: stats.profiles, icon: Users, color: 'indigo' },
                  { title: 'اسناد پایش شده', value: stats.submissions, icon: Layers, color: 'emerald' },
                  { title: 'در صف انتظار', value: stats.pendingItems, icon: Clock, color: 'amber' },
                  { title: 'رصدگران فعال', value: stats.observers, icon: ShieldCheck, color: 'purple' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                      <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 w-max mb-6`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-800">{loading ? '...' : stat.value}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-1">{stat.title}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col min-h-[400px]">
                    <h3 className="text-base font-black text-slate-800 mb-8 flex items-center gap-3">
                       <BarChart3 className="w-5 h-5 text-indigo-500" /> توزیع زمانی اسناد رصد شده
                    </h3>
                    <div className="flex items-end justify-between h-full gap-4">
                      {[40, 85, 55, 100, 75, 90, 60].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                          <div className="w-full bg-slate-100 rounded-xl relative h-full flex items-end">
                             <div style={{ height: `${h}%` }} className="w-full bg-indigo-500 rounded-xl group-hover:bg-indigo-600 transition-all duration-700 shadow-sm" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 mt-4">
                            {['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col max-h-[600px]">
                   <h3 className="text-base font-black text-slate-800 mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-indigo-500" /> وقایع زنده صف
                      </div>
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-500 uppercase tracking-widest font-black">Archive</span>
                   </h3>
                   <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                      {recentSubmissions.map((sub) => (
                        <div key={sub.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex gap-4 hover:bg-white hover:shadow-md transition-all">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm text-slate-400">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-[10px] font-black text-slate-800 truncate" dir="ltr">#{sub.id.slice(0, 8)}</p>
                              {renderStatusBadge(sub.status)}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium line-clamp-1 italic">
                              {sub.status === 'completed' ? sub.summary : 'در انتظار بررسی توسط هوش مصنوعی...'}
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
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col">
                <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">بانک جامع اهداف</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">پرونده‌های رصد شده در کل سیستم</p>
                  </div>
                  <div className="relative group w-full sm:w-80">
                    <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="جستجوی آیدی..." 
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5">آیدی هدف</th>
                        <th className="px-8 py-5">نام کامل</th>
                        <th className="px-8 py-5">آخرین پایش</th>
                        <th className="px-8 py-5 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {profiles.filter(p => p.handle.toLowerCase().includes(searchQuery.toLowerCase())).map((profile) => (
                        <tr key={profile.id} className="hover:bg-indigo-50/30 transition-all">
                          <td className="px-8 py-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-md">
                              {profile.handle.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-black text-slate-800 text-base" dir="ltr">@{profile.handle}</span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-600">{profile.full_name || 'ثبت نشده'}</td>
                          <td className="px-8 py-6 text-xs text-slate-400 font-bold">
                            {new Date(profile.created_at || '').toLocaleDateString('fa-IR')}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <button 
                                  onClick={() => handleViewTargetDetails(profile)}
                                  className="p-2.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-100 shadow-sm"
                               >
                                  <Eye className="w-5 h-5" />
                               </button>
                               <button onClick={() => handleDeleteTarget(profile.id)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* نمایش جزئیات پرونده اسناد در صورت انتخاب */}
              {selectedTarget && (
                <div className="bg-white rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl p-8 sm:p-12 animate-fade-in relative">
                   <button onClick={() => setSelectedTarget(null)} className="absolute top-6 left-6 p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-all">
                      <X className="w-6 h-6" />
                   </button>
                   
                   <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-8">
                      <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-200">
                         {selectedTarget.handle.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <h4 className="text-2xl font-black text-slate-900" dir="ltr">@{selectedTarget.handle}</h4>
                         <p className="text-sm text-slate-400 font-bold mt-1">نمایش اسناد پایش شده برای این هدف</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {loadingDetails ? (
                        <div className="py-20 text-center">
                           <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                           <p className="text-sm text-slate-400 mt-4 font-bold">در حال بازیابی پرونده اسناد...</p>
                        </div>
                      ) : targetSubmissions.length === 0 ? (
                        <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                           <p className="text-sm font-bold text-slate-400">سندی برای این هدف یافت نشد.</p>
                        </div>
                      ) : (
                        targetSubmissions.map((sub) => (
                           <div key={sub.id} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row gap-6 hover:border-indigo-200 transition-colors group">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                 <FileText className="w-6 h-6 text-slate-400" />
                              </div>
                              <div className="flex-1 space-y-4">
                                 <div className="flex justify-between items-center">
                                    <div className="flex gap-3 items-center">
                                       <span className="text-[10px] font-black bg-white px-2 py-1 rounded border border-slate-100 uppercase tracking-widest" dir="ltr">Doc ID: {sub.id.slice(0, 8)}</span>
                                       <span className="text-xs text-slate-400 font-bold">{new Date(sub.created_at || '').toLocaleDateString('fa-IR')}</span>
                                    </div>
                                    {renderStatusBadge(sub.status)}
                                 </div>
                                 <p className="text-sm font-black text-slate-800 leading-relaxed">{sub.summary}</p>
                                 <div className="bg-white/80 p-4 rounded-2xl border border-slate-100 shadow-inner">
                                    <p className="text-xs text-slate-500 font-medium leading-loose italic">« {sub.extracted_text || 'متن استخراج نشده'} »</p>
                                 </div>
                                 <div className="flex gap-2">
                                    <span className="text-[9px] font-black bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100">{sub.ai_category || 'بدون دسته‌بندی'}</span>
                                 </div>
                              </div>
                           </div>
                        ))
                      )}
                   </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'intelligence' && (
             <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 sm:p-12">
                   <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Clock className="w-6 h-6" />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-slate-800">مانیتورینگ صف پردازش</h3>
                            <p className="text-xs text-slate-400 font-bold mt-1">اسناد در صف انتظار هوش مصنوعی</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-amber-600">{stats.pendingItems}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase">Items In Queue</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      {recentSubmissions.filter(s => s.status === 'pending' || s.status === 'failed' || s.status === 'processing').length === 0 ? (
                        <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                           <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                           <p className="text-sm font-black text-slate-500">تمامی اسناد با موفقیت پردازش شده‌اند.</p>
                        </div>
                      ) : (
                        recentSubmissions.filter(s => s.status !== 'completed').map((s) => (
                           <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className={`w-2 h-2 rounded-full ${s.status === 'pending' ? 'bg-amber-500 animate-pulse' : s.status === 'processing' ? 'bg-indigo-500 animate-spin' : 'bg-red-500'}`}></div>
                                 <div>
                                    <p className="text-xs font-black text-slate-700 font-mono" dir="ltr">ID: #{s.id.slice(0, 12)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">زمان ثبت: {new Date(s.created_at || '').toLocaleTimeString('fa-IR')}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 {renderStatusBadge(s.status)}
                                 <button className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all">
                                    <RefreshCw className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="bg-[#0F172A] rounded-[3rem] p-10 sm:p-16 text-white relative overflow-hidden shadow-2xl">
                   <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 mb-8 backdrop-blur-md">
                         <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Advanced AI Engine</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">اسکن عمیق الگو (Deep Scan)</h2>
                      <p className="text-sm sm:text-lg text-slate-400 font-medium leading-relaxed mb-10 max-w-2xl">
                         تحلیل تجمیعی کل تاریخچه متنی یک هدف برای شناسایی تغییرات لحن و الگوهای تکرارشونده.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                        <div className="flex-1 relative group">
                           <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                           <input type="text" placeholder="آیدی هدف..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-left font-mono" dir="ltr" />
                        </div>
                        <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                           <PlayCircle className="w-5 h-5" /> شروع تحلیل
                        </button>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'team' && (
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up flex flex-col">
               <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">مدیریت رصدگران</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">نظارت بر عملکرد و دسترسی پرسنل</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg hover:bg-black transition-all">
                  <UserPlus className="w-4 h-4" /> دعوت رصدگر جدید
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[750px]">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">شناسه UID</th>
                      <th className="px-8 py-5 text-center">شناسه Personnel ID</th>
                      <th className="px-8 py-5">سطح دسترسی</th>
                      <th className="px-8 py-5 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {teamMembers.map((member) => (
                      <tr key={member.user_id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 font-black">
                                 {member.user_id.slice(0, 1).toUpperCase()}
                              </div>
                              <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md" dir="ltr">
                                {member.user_id.slice(0, 15)}...
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center font-black text-indigo-600 text-xs">
                           {member.personnel_code || '---'}
                        </td>
                        <td className="px-8 py-6">
                           {member.role === 'admin' ? (
                             <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-purple-100 flex items-center gap-2 w-max">
                               <ShieldAlert className="w-4 h-4" /> مدیر راهبر
                             </span>
                           ) : (
                             <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-emerald-100 flex items-center gap-2 w-max">
                               <Activity className="w-4 h-4" /> رصدگر میدانی
                             </span>
                           )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button 
                            onClick={() => handleRoleChange(member.user_id, member.role)}
                            className="text-[10px] font-black px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                          >
                            تغییر نقش
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 sm:p-12 text-emerald-400 font-mono text-xs shadow-2xl relative">
               <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                  <Terminal className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-base font-black text-white">SECURITY ACCESS LOG</h3>
               </div>
               <div className="space-y-4">
                 <p><span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> <span className="text-blue-400">[SYSTEM]</span> Ready. API connection to Gemini established.</p>
                 <p><span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> <span className="text-purple-400">[DATABASE]</span> Real-time WebSocket listening on submissions.</p>
                 <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-500 italic font-sans">در انتظار رویدادهای جدید شبکه...</span>
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