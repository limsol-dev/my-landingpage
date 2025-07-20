import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from './lib/supabase'

// 역할별 접근 권한 정의
const ROLE_PERMISSIONS = {
  'super_admin': [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/customers',
    '/admin/reservations',
    '/admin/members',
    '/admin/settings'
  ],
  'admin': [
    '/admin',
    '/admin/dashboard',
    '/admin/customers',
    '/admin/reservations',
    '/admin/members'
  ],
  'group_leader': [
    '/admin',
    '/admin/dashboard',
    '/admin/reservations' // 본인 예약만 조회
  ]
}

// 공개 경로 (인증 불필요)
const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/admin/auth/callback',
  '/admin/reset-password'
]

async function getAuthenticatedUser(request: NextRequest) {
  if (!supabaseAdmin) {
    return null
  }

  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // 쿠키에서 토큰 추출
      const authCookie = request.cookies.get('sb-access-token')
      if (authCookie) {
        token = authCookie.value
      }
    }

    if (!token) {
      return null
    }

    // Supabase JWT 토큰 검증
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('프로필 조회 오류:', profileError)
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: profile.role,
      profile
    }
  } catch (error) {
    console.error('인증 확인 오류:', error)
    return null
  }
}

function hasPermission(userRole: string, path: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]
  if (!permissions) return false
  
  return permissions.some(allowedPath => 
    path === allowedPath || path.startsWith(allowedPath + '/')
  )
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 관리자 페이지가 아닌 경우 통과
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 공개 경로는 인증 체크 생략
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // 사용자 인증 확인
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 관리자 권한 확인
  if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'group_leader') {
    // 관리자 권한이 없는 사용자는 접근 거부
    const response = NextResponse.json(
      { error: '관리자 권한이 필요합니다.' },
      { status: 403 }
    )
    return response
  }

  // 역할별 접근 권한 확인
  if (!hasPermission(user.role, pathname)) {
    // 권한이 없는 페이지 접근 시 대시보드로 리다이렉트
    const dashboardUrl = new URL('/admin/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // 관리자 정보를 헤더에 추가 (선택사항)
  const response = NextResponse.next()
  response.headers.set('X-Admin-Role', user.role)
  response.headers.set('X-Admin-ID', user.id)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 