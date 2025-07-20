import { NextRequest, NextResponse } from 'next/server'
import { checkUsernameExists } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    
    if (!username) {
      return NextResponse.json(
        { 
          success: false, 
          error: '사용자명이 필요합니다' 
        },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { 
          success: false, 
          available: false,
          error: '사용자명은 최소 3자리여야 합니다' 
        },
        { status: 400 }
      )
    }

    const exists = await checkUsernameExists(username)
    
    return NextResponse.json({
      success: true,
      available: !exists,
      message: exists ? '이미 사용 중인 사용자명입니다' : '사용 가능한 사용자명입니다'
    })

  } catch (error: any) {
    console.error('사용자명 중복 확인 API 오류:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        available: false,
        error: '사용자명 확인 중 오류가 발생했습니다' 
      },
      { status: 500 }
    )
  }
} 