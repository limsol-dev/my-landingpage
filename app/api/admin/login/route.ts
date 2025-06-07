import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 실제 구현에서는 환경 변수나 데이터베이스에서 관리해야 합니다
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin1234'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // 실제 구현에서는 JWT나 세션을 사용해야 합니다
      cookies().set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 