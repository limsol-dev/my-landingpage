import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const createReservationSchema = z.object({
  // 객실 정보
  roomType: z.enum(['standard', 'deluxe', 'suite']),
  roomId: z.string().optional(),
  
  // 날짜 정보
  checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), '올바른 날짜 형식이 아닙니다'),
  checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), '올바른 날짜 형식이 아닙니다'),
  
  // 인원 정보
  adults: z.number().min(1, '성인은 최소 1명 이상이어야 합니다').max(20, '성인은 최대 20명까지 가능합니다'),
  children: z.number().min(0, '아동 수는 0명 이상이어야 합니다').max(20, '아동은 최대 20명까지 가능합니다'),
  
  // 옵션 정보
  options: z.object({
    breakfast: z.boolean(),
    bbq: z.object({
      type: z.enum(['basic', 'standard', 'premium']).nullable(),
      quantity: z.number().min(1).max(10)
    }),
    bus: z.boolean()
  }),
  
  // 선택된 프로그램
  selectedPrograms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    unit: z.enum(['per_person', 'per_group', 'fixed'])
  })).optional(),
  
  // 고객 정보
  customerInfo: z.object({
    name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
    phone: z.string().regex(/^[0-9-]{10,15}$/, '올바른 전화번호 형식이 아닙니다'),
    email: z.string().email('올바른 이메일 형식이 아닙니다')
  }),
  
  // 가격 정보
  totalPrice: z.number().min(0, '가격은 0 이상이어야 합니다'),
  roomPrice: z.number().min(0).optional(),
  programsPrice: z.number().min(0).optional(),
  optionsPrice: z.number().min(0).optional(),
  
  // 추가 정보
  specialRequests: z.string().max(1000, '특별 요청사항은 1000자 이내로 작성해주세요').optional()
})

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('받은 예약 데이터:', JSON.stringify(data, null, 2))
    
    // 1. 입력 데이터 검증
    const validatedData = createReservationSchema.parse(data)
    
    const {
      roomType,
      roomId,
      checkInDate,
      checkOutDate,
      adults,
      children,
      options,
      selectedPrograms = [],
      customerInfo,
      totalPrice,
      specialRequests
    } = validatedData

    // 2. 날짜 유효성 검증
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const now = new Date()
    
    if (checkIn >= checkOut) {
      return NextResponse.json({
        success: false,
        error: '체크아웃 날짜는 체크인 날짜 이후여야 합니다.'
      }, { status: 400 })
    }
    
    if (checkIn < now) {
      return NextResponse.json({
        success: false,
        error: '체크인 날짜는 현재 날짜 이후여야 합니다.'
      }, { status: 400 })
    }

    // 3. 가용성 재확인
    const availabilityCheck = await fetch(new URL('/api/reservations/check-availability', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomType,
        roomId,
        checkInDate,
        checkOutDate,
        programIds: selectedPrograms.map(p => p.id),
        adults,
        children
      })
    })

    const availabilityResult = await availabilityCheck.json()
    if (!availabilityResult.available) {
      return NextResponse.json({
        success: false,
        error: '예약 가능한 객실 또는 프로그램이 없습니다.',
        details: availabilityResult
      }, { status: 409 })
    }

    // 4. 예약 번호 생성
    const reservationNumber = generateReservationNumber()

    // 5. 트랜잭션을 사용한 예약 생성
    const result = await createReservationWithTransaction({
      reservationNumber,
      roomType,
      checkInDate,
      checkOutDate,
      adults,
      children,
      options,
      selectedPrograms,
      customerInfo,
      totalPrice,
      specialRequests,
      availableRoom: availabilityResult.details.room
    })

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

    console.log('새 예약 생성 완료:', result.reservation)
    
    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      reservation: result.reservation,
      message: '예약이 성공적으로 접수되었습니다.',
      reservationNumber
    })
    
  } catch (error) {
    console.error('예약 생성 오류:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: '예약 처리 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// 예약 번호 생성 함수
function generateReservationNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `RS${year}${month}${day}${random}`
}

// 트랜잭션을 사용한 예약 생성 함수
async function createReservationWithTransaction({
  reservationNumber,
  roomType,
  checkInDate,
  checkOutDate,
  adults,
  children,
  options,
  selectedPrograms,
  customerInfo,
  totalPrice,
  specialRequests,
  availableRoom
}: {
  reservationNumber: string
  roomType: string
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  options: any
  selectedPrograms: any[]
  customerInfo: any
  totalPrice: number
  specialRequests?: string
  availableRoom: any
}) {
  try {
    // 메인 예약 데이터 생성
    const reservationData = {
      reservation_number: reservationNumber,
      room_id: availableRoom.id,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults,
      children,
      total_guests: adults + children,
      room_price: availableRoom.base_price || 0,
      total_price: totalPrice,
      status: 'pending',
      payment_status: 'pending',
      special_requests: specialRequests || null,
      // BBQ 옵션
      bbq_grill_count: options.bbq.type ? options.bbq.quantity : 0,
      bbq_meat_set_count: options.bbq.type === 'basic' ? options.bbq.quantity : 0,
      bbq_full_set_count: options.bbq.type === 'premium' ? options.bbq.quantity : 0,
      // 식사 옵션
      meal_breakfast_count: options.breakfast ? (adults + children) : 0,
      // 교통 옵션
      transport_needs_bus: options.bus,
      // 체험 옵션 (나중에 추가될 예정)
      experience_farm_count: 0,
      // 추가 서비스
      extra_laundry_count: 0
    }

    // Supabase에 예약 데이터 저장
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single()
    
    if (reservationError) {
      console.error('Supabase 예약 저장 오류:', reservationError)
      throw new Error(`예약 저장 실패: ${reservationError.message}`)
    }

    // 선택된 프로그램이 있는 경우 reservation_programs 테이블에 저장
    if (selectedPrograms.length > 0) {
      const programReservations = selectedPrograms.map(program => ({
        reservation_id: reservation.id,
        program_id: program.id,
        quantity: 1,
        unit_price: program.price,
        total_price: program.unit === 'per_person' ? program.price * (adults + children) : program.price,
        scheduled_date: checkInDate,
        notes: null
      }))

      const { error: programError } = await supabase
        .from('reservation_programs')
        .insert(programReservations)

      if (programError) {
        console.error('프로그램 예약 저장 오류:', programError)
        // 메인 예약은 성공했으므로 프로그램 오류는 로그만 남기고 계속 진행
        console.warn('프로그램 예약 저장에 실패했지만 메인 예약은 성공했습니다.')
      }
    }

    return {
      success: true,
      reservation
    }

  } catch (error) {
    console.error('예약 트랜잭션 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '예약 생성 중 오류가 발생했습니다.'
    }
  }
}

// 기존 예약 조회 API
export async function GET() {
  try {
    // Supabase에서 예약 목록 조회
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        *,
        reservation_programs (
          id,
          program_id,
          quantity,
          unit_price,
          total_price,
          scheduled_date,
          programs (
            name,
            description
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase 조회 오류:', error)
      throw error
    }
    
    console.log('현재 저장된 예약 수:', reservations?.length || 0)
    
    return NextResponse.json({
      success: true,
      reservations: reservations || []
    })
  } catch (error) {
    console.error('예약 조회 오류:', error)
    return NextResponse.json({
      success: false,
      error: '예약 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
} 