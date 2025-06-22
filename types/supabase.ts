// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      reservations: {
        Row: {
          id: string
          customer_name: string
          program_type: string
          start_date: string
          end_date: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_price: number
          participants: number
          phone: string
          email: string | null
          special_requests: string | null
          payment_status: 'pending' | 'partial' | 'completed'
          referrer: string | null
          confirmed_date: string | null
          created_at: string
          updated_at: string | null
          adults: number | null
          children: number | null
          // BBQ 관련
          bbq_grill_count: number | null
          bbq_meat_set_count: number | null
          bbq_full_set_count: number | null
          // 식사 관련
          meal_breakfast_count: number | null
          // 교통 관련
          transport_needs_bus: boolean | null
          // 체험 관련
          experience_farm_count: number | null
          // 기타 서비스
          extra_laundry_count: number | null
        }
        Insert: {
          id?: string
          customer_name: string
          program_type: string
          start_date: string
          end_date: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_price: number
          participants: number
          phone: string
          email?: string | null
          special_requests?: string | null
          payment_status?: 'pending' | 'partial' | 'completed'
          referrer?: string | null
          confirmed_date?: string | null
          created_at?: string
          updated_at?: string | null
          adults?: number | null
          children?: number | null
          bbq_grill_count?: number | null
          bbq_meat_set_count?: number | null
          bbq_full_set_count?: number | null
          meal_breakfast_count?: number | null
          transport_needs_bus?: boolean | null
          experience_farm_count?: number | null
          extra_laundry_count?: number | null
        }
        Update: {
          id?: string
          customer_name?: string
          program_type?: string
          start_date?: string
          end_date?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_price?: number
          participants?: number
          phone?: string
          email?: string | null
          special_requests?: string | null
          payment_status?: 'pending' | 'partial' | 'completed'
          referrer?: string | null
          confirmed_date?: string | null
          created_at?: string
          updated_at?: string | null
          adults?: number | null
          children?: number | null
          bbq_grill_count?: number | null
          bbq_meat_set_count?: number | null
          bbq_full_set_count?: number | null
          meal_breakfast_count?: number | null
          transport_needs_bus?: boolean | null
          experience_farm_count?: number | null
          extra_laundry_count?: number | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          birth_date: string | null
          role: 'user' | 'admin' | 'super_admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          birth_date?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          birth_date?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_permissions: {
        Row: {
          id: string
          user_id: string
          permission_type: string
          can_read: boolean
          can_write: boolean
          can_delete: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          permission_type: string
          can_read?: boolean
          can_write?: boolean
          can_delete?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          permission_type?: string
          can_read?: boolean
          can_write?: boolean
          can_delete?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type ReservationRow = Database['public']['Tables']['reservations']['Row']
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert']
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update']

export type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type AdminPermissionRow = Database['public']['Tables']['admin_permissions']['Row']
export type AdminPermissionInsert = Database['public']['Tables']['admin_permissions']['Insert']
export type AdminPermissionUpdate = Database['public']['Tables']['admin_permissions']['Update'] 