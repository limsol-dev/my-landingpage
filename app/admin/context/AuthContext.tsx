"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth as useSupabaseAuth } from '@/hooks/use-auth'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  user: any
  profile: any
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    user, 
    profile, 
    loading, 
    signIn, 
    signOut,
    isAdmin: supabaseIsAdmin,
    isSuperAdmin: supabaseIsSuperAdmin
  } = useSupabaseAuth()

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Supabase Auth 상태를 로컬 상태와 동기화
  useEffect(() => {
    if (user && profile) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [user, profile])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('관리자 로그인 오류:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('관리자 로그인 예외:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setIsAuthenticated(false)
      router.push('/admin/login')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const checkAuth = async () => {
    // Supabase Auth 훅에서 자동으로 처리됨
  }

  // 인증되지 않은 상태에서 관리자 페이지 접근 시 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isAuthenticated, loading, pathname, router])

  // 관리자 권한이 없는 사용자 리다이렉트
  useEffect(() => {
    if (!loading && isAuthenticated && profile && !supabaseIsAdmin && pathname !== '/admin/login') {
      console.warn('관리자 권한이 없는 사용자의 관리자 페이지 접근 시도')
      router.push('/') // 메인 페이지로 리다이렉트
    }
  }, [isAuthenticated, loading, profile, supabaseIsAdmin, pathname, router])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading: loading,
      isAdmin: supabaseIsAdmin,
      isSuperAdmin: supabaseIsSuperAdmin,
      user,
      profile,
      login,
      logout,
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