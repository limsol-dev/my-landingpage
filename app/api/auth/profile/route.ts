import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateProfileSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').optional(),
  username: z.string().min(3, '사용자명은 최소 3자리여야 합니다').optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, '자기소개는 500자 이내여야 합니다').optional()
})

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    
    // 입력 데이터 검증
    const validatedData = updateProfileSchema.parse(body)
    
    // 사용자명 변경 시 중복 확인
    if (validatedData.username && validatedData.username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.username },
        select: { id: true }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { 
            success: false, 
            error: '이미 사용 중인 사용자명입니다' 
          },
          { status: 400 }
        )
      }
    }

    // 프로필 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        verified: true,
        active: true,
        phone: true,
        bio: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: '프로필이 업데이트되었습니다',
      user: updatedUser
    })

  } catch (error: any) {
    console.error('프로필 업데이트 API 오류:', error)
    
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
        error: '프로필 업데이트에 실패했습니다' 
      },
      { status: 500 }
    )
  }
} 