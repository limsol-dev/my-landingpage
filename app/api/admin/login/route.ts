import { NextResponse } from 'next/server'

// 실제 구현에서는 환경 변수나 데이터베이스에서 관리해야 합니다
const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = 'admin1234'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      
      // 세션 쿠키 설정
      response.cookies.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // 24시간
      })

      return response
    }

    return NextResponse.json(
      { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 