"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  User, 
  Settings, 
  LogOut,
  Shield,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/app/admin/context/AuthContext'

interface AdminHeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

// 페이지별 브레드크럼 매핑
const breadcrumbMap: Record<string, { title: string; parent?: string }> = {
  '/admin': { title: '관리자' },
  '/admin/dashboard': { title: '대시보드', parent: '/admin' },
  '/admin/reservations': { title: '예약 관리', parent: '/admin' },
  '/admin/programs': { title: '프로그램 관리', parent: '/admin' },
  '/admin/rooms': { title: '객실 관리', parent: '/admin' },
  '/admin/members': { title: '회원 관리', parent: '/admin' },
  '/admin/settings': { title: '설정', parent: '/admin' },
  '/admin/analytics': { title: '분석', parent: '/admin' },
  '/admin/finance': { title: '정산', parent: '/admin' },
}

export default function AdminHeader({ isSidebarOpen, onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname()
  const { user, profile, logout, isSuperAdmin } = useAuth()
  const [notifications, setNotifications] = useState([
    { id: 1, title: '새로운 예약', message: '김철수님의 예약이 접수되었습니다.', time: '5분 전', unread: true },
    { id: 2, title: '결제 완료', message: '예약번호 RS240101001 결제가 완료되었습니다.', time: '1시간 전', unread: true },
    { id: 3, title: '시스템 알림', message: '정기 백업이 완료되었습니다.', time: '3시간 전', unread: false },
  ])

  // 읽지 않은 알림 수
  const unreadCount = notifications.filter(n => n.unread).length

  // 브레드크럼 생성
  const generateBreadcrumbs = () => {
    if (!pathname) return []
    
    const current = breadcrumbMap[pathname]
    if (!current) return []

    const breadcrumbs = [{ title: current.title, href: pathname }]
    
    if (current.parent && breadcrumbMap[current.parent]) {
      breadcrumbs.unshift({ 
        title: breadcrumbMap[current.parent].title, 
        href: current.parent 
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  const handleLogout = async () => {
    await logout()
  }

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unread: false }
          : notification
      )
    )
  }

  const getUserDisplayName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || '관리자'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleDisplay = () => {
    if (isSuperAdmin) return '슈퍼 관리자'
    if (profile?.role === 'admin') return '관리자'
    return '사용자'
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 좌측: 모바일 메뉴 토글 + 브레드크럼 */}
        <div className="flex items-center space-x-4">
          {/* 모바일 메뉴 토글 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
            aria-label={isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* 브레드크럼 */}
          <nav aria-label="브레드크럼" className="hidden sm:flex">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Home className="h-4 w-4" />
                  <span className="sr-only">메인 사이트</span>
                </Link>
              </li>
              
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                  {index === breadcrumbs.length - 1 ? (
                    <span 
                      className="font-medium text-gray-900"
                      aria-current="page"
                    >
                      {crumb.title}
                    </span>
                  ) : (
                    <Link 
                      href={crumb.href} 
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {crumb.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* 우측: 검색 + 알림 + 사용자 메뉴 */}
        <div className="flex items-center space-x-4">
          {/* 검색 (데스크톱만) */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="검색..."
              className="pl-10 w-64"
              aria-label="검색"
            />
          </div>

          {/* 알림 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                aria-label={`알림 ${unreadCount}개`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                알림
                <Badge variant="secondary">{unreadCount}개 읽지 않음</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  새로운 알림이 없습니다.
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start p-4 cursor-pointer"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{notification.title}</p>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 사용자 메뉴 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 hover:bg-gray-100"
                aria-label="사용자 메뉴"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={profile?.profile_image} 
                    alt={getUserDisplayName()} 
                  />
                  <AvatarFallback className="bg-primary text-white text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplay()}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">{getRoleDisplay()}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/admin/profile" 
                  className="flex items-center cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  내 프로필
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link 
                  href="/admin/settings" 
                  className="flex items-center cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
} 