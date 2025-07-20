"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth as useMainAuth } from '@/hooks/use-auth'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  user: User | null
  profile: any
  session: Session | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithOAuth: (provider: 'google' | 'kakao') => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  // 메인 사이트의 인증 상태 사용
  const mainAuth = useMainAuth()
  
  // 관리자 권한 체크를 위한 로컬 상태
  const [isAdminVerified, setIsAdminVerified] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)

  // 관리자 권한 확인
  useEffect(() => {
    const checkAdminPermissions = async () => {
      if (!mainAuth.loading && mainAuth.user && mainAuth.profile) {
        const hasAdminRole = mainAuth.profile.role === 'admin' || mainAuth.profile.role === 'super_admin'
        
        if (hasAdminRole) {
          console.log('✅ 관리자 권한 확인됨:', mainAuth.profile.role)
          setIsAdminVerified(true)
        } else {
          console.error('❌ 관리자 권한 없음:', mainAuth.profile.role)
          // 권한이 없으면 메인 사이트로 리다이렉트
          router.push('/')
          return
        }
      }
      setIsCheckingAdmin(false)
    }

    checkAdminPermissions()
  }, [mainAuth.loading, mainAuth.user, mainAuth.profile, router])

  // 인증 상태에 따른 리다이렉트
  useEffect(() => {
    if (!isCheckingAdmin && pathname?.startsWith('/admin')) {
      if (!mainAuth.isAuthenticated && pathname !== '/admin/login') {
        // 메인 로그인 페이지로 리다이렉트 (관리자 로그인 대신)
        router.push('/login?redirect=/admin/dashboard')
      } else if (mainAuth.isAuthenticated && isAdminVerified && pathname === '/admin/login') {
        router.push('/admin/dashboard')
      }
    }
  }, [mainAuth.isAuthenticated, isCheckingAdmin, isAdminVerified, pathname, router])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // 메인 사이트의 로그인 함수 사용
    return await mainAuth.signIn(email, password)
  }

  const loginWithOAuth = async (provider: 'google' | 'kakao'): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await mainAuth.signInWithGoogle()
      if (result.error) {
        return { success: false, error: result.error.message }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: `${provider} 로그인 중 오류가 발생했습니다.` }
    }
  }

  const logout = async () => {
    await mainAuth.signOut()
    router.push('/')
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const result = await mainAuth.resetPassword(email)
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    return { success: true }
  }

  const checkAuth = async () => {
    // 메인 인증 상태는 자동으로 관리됨
    return
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated: mainAuth.isAuthenticated && isAdminVerified,
      isLoading: mainAuth.loading || isCheckingAdmin,
      isAdmin: mainAuth.isAdmin,
      isSuperAdmin: mainAuth.isSuperAdmin,
      user: mainAuth.user,
      profile: mainAuth.profile,
      session: mainAuth.session,
      login,
      loginWithOAuth,
      logout,
      resetPassword,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 