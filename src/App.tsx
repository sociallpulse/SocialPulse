import React from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/auth/LoginPage';
import { UploadPage } from './pages/observer/UploadPage';
import { AdminDashboard } from './pages/admin/Dashboard';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  const { user, role, loading } = useAuth();

  // اسکرین لودینگ زیبا هنگام بالا آمدن سایت و بررسی نشست
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-6" dir="rtl">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
          <Activity className="w-16 h-16 text-purple-500 animate-bounce" />
        </div>
        <h1 className="text-white text-xl font-bold tracking-widest animate-pulse font-sans">در حال احراز هویت...</h1>
      </div>
    );
  }

  // اگر لاگین نیست، صفحه ورود نمایش داده شود
  if (!user) return <LoginPage />;

  // مسیریابی بر اساس نقش کاربری (ادمین به داشبورد و رصدگر به فرم آپلود)
  return role === 'admin' ? <AdminDashboard /> : <UploadPage />;
};

export default App;