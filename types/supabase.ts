// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfileRow
        Insert: UserProfileInsert
        Update: UserProfileUpdate
      }
      reservations: {
        Row: ReservationRow
        Insert: ReservationInsert
        Update: ReservationUpdate
      }
    }
  }
}

// User Profile Types
export interface UserProfileRow {
  id: string
  username: string
  email: string
  full_name: string | null
  phone: string | null
  birth_date: string | null
  profile_image: string | null
  bio: string | null
  role: 'user' | 'group_leader' | 'admin' | 'super_admin'
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
  login_count: number
}

export interface UserProfileInsert {
  id: string
  username: string
  email: string
  full_name?: string | null
  phone?: string | null
  birth_date?: string | null
  profile_image?: string | null
  bio?: string | null
  role?: 'user' | 'group_leader' | 'admin' | 'super_admin'
  is_active?: boolean
  email_verified?: boolean
  last_login_at?: string | null
  login_count?: number
}

export interface UserProfileUpdate {
  username?: string
  email?: string
  full_name?: string | null
  phone?: string | null
  birth_date?: string | null
  profile_image?: string | null
  bio?: string | null
  role?: 'user' | 'group_leader' | 'admin' | 'super_admin'
  is_active?: boolean
  email_verified?: boolean
  updated_at?: string
  last_login_at?: string | null
  login_count?: number
}

// Reservation Types
export interface ReservationRow {
  id: string
  customer_name: string
  customer_email: string
  phone: string
  program_type: string
  start_date: string
  end_date: string
  adults: number
  children: number
  participants: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'partial' | 'completed'
  confirmed_date: string | null
  special_requests: string | null
  referrer: string | null
  created_at: string
  updated_at: string
  
  // BBQ 옵션
  bbq_grill_count: number | null
  bbq_meat_set_count: number | null
  bbq_full_set_count: number | null
  
  // 식사 옵션
  meal_breakfast_count: number | null
  
  // 교통 옵션
  transport_needs_bus: boolean | null
  
  // 체험 옵션
  experience_farm_count: number | null
  
  // 추가 서비스
  extra_laundry_count: number | null
}

export interface ReservationInsert {
  customer_name: string
  customer_email: string
  phone: string
  program_type: string
  start_date: string
  end_date: string
  adults: number
  children: number
  participants: number
  total_price: number
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status?: 'pending' | 'partial' | 'completed'
  confirmed_date?: string | null
  special_requests?: string | null
  referrer?: string | null
  
  // BBQ 옵션
  bbq_grill_count?: number | null
  bbq_meat_set_count?: number | null
  bbq_full_set_count?: number | null
  
  // 식사 옵션
  meal_breakfast_count?: number | null
  
  // 교통 옵션
  transport_needs_bus?: boolean | null
  
  // 체험 옵션
  experience_farm_count?: number | null
  
  // 추가 서비스
  extra_laundry_count?: number | null
}

export interface ReservationUpdate {
  customer_name?: string
  customer_email?: string
  phone?: string
  program_type?: string
  start_date?: string
  end_date?: string
  adults?: number
  children?: number
  participants?: number
  total_price?: number
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status?: 'pending' | 'partial' | 'completed'
  confirmed_date?: string | null
  special_requests?: string | null
  referrer?: string | null
  updated_at?: string
  
  // BBQ 옵션
  bbq_grill_count?: number | null
  bbq_meat_set_count?: number | null
  bbq_full_set_count?: number | null
  
  // 식사 옵션
  meal_breakfast_count?: number | null
  
  // 교통 옵션
  transport_needs_bus?: boolean | null
  
  // 체험 옵션
  experience_farm_count?: number | null
  
  // 추가 서비스
  extra_laundry_count?: number | null
} 