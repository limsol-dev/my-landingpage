"use client"

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { 
  checkProfileCompletion, 
  canAccessRoute, 
  getRedirectPath 
} from '@/lib/profile-completion'

interface ProfileGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * 프로필 완성도를 체크하여 접근을 제어하는 가드 컴포넌트
 * 미완성 프로필 사용자는 보호된 라우트에 접근할 수 없음
 */
export default function ProfileGuard({ children, fallback }: ProfileGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    // 로딩 중이거나 로그인하지 않은 사용자는 체크하지 않음
    if (loading || !user || !pathname) {
      return
    }

    // 현재 경로가 접근 가능한지 체크
    const canAccess = canAccessRoute(pathname, profile)
    
    if (!canAccess) {
      const redirectPath = getRedirectPath(profile, pathname)
      console.log('🚫 프로필 가드: 접근 제한', {
        pathname,
        canAccess,
        redirectPath,
        profileComplete: profile ? checkProfileCompletion(profile) : null
      })
      
      router.push(redirectPath)
    }
  }, [pathname, profile, user, loading, router])

  // 로딩 중인 경우
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 사용자
  if (!user) {
    return children // 로그인 페이지 등에서는 접근 허용
  }

  // 프로필이 없는 경우 (Edge Function에서 생성 중일 수 있음)
  if (!profile) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로필을 준비하는 중...</p>
        </div>
      </div>
    )
  }

  // pathname이 null인 경우 접근 허용
  if (!pathname) {
    return <>{children}</>
  }

  // 현재 경로 접근 권한 체크
  const canAccess = canAccessRoute(pathname, profile)
  
  if (!canAccess) {
    // 접근 불가능한 경우 fallback 또는 로딩 표시
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 준비하는 중...</p>
        </div>
      </div>
    )
  }

  // 접근 가능한 경우 children 렌더링
  return <>{children}</>
} 