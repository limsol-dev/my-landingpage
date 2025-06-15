import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// 데이터 파일 경로
const DATA_FILE = join(process.cwd(), 'data', 'reservations.json')

// 데이터 디렉토리 생성
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  require('fs').mkdirSync(dataDir, { recursive: true })
}

// 예약 데이터 읽기
function getReservations() {
  try {
    if (existsSync(DATA_FILE)) {
      const data = readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('예약 데이터 읽기 오류:', error)
    return []
  }
}

// 예약 데이터 저장
function saveReservations(reservations: any[]) {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(reservations, null, 2), 'utf8')
  } catch (error) {
    console.error('예약 데이터 저장 오류:', error)
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('받은 예약 데이터:', JSON.stringify(data, null, 2))
    
    // 예약 ID 생성
    const reservationId = `R${String(Date.now()).slice(-6)}`
    
    // 새 예약 객체 생성
    const newReservation = {
      id: reservationId,
      customerName: data.customerName || '',
      programType: data.programType || '일반 예약',
      startDate: data.checkIn || '',
      endDate: data.checkOut || '',
      status: 'pending' as const,
      totalPrice: data.totalPrice || 0,
      participants: data.totalGuests || 0,
      phone: data.customerPhone || '',
      email: data.customerEmail || '',
      specialRequests: data.specialRequests || '',
      paymentStatus: 'pending' as const,
      referrer: data.referrer || '웹사이트',
      confirmedDate: undefined,
      createdAt: new Date().toISOString(),
      // 추가 예약 정보
      adults: data.adults || 0,
      children: data.children || 0,
      bbq: data.bbq || {},
      meal: data.meal || {},
      transport: data.transport || {},
      experience: data.experience || {},
      extra: data.extra || {}
    }
    
    // 기존 예약 목록 가져오기
    const reservations = getReservations()
    
    // 새 예약 추가
    reservations.push(newReservation)
    
    // 파일에 저장
    saveReservations(reservations)
    
    console.log('새 예약 생성:', newReservation)
    console.log('총 예약 수:', reservations.length)
    
    return NextResponse.json({
      success: true,
      reservation: newReservation,
      message: '예약이 성공적으로 접수되었습니다.'
    })
    
  } catch (error) {
    console.error('예약 생성 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '예약 처리 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const reservations = getReservations()
    console.log('현재 저장된 예약 수:', reservations.length)
    console.log('예약 목록:', JSON.stringify(reservations, null, 2))
    
    return NextResponse.json({
      success: true,
      reservations: reservations
    })
  } catch (error) {
    console.error('예약 조회 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '예약 조회 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
} 