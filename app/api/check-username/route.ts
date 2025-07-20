import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    
    if (!username) {
      return NextResponse.json(
        { 
          available: false, 
          error: '아이디가 필요합니다' 
        },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { 
          available: false,
          error: '아이디는 최소 3자 이상이어야 합니다' 
        },
        { status: 400 }
      )
    }

    // 아이디 형식 검증
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { 
          available: false,
          error: '아이디는 영문, 숫자, 언더스코어만 사용하여 3-20자로 입력해주세요' 
        },
        { status: 400 }
      )
    }

    // Supabase에서 중복 체크
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single()

    // 오류 처리
    if (error) {
      // 데이터가 없는 경우 (사용 가능)
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          available: true,
          message: '✅ 사용 가능한 아이디입니다'
        })
      }
      
      // 테이블이 존재하지 않는 경우
      if (error.code === '42P01') {
        return NextResponse.json(
          { 
            available: false,
            error: '⚠️ 데이터베이스가 설정되지 않았습니다. 관리자에게 문의하세요.' 
          },
          { status: 500 }
        )
      }
      
      // 기타 오류
      console.error('아이디 중복 확인 오류:', error)
      return NextResponse.json(
        { 
          available: false,
          error: '아이디 확인 중 오류가 발생했습니다' 
        },
        { status: 500 }
      )
    }

    // 데이터가 있으면 이미 사용 중
    if (data) {
      return NextResponse.json({
        available: false,
        message: '❌ 이미 사용 중인 아이디입니다'
      })
    }

    // 사용 가능
    return NextResponse.json({
      available: true,
      message: '✅ 사용 가능한 아이디입니다'
    })

  } catch (error: any) {
    console.error('아이디 중복 확인 예외:', error)
    
    return NextResponse.json(
      { 
        available: false,
        error: '아이디 확인 중 오류가 발생했습니다' 
      },
      { status: 500 }
    )
  }
}

// GET 방식도 지원 (URL 파라미터)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    
    if (!username) {
      return NextResponse.json(
        { 
          available: false, 
          error: '아이디가 필요합니다' 
        },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { 
          available: false,
          error: '아이디는 최소 3자 이상이어야 합니다' 
        },
        { status: 400 }
      )
    }

    // 아이디 형식 검증
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { 
          available: false,
          error: '아이디는 영문, 숫자, 언더스코어만 사용하여 3-20자로 입력해주세요' 
        },
        { status: 400 }
      )
    }

    // Supabase에서 중복 체크
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single()

    // 오류 처리
    if (error) {
      // 데이터가 없는 경우 (사용 가능)
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          available: true,
          message: '✅ 사용 가능한 아이디입니다'
        })
      }
      
      // 기타 오류
      console.error('아이디 중복 확인 오류:', error)
      return NextResponse.json(
        { 
          available: false,
          error: '아이디 확인 중 오류가 발생했습니다' 
        },
        { status: 500 }
      )
    }

    // 데이터가 있으면 이미 사용 중
    if (data) {
      return NextResponse.json({
        available: false,
        message: '❌ 이미 사용 중인 아이디입니다'
      })
    }

    // 사용 가능
    return NextResponse.json({
      available: true,
      message: '✅ 사용 가능한 아이디입니다'
    })

  } catch (error: any) {
    console.error('아이디 중복 확인 예외:', error)
    
    return NextResponse.json(
      { 
        available: false,
        error: '아이디 확인 중 오류가 발생했습니다' 
      },
      { status: 500 }
    )
  }
} 