import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import sgMail from '@sendgrid/mail'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { reservationId, paymentData } = await request.json()

    // 예약 정보 조회
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    })

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // TODO: 실제 결제 처리 구현
    // 여기에서 PG사 API를 호출하여 결제를 처리합니다.
    // const paymentResult = await processPayment(paymentData, reservation)

    // 결제 성공 처리
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentStatus: 'completed',
        status: 'confirmed',
        // paymentId: paymentResult.id
      }
    })

    // 예약 확정 이메일 발송
    await sgMail.send({
      to: reservation.customerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      subject: '예약이 확정되었습니다',
      html: `
        <h1>예약이 확정되었습니다</h1>
        <p>예약 번호: ${reservation.id}</p>
        <p>예약자: ${reservation.customerName}</p>
        <p>날짜: ${reservation.selectedDate.toLocaleDateString()}</p>
        <p>객실: ${reservation.roomType}</p>
        <p>인원: 성인 ${reservation.adults}명, 아동 ${reservation.children}명</p>
        <p>총 금액: ${reservation.totalPrice.toLocaleString()}원</p>
        <hr>
        <h2>예약하신 옵션</h2>
        ${reservation.breakfast ? '<p>- 조식</p>' : ''}
        ${reservation.bbqType ? `<p>- BBQ (${reservation.bbqType})</p>` : ''}
        ${reservation.bus ? '<p>- 셔틀버스</p>' : ''}
        <hr>
        <p>입실 시간: 15:00 ~ 22:00</p>
        <p>퇴실 시간: ~ 11:00</p>
        <p>문의사항: 000-000-0000</p>
      `
    })

    return NextResponse.json({
      success: true,
      reservation: updatedReservation
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { success: false, error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 결제 상태 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('reservationId')

    if (!reservationId) {
      return NextResponse.json(
        { success: false, error: '예약 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    })

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentStatus: reservation.paymentStatus,
      reservationStatus: reservation.status
    })
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { success: false, error: '결제 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 