import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: '인증되지 않은 사용자입니다' 
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error: any) {
    console.error('사용자 정보 조회 API 오류:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '사용자 정보를 가져올 수 없습니다' 
      },
      { status: 500 }
    )
  }
} 