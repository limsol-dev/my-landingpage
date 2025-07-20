import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// 환경변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 환경변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Lazy 싱글톤 패턴으로 클라이언트 생성
let _supabaseClient: ReturnType<typeof createClient<Database>> | null = null
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

// 클라이언트 사이드 Supabase 클라이언트 (Lazy 싱글톤)
export const supabase = (() => {
  if (!_supabaseClient) {
    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-client-info': 'snail-pension'
        }
      }
    })
    console.log('✅ Supabase 클라이언트가 초기화되었습니다.')
  }
  return _supabaseClient
})()

// 서버 사이드 관리자 클라이언트 (Lazy 싱글톤)
export const supabaseAdmin = (() => {
  if (!supabaseServiceKey) return null
  
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return _supabaseAdmin
})()

// 타입 정의
export interface UserProfile {
  id: string
  email: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  birth_date: string | null
  gender: 'male' | 'female' | 'other' | null
  role: 'user' | 'admin' | 'super_admin'
  oauth_provider: string | null
  oauth_provider_id: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: {
    id: string
    email: string
    user_metadata: Record<string, any>
    created_at: string
  }
}

// 인증 관련 유틸리티 함수들
export const authHelpers = {
  // 현재 사용자 가져오기
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    
    // 사용자 프로필 정보도 함께 가져오기
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return {
      ...user,
      profile
    }
  },

  // 이메일/패스워드 로그인
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return { user: null, session: null, error }
    }
    
    // 로그인 시간 업데이트
    if (data.user) {
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id)
    }
    
    return { user: data.user, session: data.session, error: null }
  },

  // 이메일/패스워드 회원가입
  async signUpWithPassword(
    email: string, 
    password: string, 
    options?: {
      username?: string
      full_name?: string
      phone?: string
    }
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: options?.username,
          full_name: options?.full_name,
          phone: options?.phone
        }
      }
    })
    
    return { user: data.user, session: data.session, error }
  },

  // 구글 OAuth 로그인
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    return { data, error }
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 패스워드 재설정
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    return { data, error }
  }
}

// 데이터베이스 헬퍼 함수들
export const dbHelpers = {
  // 사용자 프로필 생성
  async createUserProfile(userId: string, profileData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        ...profileData
      })
      .select()
      .single()
    
    return { profile: data, error }
  },

  // 사용자 프로필 업데이트
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    return { profile: data, error }
  },

  // 사용자 프로필 조회
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { profile: data, error }
  },

  // 사용자명 중복 확인
  async checkUsernameAvailability(username: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single()
    
    // 데이터가 없으면 사용 가능
    return { available: !data && !error, error }
  }
} 