import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// مدل Gemini — در صورت نیاز مدل ID را اینجا تغییر دهید
const GEMINI_MODEL = 'gemini-2.5-flash-preview-05-20'

const PROMPT = `این تصویر یک اسکرین‌شات از اینستاگرام است. لطفاً تحلیل زیر را انجام بده:

1. تمام متن موجود در تصویر را کلمه به کلمه استخراج کن.
2. اگر نام کاربری (آیدی) اینستاگرام در تصویر مشخص است، آن را شناسایی کن (بدون @).
3. محتوا را دسته‌بندی کن: سیاسی | فرهنگی-هنری | ورزشی | روزمره | طنز | اخبار | تبلیغاتی | سایر
4. یک خلاصه یک جمله‌ای فارسی بنویس.

پاسخ را فقط در این فرمت JSON بده:
{
  "extracted_text": "متن کامل",
  "instagram_handle": "آیدی یا null",
  "ai_category": "دسته‌بندی",
  "summary": "خلاصه"
}`

interface SubmissionRecord {
  id: string
  temp_image_data: string | null
  status: string | null
  observer_id: string | null
}

interface GeminiResult {
  extracted_text: string
  instagram_handle: string | null
  ai_category: string
  summary: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  let submissionId: string | null = null

  try {
    const body = await req.json()
    const record: SubmissionRecord = body.record ?? body

    submissionId = record.id ?? null

    // بدون داده Base64 کاری نداریم
    if (!submissionId || !record.temp_image_data) {
      return json({ message: 'no image data' }, 200)
    }

    // Optimistic lock: فقط اگر هنوز pending باشد به processing تغییر بده
    const { error: lockErr } = await supabase
      .from('submissions')
      .update({ status: 'processing' })
      .eq('id', submissionId)
      .eq('status', 'pending')

    if (lockErr) console.error('lock error:', lockErr.message)

    // ──────────────────────────────────────────
    // فراخوانی Gemini API
    // ──────────────────────────────────────────
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: 'image/jpeg', data: record.temp_image_data } },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Gemini ${geminiRes.status}: ${errText}`)
    }

    const geminiData = await geminiRes.json()
    const rawText: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

    let result: GeminiResult
    try {
      result = JSON.parse(rawText)
    } catch {
      result = { extracted_text: rawText, instagram_handle: null, ai_category: 'سایر', summary: 'متن استخراج شد.' }
    }

    // ──────────────────────────────────────────
    // Upsert instagram_profiles اگر آیدی یافت شد
    // ──────────────────────────────────────────
    let profileId: string | null = null
    const rawHandle = result.instagram_handle
    if (rawHandle && rawHandle !== 'null' && rawHandle.trim()) {
      const handle = rawHandle.replace('@', '').toLowerCase().trim()
      if (handle) {
        const { data: prof, error: profErr } = await supabase
          .from('instagram_profiles')
          .upsert(
            { handle, last_analysis_at: new Date().toISOString() },
            { onConflict: 'handle' }
          )
          .select('id')
          .single()

        if (profErr) console.error('profile upsert error:', profErr.message)
        else profileId = prof?.id ?? null
      }
    }

    // ──────────────────────────────────────────
    // ذخیره نتایج + پاکسازی temp_image_data (No-Storage Policy)
    // ──────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from('submissions')
      .update({
        extracted_text: result.extracted_text || null,
        ai_category:    result.ai_category || 'سایر',
        summary:        result.summary || null,
        profile_id:     profileId,
        status:         'completed',
        temp_image_data: null,          // حذف تصویر طبق سیاست No-Storage
      })
      .eq('id', submissionId)

    if (updateErr) throw updateErr

    return json({ success: true, submissionId, profileId }, 200)

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[process-image] error (id=${submissionId}):`, msg)

    if (submissionId) {
      await supabase
        .from('submissions')
        .update({ status: 'failed', temp_image_data: null })
        .eq('id', submissionId)
        .in('status', ['pending', 'processing'])
    }

    return json({ error: msg }, 500)
  }
})

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
