import { NextRequest, NextResponse } from 'next/server'
import { createUser, checkEmailExists, checkUsernameExists, generateToken } from '@/lib/auth'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자리여야 합니다'),
  username: z.string().min(3, '사용자명은 최소 3자리여야 합니다').optional(),
  name: z.string().min(1, '이름을 입력해주세요').optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 입력 데이터 검증
    const validatedData = signupSchema.parse(body)
    
    // 이메일 중복 확인
    const emailExists = await checkEmailExists(validatedData.email)
    if (emailExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: '이미 사용 중인 이메일입니다' 
        },
        { status: 400 }
      )
    }

    // 사용자명 중복 확인 (제공된 경우)
    if (validatedData.username) {
      const usernameExists = await checkUsernameExists(validatedData.username)
      if (usernameExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: '이미 사용 중인 사용자명입니다' 
          },
          { status: 400 }
        )
      }
    }
    
    // 사용자 생성
    const newUser = await createUser({
      email: validatedData.email,
      password: validatedData.password,
      username: validatedData.username,
      name: validatedData.name
    })

    // JWT 토큰 생성
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      username: newUser.username || undefined
    })
    
    // 응답 생성 (비밀번호 제외)
    const response = NextResponse.json({
      success: true,
      message: '회원가입 성공',
      user: newUser,
      token
    })

    // 쿠키에 토큰 설정
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7일
    })

    return response

  } catch (error: any) {
    console.error('회원가입 API 오류:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.errors[0].message 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '회원가입에 실패했습니다' 
      },
      { status: 500 }
    )
  }
} 