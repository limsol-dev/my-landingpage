'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SimpleAdminPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkUserAndProfile()
  }, [])

  const checkUserAndProfile = async () => {
    try {
      // 1. 현재 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      console.log('현재 사용자:', user)
      
      if (!user) {
        window.location.href = '/login?redirect=/simple-admin'
        return
      }

      setUser(user)

      // 2. 프로필 확인
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('프로필:', profile, '오류:', error)
      
      if (profile) {
        setProfile(profile)
        setIsAdmin(profile.role === 'admin' || profile.role === 'super_admin')
      }
      
      // 3. 자동 관리자 권한 부여 (sool9241@naver.com)
      if (user.email === 'sool9241@naver.com' && !profile?.role) {
        console.log('자동 관리자 권한 부여 중...')
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: '관리자',
            username: 'admin',
            role: 'admin'
          })
          
        if (!updateError) {
          setIsAdmin(true)
          setProfile({ 
            id: user.id,
            email: user.email,
            full_name: '관리자',
            username: 'admin',
            role: 'admin'
          })
        }
      }
      
    } catch (error) {
      console.error('사용자 확인 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMakeAdmin = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || '관리자',
          username: profile?.username || 'admin',
          role: 'admin'
        })

      if (!error) {
        alert('관리자 권한이 부여되었습니다!')
        window.location.reload()
      } else {
        alert('권한 부여 실패: ' + error.message)
      }
    } catch (error) {
      console.error('권한 부여 오류:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded">로그인</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">간단한 관리자 페이지</h1>
            <p className="mt-2 text-gray-600">
              사용자: {user?.email} | 
              권한: {isAdmin ? '✅ 관리자' : '❌ 일반 사용자'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 사용자 정보 카드 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">사용자 정보</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">이메일</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">권한</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profile?.role || '권한 없음'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">이름</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profile?.full_name || '설정되지 않음'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 권한 부여 버튼 */}
        {!isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">관리자 권한이 필요합니다</h3>
            <p className="text-yellow-700 mb-4">
              관리자 기능을 사용하려면 권한을 부여해야 합니다.
            </p>
            <button
              onClick={handleMakeAdmin}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              관리자 권한 부여
            </button>
          </div>
        )}

        {/* 관리자 기능 */}
        {isAdmin && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">총 회원 수</dt>
                      <dd className="text-lg font-medium text-gray-900">1+</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">📅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">총 예약 수</dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">⚙️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">관리자 상태</dt>
                      <dd className="text-lg font-medium text-green-600">활성</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">관리 메뉴</h3>
              <div className="space-y-4">
                <a href="/" className="block bg-blue-50 hover:bg-blue-100 p-4 rounded-lg">
                  <div className="font-medium text-blue-900">메인 사이트로 돌아가기</div>
                  <div className="text-sm text-blue-700 mt-1">홈페이지로 이동</div>
                </a>
                
                {isAdmin && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="font-medium text-green-900">회원 관리</div>
                      <div className="text-sm text-green-700 mt-1">사용자 계정 관리 (개발 예정)</div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="font-medium text-purple-900">예약 관리</div>
                      <div className="text-sm text-purple-700 mt-1">예약 현황 관리 (개발 예정)</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 