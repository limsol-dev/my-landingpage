"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, authHelpers, dbHelpers, UserProfile } from '@/lib/supabase'

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  // 상태
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  
  // 로그인/회원가입
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<AuthResult>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  
  // 비밀번호 재설정
  resetPassword: (email: string) => Promise<{ error: any }>
  
  // 프로필 관리
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  
  // 권한 확인
  isAdmin: boolean
  isSuperAdmin: boolean
  isAuthenticated: boolean
}

interface AuthResult {
  user: User | null
  session: Session | null
  error: any
}

interface SignUpOptions {
  username?: string
  full_name?: string
  phone?: string
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // 초기 인증 상태 확인
  useEffect(() => {
    initializeAuth()
  }, [])

  // 인증 상태 변경 리스너
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔐 Auth 상태 변경:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 초기 인증 상태 초기화
  const initializeAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('세션 초기화 오류:', error)
      } else if (session) {
        setSession(session)
        setUser(session.user)
        await loadUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('인증 초기화 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 사용자 프로필 로드
  const loadUserProfile = async (userId: string) => {
    try {
      const { profile, error } = await dbHelpers.getUserProfile(userId)
      
      if (error) {
        console.error('프로필 로드 오류:', error)
      } else if (profile) {
        setProfile(profile as UserProfile)
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error)
    }
  }

  // 로그인
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setLoading(true)
      const result = await authHelpers.signInWithPassword(email, password)
      
      if (result.error) {
        console.error('로그인 오류:', result.error)
      } else if (result.user) {
        console.log('✅ 로그인 성공:', result.user.email)
      }
      
      return result
    } catch (error) {
      console.error('로그인 실패:', error)
      return { user: null, session: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 회원가입
  const signUp = async (
    email: string, 
    password: string, 
    options?: SignUpOptions
  ): Promise<AuthResult> => {
    try {
      setLoading(true)
      const result = await authHelpers.signUpWithPassword(email, password, options)
      
      if (result.error) {
        console.error('회원가입 오류:', result.error)
      } else if (result.user) {
        console.log('✅ 회원가입 성공:', result.user.email)
      }
      
      return result
    } catch (error) {
      console.error('회원가입 실패:', error)
      return { user: null, session: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 구글 OAuth 로그인
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await authHelpers.signInWithGoogle()
      return result
    } catch (error) {
      console.error('구글 로그인 실패:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      setLoading(true)
      const result = await authHelpers.signOut()
      
      if (!result.error) {
        setUser(null)
        setProfile(null)
        setSession(null)
        console.log('✅ 로그아웃 성공')
      }
      
      return result
    } catch (error) {
      console.error('로그아웃 실패:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // 비밀번호 재설정
  const resetPassword = async (email: string) => {
    try {
      const result = await authHelpers.resetPassword(email)
      return result
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error)
      return { error }
    }
  }

  // 프로필 업데이트
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: '사용자가 로그인되어 있지 않습니다.' }
      }
      
      const result = await dbHelpers.updateUserProfile(user.id, updates)
      
      if (!result.error && result.profile) {
        setProfile(result.profile as UserProfile)
      }
      
      return result
    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
      return { error }
    }
  }

  // 권한 확인 헬퍼
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  const isSuperAdmin = profile?.role === 'super_admin'
  const isAuthenticated = !!user && !!session

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    isAdmin,
    isSuperAdmin,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 훅 사용
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서만 사용할 수 있습니다.')
  }
  return context
} 