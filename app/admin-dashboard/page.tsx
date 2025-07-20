'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboardPage() {
  const { isAuthenticated, loading, isAdmin, isSuperAdmin, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin-dashboard')
        return
      }
      
      if (!isAdmin && !isSuperAdmin) {
        alert('관리자 권한이 필요합니다.')
        router.push('/')
        return
      }
    }
  }, [isAuthenticated, loading, isAdmin, isSuperAdmin, router])

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

  if (!isAuthenticated || (!isAdmin && !isSuperAdmin)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="mt-2 text-gray-600">환영합니다, {profile?.full_name || profile?.username}님</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 통계 카드들 */}
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
                    <dd className="text-lg font-medium text-gray-900">1</dd>
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
                    <span className="text-white font-semibold">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">총 매출</dt>
                    <dd className="text-lg font-medium text-gray-900">0원</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">최근 활동</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">최근 사용자 활동 및 시스템 상태</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">활동 내역이 없습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 관리 메뉴 */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">관리 메뉴</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">시스템 관리 기능</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-left">
                      <h4 className="font-medium text-blue-900">회원 관리</h4>
                      <p className="text-sm text-blue-700 mt-1">사용자 계정 관리</p>
                    </div>
                  </button>
                  
                  <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-left">
                      <h4 className="font-medium text-green-900">예약 관리</h4>
                      <p className="text-sm text-green-700 mt-1">예약 현황 관리</p>
                    </div>
                  </button>
                  
                  <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="text-left">
                      <h4 className="font-medium text-purple-900">정산 관리</h4>
                      <p className="text-sm text-purple-700 mt-1">매출 및 정산</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 