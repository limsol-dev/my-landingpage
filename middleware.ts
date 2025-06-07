import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 관리자 페이지 URL 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 로그인 페이지는 제외
    if (request.nextUrl.pathname === '/admin/login') {
      // 이미 로그인된 경우 대시보드로 리다이렉트
      const session = request.cookies.get('admin_session')
      if (session?.value === 'true') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.next()
    }

    // 세션 쿠키 체크
    const session = request.cookies.get('admin_session')
    
    if (!session?.value || session.value !== 'true') {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    '/admin/:path*'  // /admin으로 시작하는 모든 경로
  ]
} 