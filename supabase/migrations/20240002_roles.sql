-- فایل مایگریشن 2: تنظیمات امنیت سطح ردیف (RLS) و دسترسی‌ها

-- تابعی برای بررسی اینکه آیا کاربر فعلی مدیر است یا خیر
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- فعال‌سازی RLS برای تمام جداول
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_insights ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- سیاست‌های جدول User Roles (نقش‌ها)
-- ==========================================
-- کاربران فقط می‌توانند نقش خودشان را ببینند
CREATE POLICY "Users can view own role" 
ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- مدیران می‌توانند همه نقش‌ها را ببینند
CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT USING (public.is_admin());

-- ==========================================
-- سیاست‌های جدول Instagram Profiles (پروفایل‌ها)
-- ==========================================
-- همه کاربران احراز هویت شده (رصدگر و مدیر) می‌توانند لیست پروفایل‌ها را ببینند
CREATE POLICY "Authenticated users can view profiles" 
ON public.instagram_profiles FOR SELECT USING (auth.role() = 'authenticated');

-- فقط مدیران اجازه ویرایش دستی پروفایل‌ها را دارند (Edge Function به صورت خودکار با دسترسی سرور این کار را می‌کند)
CREATE POLICY "Admins can update profiles" 
ON public.instagram_profiles FOR UPDATE USING (public.is_admin());

-- ==========================================
-- سیاست‌های جدول Submissions (اسکرین‌شات‌ها)
-- ==========================================
-- رصدگران فقط می‌توانند اسکرین‌شات‌های ارسالی خودشان را ببینند
CREATE POLICY "Observers can view own submissions" 
ON public.submissions FOR SELECT USING (auth.uid() = observer_id);

-- رصدگران می‌توانند اسکرین‌شات جدید ثبت کنند (شناسه خودشان باید به عنوان observer_id ثبت شود)
CREATE POLICY "Observers can insert submissions" 
ON public.submissions FOR INSERT WITH CHECK (auth.uid() = observer_id);

-- مدیران می‌توانند تمامی اسکرین‌شات‌های ارسالی توسط همه را ببینند
CREATE POLICY "Admins can view all submissions" 
ON public.submissions FOR SELECT USING (public.is_admin());

-- ==========================================
-- سیاست‌های جدول Behavioral Insights (الگوهای رفتاری)
-- ==========================================
-- همه کاربران می‌توانند تحلیل‌های رفتاری را مشاهده کنند
CREATE POLICY "Authenticated users can view insights" 
ON public.behavioral_insights FOR SELECT USING (auth.role() = 'authenticated');

-- فقط مدیران می‌توانند به صورت دستی تحلیل رفتاری را حذف یا ویرایش کنند
CREATE POLICY "Admins can manage insights" 
ON public.behavioral_insights FOR ALL USING (public.is_admin());