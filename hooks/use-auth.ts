"use client"

import { useEffect, useState } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfileRow } from '@/types/supabase'

export interface AuthUser extends User {
  profile?: UserProfileRow
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfileRow | null>(null)

  useEffect(() => {
    // 현재 세션 가져오기
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('세션 가져오기 오류:', error)
      } else {
        setSession(session)
        setUser(session?.user || null)
        
        // 사용자 프로필 가져오기
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      }
      setLoading(false)
    }

    getSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth 상태 변경:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Supabase 연결 테스트
  const testSupabaseConnection = async () => {
    try {
      console.log('Supabase 연결 테스트 시작...')
      
      // 간단한 쿼리로 연결 테스트
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      console.log('연결 테스트 결과:', { data, error })
      
      if (error) {
        console.error('Supabase 연결 실패:', error)
        return false
      }
      
      console.log('Supabase 연결 성공!')
      return true
    } catch (error) {
      console.error('Supabase 연결 테스트 예외:', error)
      return false
    }
  }

  // 사용자 프로필 가져오기
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('프로필 가져오기 시작:', userId)
      
      // 먼저 Supabase 연결 테스트
      const isConnected = await testSupabaseConnection()
      if (!isConnected) {
        console.error('Supabase 연결 실패로 프로필을 가져올 수 없습니다')
        return null
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('프로필 조회 결과:', { data, error })

      if (error) {
        console.error('프로필 가져오기 오류:', error)
        
        // 테이블이 존재하지 않는 경우
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.error('user_profiles 테이블이 존재하지 않습니다!')
          alert('데이터베이스 설정이 완료되지 않았습니다. Supabase Dashboard에서 user_profiles 테이블을 생성해주세요.')
          return null
        }
        
        // 프로필이 존재하지 않는 경우 자동 생성
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('프로필이 존재하지 않음. 새 프로필 생성 중...')
          return await createUserProfile(userId)
        }
        
        // 권한 문제인 경우
        if (error.code === '42501' || error.message?.includes('permission')) {
          console.error('데이터베이스 접근 권한이 없습니다!')
          alert('데이터베이스 접근 권한 문제입니다. RLS 정책을 확인해주세요.')
          return null
        }
        
        return null
      }

      if (data) {
        console.log('프로필 설정:', data)
        setProfile(data)
        return data
      }

      // 데이터가 없으면 새 프로필 생성
      console.log('데이터가 없음, 새 프로필 생성...')
      return await createUserProfile(userId)
    } catch (error) {
      console.error('프로필 가져오기 예외:', error)
      return null
    }
  }

  // 사용자 프로필 생성
  const createUserProfile = async (userId: string) => {
    try {
      console.log('프로필 생성 시작:', userId)
      
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      
      if (!user) {
        console.error('사용자 정보를 가져올 수 없습니다')
        return null
      }

      console.log('사용자 정보:', user)

      const profileData = {
        id: userId,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자',
        phone: user.user_metadata?.phone || null,
        birth_date: user.user_metadata?.birth_date || null,
        role: 'user' as const
      }

      console.log('생성할 프로필 데이터:', profileData)

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      console.log('프로필 생성 결과:', { data, error })

      if (error) {
        console.error('프로필 생성 오류:', error)
        // 이미 존재하는 경우라면 다시 조회 시도
        if (error.code === '23505') { // unique constraint violation
          console.log('프로필이 이미 존재함, 다시 조회 시도...')
          const { data: existingData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()
          
          if (existingData) {
            console.log('기존 프로필 조회 성공:', existingData)
            setProfile(existingData)
            return existingData
          }
        }
        return null
      }

      if (data) {
        console.log('프로필 생성 성공:', data)
        setProfile(data)
        return data
      }

      console.error('프로필 생성 실패: 데이터가 없음')
      return null
    } catch (error) {
      console.error('프로필 생성 예외:', error)
      return null
    }
  }

  // 로그인
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return { user: data.user, session: data.session, error: null }
    } catch (error: any) {
      console.error('로그인 오류:', error)
      return { user: null, session: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 회원가입
  const signUp = async (email: string, password: string, userData?: { 
    full_name?: string 
    phone?: string 
    birth_date?: string | null
  }) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData ? {
            full_name: userData.full_name,
            phone: userData.phone,
            birth_date: userData.birth_date,
          } : undefined
        }
      })

      if (error) {
        throw error
      }

      return { user: data.user, session: data.session, error: null }
    } catch (error: any) {
      console.error('회원가입 오류:', error)
      return { user: null, session: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      
      setUser(null)
      setSession(null)
      setProfile(null)
      
      return { error: null }
    } catch (error: any) {
      console.error('로그아웃 오류:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // 비밀번호 재설정 이메일 전송
  const resetPassword = async (email: string) => {
    try {
      console.log('비밀번호 재설정 요청:', email)
      
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/reset-password`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`
      
      console.log('리다이렉트 URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      console.log('Supabase 응답:', { data, error })

      if (error) {
        console.error('Supabase 오류:', error)
        throw error
      }

      return { error: null }
    } catch (error: any) {
      console.error('비밀번호 재설정 오류:', error)
      return { error }
    }
  }

  // 프로필 업데이트
  const updateProfile = async (updates: Partial<UserProfileRow>) => {
    if (!user) return { error: new Error('사용자가 로그인되지 않았습니다.') }

    try {
      console.log('프로필 업데이트 시작:', { userId: user.id, updates })
      
      // 먼저 테이블 존재 여부 확인
      const { data: testData, error: testError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)

      console.log('테이블 테스트:', { testData, testError })

      if (testError) {
        console.error('user_profiles 테이블에 접근할 수 없습니다:', testError)
        return { 
          data: null, 
          error: new Error(`테이블 접근 오류: ${testError.message}. Supabase에서 user_profiles 테이블을 생성해주세요.`) 
        }
      }

      // 현재 프로필 존재 여부 확인
      const { data: currentProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('현재 프로필 조회:', { currentProfile, fetchError })

      if (fetchError && fetchError.code === 'PGRST116') {
        // 프로필이 없으면 먼저 생성
        console.log('프로필이 없으므로 먼저 생성합니다...')
        const newProfile = await createUserProfile(user.id)
        if (!newProfile) {
          return { data: null, error: new Error('프로필 생성에 실패했습니다.') }
        }
      }

      // 업데이트 실행
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      console.log('Supabase 업데이트 응답:', { data, error })

      if (error) {
        console.error('Supabase 업데이트 오류:', error)
        return { data: null, error }
      }

      if (data) {
        setProfile(data)
        console.log('프로필 업데이트 성공:', data)
        return { data, error: null }
      } else {
        console.error('데이터가 없습니다')
        return { data: null, error: new Error('업데이트된 데이터를 받지 못했습니다.') }
      }
    } catch (error: any) {
      console.error('프로필 업데이트 예외:', error)
      return { data: null, error }
    }
  }

  // 관리자 권한 확인
  const isAdmin = () => {
    return profile?.role === 'admin' || profile?.role === 'super_admin'
  }

  // 슈퍼 관리자 권한 확인
  const isSuperAdmin = () => {
    return profile?.role === 'super_admin'
  }

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    fetchUserProfile,
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
  }
} 