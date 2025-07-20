import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 응답 생성
    const response = NextResponse.json({
      success: true,
      message: '관리자 로그아웃 성공'
    })

    // 모든 인증 관련 쿠키 제거
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // 즉시 만료
    })

    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // 즉시 만료
    })

    return response

  } catch (error: any) {
    console.error('관리자 로그아웃 API 오류:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '로그아웃에 실패했습니다' 
      },
      { status: 500 }
    )
  }
} 