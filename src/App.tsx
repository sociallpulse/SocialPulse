import React from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/auth/LoginPage';
import { UploadPage } from './pages/observer/UploadPage';
// از آنجایی که فایل داشبورد در مسیر زیر قرار دارد
import { AdminDashboard } from './pages/admin/Dashboard';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  const { user, role, loading } = useAuth();

  // اسکرین لودینگ زیبا هنگام بالا آمدن سایت و بررسی نشست کاربری (Session)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-6" dir="rtl">
        <div className="relative flex items-center justify-center">
          {/* افکت نوری پس‌زمینه */}
          <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
          {/* آیکون در حال پرش */}
          <Activity className="w-16 h-16 text-purple-500 animate-bounce relative z-10" />
        </div>
        <h1 className="text-white text-xl font-bold tracking-widest animate-pulse font-sans">
          در حال احراز هویت...
        </h1>
      </div>
    );
  }

  // ۱. اگر کاربر اصلاً لاگین نکرده باشد، صفحه ورود (LoginPage) نمایش داده می‌شود.
  // این صفحه خودش شامل طراحی شیشه‌ای و مدرن است.
  if (!user) {
    return <LoginPage />;
  }

  // ۲. مسیریابی بر اساس نقش کاربری (Role-Based Routing)
  // اگر نقش کاربر 'admin' باشد، به داشبورد مدیریتی می‌رود.
  // در غیر این صورت (نقش 'observer' یا هر نقش دیگر)، به صفحه آپلود می‌رود.
  return (
    <>
      {role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <UploadPage />
      )}
    </>
  );
};

export default App;