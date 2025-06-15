import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ReservationUpdateData {
  reservationId: string
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus?: 'pending' | 'partial' | 'completed'
  confirmedDate?: string
  updatedAt?: string
  customerName?: string
  phone?: string
  email?: string
  participants?: number
  programType?: string
  totalPrice?: number
  startDate?: string
  endDate?: string
  referrer?: string
  specialRequests?: string
}

export async function PUT(request: NextRequest) {
  try {
    const updateData: ReservationUpdateData = await request.json()
    console.log('예약 업데이트 요청:', updateData)

    // JSON 파일 경로
    const reservationsPath = path.join(process.cwd(), 'data', 'reservations.json')

    // 기존 예약 데이터 읽기
    let existingReservations = []
    try {
      if (fs.existsSync(reservationsPath)) {
        const data = fs.readFileSync(reservationsPath, 'utf8')
        existingReservations = JSON.parse(data)
      }
    } catch (error) {
      console.log('기존 예약 파일 읽기 실패 (새 파일 생성):', error)
    }

    // 해당 예약 찾기 및 업데이트
    const reservationIndex = existingReservations.findIndex(
      (reservation: any) => reservation.id === updateData.reservationId
    )

    if (reservationIndex === -1) {
      return NextResponse.json(
        { success: false, error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 예약 정보 업데이트
    const updatedReservation = {
      ...existingReservations[reservationIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    // reservationId 제거 (중복 방지)
    delete updatedReservation.reservationId

    existingReservations[reservationIndex] = updatedReservation

    // data 디렉토리 생성 (없으면)
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // 업데이트된 데이터 저장
    fs.writeFileSync(reservationsPath, JSON.stringify(existingReservations, null, 2))

    console.log('예약 업데이트 완료:', updatedReservation.id)

    return NextResponse.json({
      success: true,
      message: '예약이 성공적으로 업데이트되었습니다.',
      reservation: updatedReservation
    })

  } catch (error) {
    console.error('예약 업데이트 중 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '예약 업데이트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'PUT 메서드를 사용해주세요.' }, { status: 405 })
} 