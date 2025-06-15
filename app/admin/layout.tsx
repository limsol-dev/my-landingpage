"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'

const navigation = [
  {
    name: '대시보드',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    name: '예약 관리',
    href: '/admin/reservations',
    icon: CalendarDays
  },
  {
    name: '회원 관리',
    href: '/admin/members',
    icon: Users
  },
  {
    name: '설정',
    href: '/admin/settings',
    icon: Settings
  }
]

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { isAuthenticated, isLoading, logout } = useAuth()

  // 로그인 페이지는 별도 레이아웃 사용
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // 로딩 중이거나 인증되지 않은 경우
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // AuthContext에서 리다이렉트 처리
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 사이드바 토글 버튼 */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* 로고 */}
          <div className="flex h-16 items-center justify-center border-b">
            <h1 className="text-xl font-bold">관리자 페이지</h1>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-gray-900" : "text-gray-400"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* 로그아웃 버튼 */}
          <div className="border-t p-4">
            <button
              onClick={logout}
              className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main
        className={cn(
          "transition-margin duration-200 ease-in-out",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}
      >
        <div className="min-h-screen p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
} 