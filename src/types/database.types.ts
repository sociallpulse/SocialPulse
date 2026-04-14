export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: {
          user_id: string
          role: 'admin' | 'observer'
          created_at: string | null
        }
        Insert: {
          user_id: string
          role?: 'admin' | 'observer'
          created_at?: string | null
        }
        Update: {
          user_id?: string
          role?: 'admin' | 'observer'
          created_at?: string | null
        }
      }
      instagram_profiles: {
        Row: {
          id: string
          handle: string
          full_name: string | null
          avatar_url: string | null
          last_analysis_at: string | null
          behavioral_summary: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          handle: string
          full_name?: string | null
          avatar_url?: string | null
          last_analysis_at?: string | null
          behavioral_summary?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          handle?: string
          full_name?: string | null
          avatar_url?: string | null
          last_analysis_at?: string | null
          behavioral_summary?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      submissions: {
        Row: {
          id: string
          observer_id: string | null
          profile_id: string | null
          image_path: string | null
          extracted_text: string | null
          ai_category: string | null
          summary: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | null
          temp_image_data: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          observer_id?: string | null
          profile_id?: string | null
          image_path?: string | null
          extracted_text?: string | null
          ai_category?: string | null
          summary?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          temp_image_data?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          observer_id?: string | null
          profile_id?: string | null
          image_path?: string | null
          extracted_text?: string | null
          ai_category?: string | null
          summary?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          temp_image_data?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }
      behavioral_insights: {
        Row: {
          id: string
          profile_id: string | null
          pattern_description: string
          trend_score: number | null
          analysis_date: string | null
        }
        Insert: {
          id?: string
          profile_id?: string | null
          pattern_description: string
          trend_score?: number | null
          analysis_date?: string | null
        }
        Update: {
          id?: string
          profile_id?: string | null
          pattern_description?: string
          trend_score?: number | null
          analysis_date?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}