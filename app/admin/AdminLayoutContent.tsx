"use client"

import { useState, ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useAuth } from '@/hooks/use-auth'

export default function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isAuthenticated, loading, user, profile, isAdmin, isSuperAdmin } = useAuth()

  // 관리자 권한 체크 및 리다이렉트
  useEffect(() => {
    if (!loading && pathname?.startsWith('/admin')) {
      if (!isAuthenticated) {
        // 인증되지 않은 경우 로그인 페이지로
        router.push('/login?redirect=/admin/dashboard')
        return
      }
      
      if (!isAdmin && !isSuperAdmin) {
        // 관리자 권한이 없는 경우
        alert('관리자 권한이 필요합니다.')
        router.push('/')
        return
      }
    }
  }, [isAuthenticated, loading, isAdmin, isSuperAdmin, pathname, router])

  // 로그인 페이지는 별도 레이아웃 사용
  if (pathname === '/admin/login' || 
      pathname === '/admin/auth/callback' || 
      pathname === '/admin/reset-password' ||
      pathname === '/admin/force-logout') {
    return <>{children}</>
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    )
  }

  // 인증되지 않았거나 관리자 권한이 없는 경우
  if (!isAuthenticated || (!isAdmin && !isSuperAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">접근 권한을 확인하는 중...</p>
        </div>
      </div>
    )
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 관리자 사이드바 */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* 메인 콘텐츠 영역 */}
      <div className={cn(
        "transition-margin duration-200 ease-in-out",
        "lg:ml-64" // 사이드바 너비만큼 마진
      )}>
        {/* 관리자 헤더 */}
        <AdminHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={toggleSidebar} 
        />
        
        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
} 