import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import sgMail from '@sendgrid/mail'
import type { RoomType, BbqType } from '@/store/useReservationStore'

const prisma = new PrismaClient()

// SendGrid 설정
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

// 실제 구현시에는 데이터베이스에 저장해야 합니다
const reservations: Reservation[] = []

interface Reservation {
  id: string
  selectedDate: string
  roomType: RoomType
  adults: number
  children: number
  options: {
    breakfast: boolean
    bbq: {
      type: BbqType | null
      quantity: number
    }
    bus: boolean
  }
  totalPrice: number
  customerInfo: {
    name: string
    phone: string
    email: string
  }
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 예약 가능 여부 확인
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        selectedDate: new Date(data.selectedDate),
        roomType: data.roomType,
        status: {
          not: 'cancelled'
        }
      }
    })

    if (existingReservation) {
      return NextResponse.json(
        { success: false, error: '해당 날짜의 객실이 이미 예약되었습니다.' },
        { status: 400 }
      )
    }

    // 새 예약 생성
    const reservation = await prisma.reservation.create({
      data: {
        selectedDate: new Date(data.selectedDate),
        roomType: data.roomType,
        adults: data.adults,
        children: data.children,
        breakfast: data.options.breakfast,
        bbqType: data.options.bbq.type,
        bbqQuantity: data.options.bbq.quantity,
        bus: data.options.bus,
        totalPrice: data.totalPrice,
        customerName: data.customerInfo.name,
        customerPhone: data.customerInfo.phone,
        customerEmail: data.customerInfo.email,
      }
    })

    // 예약 확인 이메일 발송
    await sgMail.send({
      to: data.customerInfo.email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      subject: '예약이 접수되었습니다',
      html: `
        <h1>예약이 접수되었습니다</h1>
        <p>예약 번호: ${reservation.id}</p>
        <p>예약자: ${data.customerInfo.name}</p>
        <p>날짜: ${data.selectedDate}</p>
        <p>객실: ${data.roomType}</p>
        <p>인원: 성인 ${data.adults}명, 아동 ${data.children}명</p>
        <p>총 금액: ${data.totalPrice.toLocaleString()}원</p>
        <hr>
        <p>예약 확정을 위해서는 결제가 필요합니다.</p>
        <p>아래 링크에서 결제를 진행해주세요:</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/payment/${reservation.id}">
          결제하기
        </a>
      `
    })

    return NextResponse.json({
      success: true,
      reservation
    })
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json(
      { success: false, error: '예약 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const roomType = searchParams.get('roomType')

    if (!date || !roomType) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 해당 날짜와 룸타입의 예약 현황 확인
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        selectedDate: new Date(date),
        roomType: roomType,
        status: {
          not: 'cancelled'
        }
      }
    })

    return NextResponse.json({
      success: true,
      available: !existingReservation
    })
  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { success: false, error: '조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 