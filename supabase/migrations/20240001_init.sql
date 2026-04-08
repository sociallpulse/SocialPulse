-- فایل مایگریشن 1: ایجاد ساختار جداول پایگاه داده SocialPulse

-- فعال‌سازی افزونه UUID برای تولید شناسه‌های یکتا
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول نقش‌های کاربری (متصل به سیستم احراز هویت Supabase)
CREATE TABLE public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'observer')) DEFAULT 'observer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.user_roles IS 'نگهداری نقش‌های کاربری: مدیر (admin) و رصدگر (observer)';

-- 2. جدول پروفایل‌های اینستاگرام (شناسایی شده توسط هوش مصنوعی)
CREATE TABLE public.instagram_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle TEXT UNIQUE NOT NULL, -- آیدی اینستاگرام (مثلاً @username)
    full_name TEXT,
    avatar_url TEXT,
    last_analysis_at TIMESTAMPTZ, -- تاریخ آخرین باری که الگوی رفتاری شخص بررسی شده
    behavioral_summary TEXT,      -- خلاصه وضعیت رفتاری شخص
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.instagram_profiles IS 'اطلاعات تجمیعی هر پروفایل اینستاگرام که در اسکرین‌شات‌ها یافت شده است';

-- 3. جدول اسکرین‌شات‌های ارسالی (Submissions)
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- کاربری که عکس را فرستاده
    profile_id UUID REFERENCES public.instagram_profiles(id) ON DELETE CASCADE, -- آیدی اینستاگرامی که در عکس پیدا شده
    image_path TEXT NOT NULL,      -- مسیر ذخیره عکس در Supabase Storage
    extracted_text TEXT,           -- متن خام استخراج شده از عکس
    ai_category TEXT,              -- دسته‌بندی موضوعی (مثلاً سیاسی، روزمره، طنز)
    summary TEXT,                  -- خلاصه متن تصویر
    metadata JSONB,                -- اطلاعات اضافی (مثل مختصات متن در تصویر)
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.submissions IS 'رکوردهای مربوط به هر اسکرین‌شات آپلود شده و پردازش شده';

-- 4. جدول تحلیل‌های رفتاری (Behavioral Insights)
CREATE TABLE public.behavioral_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.instagram_profiles(id) ON DELETE CASCADE,
    pattern_description TEXT NOT NULL, -- توضیح الگو (مثلاً: "تغییر لحن از رسمی به عامیانه")
    trend_score NUMERIC(3, 2),         -- نمره تغییر روند (مثلاً 0 تا 5)
    analysis_date TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.behavioral_insights IS 'تاریخچه تحلیل‌های دوره‌ای انجام شده روی یک پروفایل برای کشف الگو';

-- ایجاد تابع و تریگر برای بروزرسانی خودکار فیلد updated_at در جدول پروفایل‌ها
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_instagram_profiles_updated_at
    BEFORE UPDATE ON public.instagram_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();