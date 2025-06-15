'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';

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
];

export function Sidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
      {/* 모바일 사이드바 토글 버튼 */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-md shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-[#2F513F]" />
        ) : (
          <Menu className="h-6 w-6 text-[#2F513F]" />
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
          <div className="flex h-16 items-center justify-center border-b bg-[#2F513F]">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-white" />
              <div className="text-center">
                <h1 className="text-lg font-bold text-white">달팽이아지트펜션</h1>
                <p className="text-xs text-white/80">관리자</p>
              </div>
            </div>
          </div>

          {/* 펜션 정보 */}
          <div className="px-4 py-3 bg-green-50 border-b">
            <div className="text-xs text-gray-600">
              <p className="font-medium">전남 해남군 산이면 오류길 53</p>
              <p>농협 351-0322-8946-53 (임솔)</p>
            </div>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-[#2F513F] text-white"
                      : "text-gray-700 hover:bg-green-50 hover:text-[#2F513F]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-white" : "text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 메인 사이트 바로가기 */}
          <div className="border-t px-2 py-2">
            <Link
              href="/"
              target="_blank"
              className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-[#2F513F] rounded-md transition-colors"
            >
              <Home className="mr-3 h-5 w-5 text-gray-400" />
              메인 사이트 보기
            </Link>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="border-t p-2">
            <button
              onClick={() => {
                // 로그아웃 처리
                document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                window.location.href = '/admin/login';
              }}
              className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
} 