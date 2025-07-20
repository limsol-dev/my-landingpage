import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, isAdmin } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateReservationSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  totalPrice: z.number().optional(),
  programId: z.string().optional()
})

export async function PUT(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const user = await getAuthenticatedUser(request)
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '관리자 권한이 필요합니다' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = updateReservationSchema.parse(body)

    // 예약 존재 여부 확인
    const existingReservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!existingReservation) {
      return NextResponse.json(
        { 
          success: false, 
          error: '예약을 찾을 수 없습니다' 
        },
        { status: 404 }
      )
    }

    // 예약 업데이트
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: updateData
    })

    console.log('예약 업데이트 완료:', updatedReservation.id)

    return NextResponse.json({
      success: true,
      message: '예약이 성공적으로 업데이트되었습니다',
      reservation: updatedReservation
    })

  } catch (error: any) {
    console.error('예약 업데이트 API 오류:', error)
    
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
        error: '예약 업데이트에 실패했습니다' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'PUT 메서드를 사용해주세요.' }, { status: 405 })
} 