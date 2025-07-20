"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Home,
  PieChart,
  CreditCard,
  Gift,
  MessageSquare,
  ShoppingBag,
  FileText,
  ChevronDown,
  ChevronRight,
  Shield,
  Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAuth } from '@/app/admin/context/AuthContext'
import { useRBAC } from '@/hooks/use-rbac'

interface MenuItem {
  id: string
  title: string
  href: string
  icon: React.ElementType
  badge?: string | number
  description?: string
  requiredRoles?: string[]
  children?: MenuItem[]
}

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

// 메뉴 구조 정의
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: '전체 현황 및 통계',
    requiredRoles: ['admin', 'super_admin']
  },
  {
    id: 'reservations',
    title: '예약 관리',
    href: '/admin/reservations',
    icon: CalendarDays,
    badge: 'NEW',
    description: '예약 현황 및 관리',
    requiredRoles: ['admin', 'super_admin'],
    children: [
      {
        id: 'reservations-list',
        title: '예약 목록',
        href: '/admin/reservations',
        icon: FileText,
        requiredRoles: ['admin', 'super_admin']
      },
      {
        id: 'reservations-calendar',
        title: '예약 달력',
        href: '/admin/reservations/calendar',
        icon: CalendarDays,
        requiredRoles: ['admin', 'super_admin']
      }
    ]
  },
  {
    id: 'programs',
    title: '프로그램 관리',
    href: '/admin/programs',
    icon: ShoppingBag,
    description: '부가 프로그램 관리',
    requiredRoles: ['admin', 'super_admin'],
    children: [
      {
        id: 'programs-list',
        title: '프로그램 목록',
        href: '/admin/programs',
        icon: ShoppingBag,
        requiredRoles: ['admin', 'super_admin']
      },
      {
        id: 'programs-categories',
        title: '카테고리 관리',
        href: '/admin/programs/categories',
        icon: FileText,
        requiredRoles: ['admin', 'super_admin']
      }
    ]
  },
  {
    id: 'rooms',
    title: '객실 관리',
    href: '/admin/rooms',
    icon: Building,
    description: '객실 정보 관리',
    requiredRoles: ['admin', 'super_admin']
  },
  {
    id: 'members',
    title: '회원 관리',
    href: '/admin/members',
    icon: Users,
    description: '고객 및 회원 관리',
    requiredRoles: ['admin', 'super_admin']
  },
  {
    id: 'analytics',
    title: '분석',
    href: '/admin/analytics',
    icon: PieChart,
    description: '매출 및 이용 분석',
    requiredRoles: ['admin', 'super_admin'],
    children: [
      {
        id: 'analytics-revenue',
        title: '매출 분석',
        href: '/admin/analytics/revenue',
        icon: CreditCard,
        requiredRoles: ['admin', 'super_admin']
      },
      {
        id: 'analytics-usage',
        title: '이용 분석',
        href: '/admin/analytics/usage',
        icon: PieChart,
        requiredRoles: ['admin', 'super_admin']
      }
    ]
  },
  {
    id: 'finance',
    title: '정산',
    href: '/admin/finance',
    icon: CreditCard,
    description: '결제 및 정산 관리',
    requiredRoles: ['admin', 'super_admin']
  },
  {
    id: 'promotions',
    title: '프로모션',
    href: '/admin/promotions',
    icon: Gift,
    description: '할인 및 쿠폰 관리',
    requiredRoles: ['super_admin']
  },
  {
    id: 'communications',
    title: '커뮤니케이션',
    href: '/admin/communications',
    icon: MessageSquare,
    description: 'SMS 및 알림 관리',
    requiredRoles: ['admin', 'super_admin']
  },
  {
    id: 'settings',
    title: '설정',
    href: '/admin/settings',
    icon: Settings,
    description: '시스템 설정',
    requiredRoles: ['admin', 'super_admin']
  }
]

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { profile, logout, isSuperAdmin } = useAuth()
  const { getAccessibleMenus, canAccessPage, userRole } = useRBAC()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // 현재 경로에 해당하는 메뉴 항목 자동 확장
  useEffect(() => {
    const findExpandedItems = (items: MenuItem[], path: string): string[] => {
      const expanded: string[] = []
      
      items.forEach(item => {
        if (item.children) {
          const isChildActive = item.children.some(child => 
            path.startsWith(child.href) || child.href === path
          )
          if (isChildActive || path.startsWith(item.href)) {
            expanded.push(item.id)
          }
        }
      })
      
      return expanded
    }

    const autoExpanded = findExpandedItems(menuItems, pathname || '')
    setExpandedItems(autoExpanded)
  }, [pathname])

  // RBAC 기반 메뉴 필터링
  const getFilteredMenuItems = (items: MenuItem[]): MenuItem[] => {
    if (!profile || !userRole) return []

    return items.filter(item => {
      // RBAC 시스템의 canAccessPage를 사용하여 접근 권한 확인
      const hasAccess = canAccessPage(item.href)
      
      if (item.children) {
        item.children = getFilteredMenuItems(item.children)
        // 자식 메뉴가 모두 필터링되면 부모 메뉴도 숨김
        if (item.children.length === 0) {
          return false
        }
      }
      
      return hasAccess
    })
  }

  const filteredMenuItems = getFilteredMenuItems(menuItems)

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isItemActive = (item: MenuItem): boolean => {
    if (!pathname) return false
    
    if (item.href === pathname) return true
    
    if (item.children) {
      return item.children.some(child => child.href === pathname)
    }
    
    return pathname.startsWith(item.href) && item.href !== '/admin'
  }

  const isItemExpanded = (itemId: string): boolean => {
    return expandedItems.includes(itemId)
  }

  const handleLogout = async () => {
    await logout()
  }

  const getPensionInfo = () => ({
    name: '달팽이 아지트 펜션',
    address: '전남 해남군 산이면 오류길 53',
    account: '농협 351-0322-8946-53 (임솔)'
  })

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isActive = isItemActive(item)
    const isExpanded = isItemExpanded(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id} className={cn("w-full", depth > 0 && "ml-2")}>
        {hasChildren ? (
          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between px-3 py-2 h-auto text-left font-normal",
                  isActive
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  depth > 0 && "text-sm"
                )}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <item.icon className={cn(
                    "h-4 w-4 mr-3 shrink-0",
                    isActive ? "text-white" : "text-gray-500"
                  )} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{item.title}</div>
                    {item.description && (
                      <div className={cn(
                        "text-xs truncate",
                        isActive ? "text-white/80" : "text-gray-500"
                      )}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.badge && (
                    <Badge 
                      variant={isActive ? "secondary" : "default"} 
                      className="ml-2 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="ml-4 mt-1 space-y-1">
              {item.children?.map(child => renderMenuItem(child, depth + 1))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Button
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start px-3 py-2 h-auto text-left font-normal",
              isActive
                ? "bg-primary text-white hover:bg-primary/90"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              depth > 0 && "text-sm"
            )}
          >
            <Link href={item.href} onClick={onClose}>
              <item.icon className={cn(
                "h-4 w-4 mr-3 shrink-0",
                isActive ? "text-white" : "text-gray-500"
              )} />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{item.title}</div>
                {item.description && (
                  <div className={cn(
                    "text-xs truncate",
                    isActive ? "text-white/80" : "text-gray-500"
                  )}>
                    {item.description}
                  </div>
                )}
              </div>
              {item.badge && (
                <Badge 
                  variant={isActive ? "secondary" : "default"} 
                  className="ml-2 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          </Button>
        )}
      </div>
    )
  }

  const pensionInfo = getPensionInfo()

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="관리자 사이드바"
      >
        <div className="flex h-full flex-col">
          {/* 헤더 */}
          <div className="flex h-16 items-center justify-center border-b bg-primary">
            <div className="flex items-center gap-2 text-white">
              <Shield className="h-6 w-6" />
              <div className="text-center">
                <h1 className="text-lg font-bold">관리자</h1>
                <p className="text-xs text-white/80">
                  {isSuperAdmin ? '슈퍼 관리자' : '관리자'}
                </p>
              </div>
            </div>
          </div>

          {/* 펜션 정보 */}
          <div className="px-3 py-2 bg-green-50 border-b">
            <div className="text-xs text-gray-700">
              <div className="font-semibold text-primary">{pensionInfo.name}</div>
              <div className="mt-1 space-y-0.5">
                <p>{pensionInfo.address}</p>
                <p>{pensionInfo.account}</p>
              </div>
            </div>
          </div>

          {/* 네비게이션 메뉴 */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-2 space-y-1" role="navigation" aria-label="주요 메뉴">
              {filteredMenuItems.map(item => renderMenuItem(item))}
            </nav>
          </ScrollArea>

          {/* 하단 링크 */}
          <div className="border-t bg-gray-50">
            <div className="p-2 space-y-1">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-600 hover:text-primary hover:bg-primary/10"
              >
                <Link 
                  href="/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                >
                  <Home className="mr-2 h-4 w-4" />
                  메인 사이트 보기
                </Link>
              </Button>
              
              <Separator className="my-2" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
} 