"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, Calendar, Crown, LogOut, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface ProfileSectionProps {
  showLogoutButton?: boolean
  showEditButton?: boolean
}

export default function ProfileSection({
  showLogoutButton = true,
  showEditButton = true
}: ProfileSectionProps) {
  const { user, profile, signOut, loading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('로그아웃 오류:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // 로딩 중이면 스켈레톤 표시
  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  // 인증되지 않은 경우
  if (!user || !profile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">로그인이 필요합니다.</p>
        </CardContent>
      </Card>
    )
  }

  // 역할별 배지 색상
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive'
      case 'admin':
        return 'default'
      default:
        return 'secondary'
    }
  }

  // 역할별 표시 텍스트
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '슈퍼 관리자'
      case 'admin':
        return '관리자'
      default:
        return '일반 회원'
    }
  }

  // 이니셜 생성
  const getInitials = (name: string) => {
    if (!name) return 'U'
    const words = name.split(' ')
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || ''} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(profile.full_name || profile.username || 'User')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">
                {profile.full_name || profile.username}
              </CardTitle>
              {(profile.role === 'admin' || profile.role === 'super_admin') && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            
            <CardDescription className="flex items-center gap-2">
              <Badge variant={getRoleBadgeVariant(profile.role)}>
                {getRoleDisplayName(profile.role)}
              </Badge>
              {profile.email_verified && (
                <Badge variant="outline" className="text-xs">
                  인증됨
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 사용자 정보 */}
        <div className="space-y-3">
          {/* 이메일 */}
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{user.email}</span>
          </div>

          {/* 사용자명 */}
          {profile.username && (
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>@{profile.username}</span>
            </div>
          )}

          {/* 휴대폰 번호 */}
          {profile.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}

          {/* 가입일 */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {format(new Date(profile.created_at), 'yyyy년 M월 d일', { locale: ko })} 가입
            </span>
          </div>

          {/* 마지막 로그인 */}
          {profile.last_login_at && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="w-4 h-4 inline-block" /> {/* 빈 공간 */}
              <span>
                마지막 로그인: {format(new Date(profile.last_login_at), 'M월 d일 HH:mm', { locale: ko })}
              </span>
            </div>
          )}
        </div>

        {/* OAuth 제공자 정보 */}
        {profile.oauth_provider && profile.oauth_provider !== 'email' && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{profile.oauth_provider === 'google' ? '구글' : profile.oauth_provider}로 로그인됨</span>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        {(showLogoutButton || showEditButton) && (
          <div className="pt-4 border-t space-y-2">
            {showEditButton && (
              <Button variant="outline" className="w-full">
                프로필 수정
              </Button>
            )}
            
            {showLogoutButton && (
              <Button 
                variant="ghost" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    로그아웃 중...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 