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
      console.log('🔍 Supabase 연결 테스트 시작...')
      
      // 간단한 인증 테스트로 변경
      const { data: session } = await supabase.auth.getSession()
      
      console.log('🔐 Auth 세션 상태:', session ? '로그인됨' : '로그인 필요')
      
      // 테이블 존재 여부 확인
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      if (error) {
        console.warn('⚠️ 데이터베이스 테이블 확인:', error.message)
        
        // 테이블이 존재하지 않는 경우
        if (error.code === '42P01') {
          console.warn('📋 user_profiles 테이블이 존재하지 않습니다. setup-supabase.sql 스크립트를 실행해주세요.')
          return false
        }
        
        // 권한 문제
        if (error.code === '42501') {
          console.warn('🔒 테이블 접근 권한이 없습니다. RLS 정책을 확인해주세요.')
          return false
        }
        
        return false
      }
      
      console.log('✅ Supabase 데이터베이스 연결 성공!')
      return true
    } catch (error) {
      console.error('❌ Supabase 연결 테스트 예외:', error)
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
        console.warn('⚠️ Supabase 연결 실패로 프로필을 가져올 수 없습니다. 테이블 생성 후 다시 시도해주세요.')
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
      console.log('📝 프로필 생성 시작:', userId)
      
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      
      if (!user) {
        console.error('❌ 사용자 정보를 가져올 수 없습니다')
        return null
      }

      console.log('👤 사용자 정보:', user)
      console.log('📋 사용자 메타데이터:', user.user_metadata)

      // username이 user_metadata에 있는지 확인
      const username = user.user_metadata?.username
      if (!username) {
        console.error('❌ username이 user_metadata에 없습니다:', user.user_metadata)
        // 임시로 이메일 앞부분을 username으로 사용
        const tempUsername = user.email?.split('@')[0] + '_' + Date.now()
        console.log('⚠️ 임시 username 생성:', tempUsername)
      }

      const profileData = {
        id: userId,
        username: username || user.email?.split('@')[0] + '_' + Date.now(),
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자',
        phone: user.user_metadata?.phone || null,
        birth_date: user.user_metadata?.birth_date || null,
        role: 'user' as const
      }

      console.log('📝 생성할 프로필 데이터:', profileData)

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      console.log('📝 프로필 생성 결과:', { data, error })

      if (error) {
        console.error('❌ 프로필 생성 오류:', error)
        
        // username 컬럼이 없는 경우
        if (error.message?.includes('column "username" does not exist')) {
          console.error('❌ username 컬럼이 존재하지 않습니다! username-migration.sql을 실행해주세요.')
          return null
        }
        
        // 이미 존재하는 경우라면 다시 조회 시도
        if (error.code === '23505') { // unique constraint violation
          console.log('🔄 프로필이 이미 존재함, 다시 조회 시도...')
          const { data: existingData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()
          
          if (existingData) {
            console.log('✅ 기존 프로필 조회 성공:', existingData)
            setProfile(existingData)
            return existingData
          }
        }
        return null
      }

      if (data) {
        console.log('✅ 프로필 생성 성공:', data)
        setProfile(data)
        return data
      }

      console.error('❌ 프로필 생성 실패: 데이터가 없음')
      return null
    } catch (error) {
      console.error('❌ 프로필 생성 예외:', error)
      return null
    }
  }

  // 로그인 (이메일)
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

  // 로그인 (아이디)
  const signInWithUsername = async (username: string, password: string) => {
    try {
      setLoading(true)
      console.log('🔐 아이디로 로그인 시도:', username)
      
      // 먼저 테이블 구조 확인
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_profiles')
        .select('username')
        .limit(1)

      if (tableError) {
        console.error('❌ user_profiles 테이블 접근 오류:', tableError)
        if (tableError.code === '42P01') {
          throw new Error('데이터베이스 테이블이 존재하지 않습니다. setup-supabase.sql을 실행해주세요.')
        }
        if (tableError.message?.includes('column "username" does not exist')) {
          throw new Error('username 컬럼이 존재하지 않습니다. username-migration.sql을 실행해주세요.')
        }
        throw new Error(`데이터베이스 오류: ${tableError.message}`)
      }
      
      // 아이디로 이메일 찾기
      console.log('🔍 아이디로 사용자 검색:', username)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('email, username')
        .eq('username', username)
        .single()

      console.log('🔍 검색 결과:', { profileData, profileError })

      if (profileError) {
        console.error('❌ 프로필 검색 오류:', profileError)
        if (profileError.code === 'PGRST116') {
          throw new Error('아이디를 찾을 수 없습니다. 회원가입을 먼저 진행해주세요.')
        }
        throw new Error(`사용자 검색 오류: ${profileError.message}`)
      }

      if (!profileData || !profileData.email) {
        console.error('❌ 사용자 데이터가 없습니다:', profileData)
        throw new Error('아이디를 찾을 수 없습니다. 회원가입을 먼저 진행해주세요.')
      }

      console.log('✅ 사용자 찾음:', profileData.email)

      // 이메일로 로그인
      console.log('🔐 이메일로 로그인 시도:', profileData.email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      })

      if (error) {
        console.error('❌ 로그인 오류:', error)
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
        }
        throw error
      }

      console.log('✅ 로그인 성공:', data.user?.email)
      return { user: data.user, session: data.session, error: null }
    } catch (error: any) {
      console.error('❌ 아이디 로그인 오류:', error)
      return { user: null, session: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 회원가입
  const signUp = async (email: string, password: string, userData?: { 
    username?: string
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
          emailRedirectTo: undefined, // 이메일 확인 비활성화
          data: userData ? {
            username: userData.username,
            full_name: userData.full_name,
            phone: userData.phone,
            birth_date: userData.birth_date,
            email_confirmed: true, // 이메일 확인됨으로 설정
          } : {
            email_confirmed: true, // 기본값으로도 확인됨 설정
          }
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

  // 아이디 중복 체크
  const checkUsernameAvailable = async (username: string) => {
    try {
      console.log('🔍 아이디 중복 체크 시작:', username)
      
      // 먼저 테이블 구조 확인
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_profiles')
        .select('username')
        .limit(1)

      if (tableError) {
        console.error('❌ user_profiles 테이블 접근 오류:', tableError)
        // 테이블이 없거나 username 컬럼이 없으면 false 반환
        if (tableError.code === '42P01' || tableError.message?.includes('column "username" does not exist')) {
          console.warn('⚠️ username 컬럼이 존재하지 않습니다. Supabase에서 마이그레이션을 실행해주세요.')
          return false
        }
        return false
      }

      // 실제 중복 체크
      const { data, error, count } = await supabase
        .from('user_profiles')
        .select('username', { count: 'exact' })
        .eq('username', username)

      console.log('🔍 중복 체크 결과:', { data, error, count })

      // 에러가 있으면 사용 불가능으로 처리
      if (error) {
        console.error('❌ 아이디 중복 체크 오류:', error)
        return false
      }

      // count가 0이면 사용 가능, 1 이상이면 이미 사용 중
      const isAvailable = (count === 0)
      console.log(isAvailable ? '✅ 사용 가능한 아이디' : '❌ 이미 사용 중인 아이디')
      
      return isAvailable
    } catch (error) {
      console.error('❌ 아이디 중복 체크 예외:', error)
      return false
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
    checkUsernameAvailable,
    signInWithUsername,
  }
} 