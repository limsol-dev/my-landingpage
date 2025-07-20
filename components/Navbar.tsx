"use client"

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Navbar() {
  const { user, profile, signOut, loading, isAdmin } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              달팽이 아지트 펜션
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/programs" className="text-gray-600 hover:text-gray-900">
              프로그램
            </Link>
            <Link href="/reservation" className="text-gray-600 hover:text-gray-900">
              예약하기
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              소개
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              문의
            </Link>
            
            {/* 인증 상태에 따른 버튼 표시 */}
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                {/* 관리자 링크 */}
                {isAdmin && (
                  <Link 
                    href="/admin-dashboard" 
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
                  >
                    관리자 대시보드
                  </Link>
                )}
                
                {/* 사용자 메뉴 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={profile?.profile_image || ''} 
                          alt={profile?.full_name || user.email || ''} 
                        />
                        <AvatarFallback>
                          {getUserInitials(profile?.full_name || undefined, user.email || undefined)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || profile?.username || user.email?.split('@')[0] || '사용자'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        @{profile?.username || user.email?.split('@')[0] || ''}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email || ''}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">프로필</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-reservations">내 예약</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    회원가입
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 