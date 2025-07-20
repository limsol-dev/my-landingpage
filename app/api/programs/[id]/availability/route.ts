import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const quantity = searchParams.get('quantity')

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: '프로그램 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 프로그램 기본 정보 조회
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .eq('is_available', true)
      .single()

    if (programError || !program) {
      return NextResponse.json(
        { error: '프로그램을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 재고 확인
    let availableStock = program.stock_quantity || 0

    // 특정 날짜와 시간이 지정된 경우 예약 현황 확인
    if (date && time) {
      const { data: reservations, error: reservationError } = await supabase
        .from('reservation_programs')
        .select('quantity')
        .eq('program_id', id)
        .eq('scheduled_date', date)
        .eq('scheduled_time', time)

      if (reservationError) {
        console.error('예약 현황 조회 오류:', reservationError)
      } else if (reservations) {
        const bookedQuantity = reservations.reduce((sum: number, res: any) => sum + res.quantity, 0)
        availableStock = Math.max(0, availableStock - bookedQuantity)
      }
    }

    // 요청 수량 확인
    const requestedQuantity = quantity ? parseInt(quantity) : 1
    const isAvailable = availableStock >= requestedQuantity

    // 가능한 시간대 확인
    const availableTimes = program.available_times || []
    let availableTimesForDate: string[] = []

    if (date && availableTimes.length > 0) {
      // 각 시간대별 재고 확인
      for (const timeSlot of availableTimes) {
        const { data: timeReservations } = await supabase
          .from('reservation_programs')
          .select('quantity')
          .eq('program_id', id)
          .eq('scheduled_date', date)
          .eq('scheduled_time', timeSlot)

                 const timeBookedQuantity = timeReservations?.reduce((sum: number, res: any) => sum + res.quantity, 0) || 0
        const timeAvailableStock = Math.max(0, program.stock_quantity - timeBookedQuantity)

        if (timeAvailableStock >= requestedQuantity) {
          availableTimesForDate.push(timeSlot)
        }
      }
    } else {
      availableTimesForDate = availableTimes
    }

    const response = {
      programId: id,
      date: date || null,
      time: time || null,
      requestedQuantity,
      totalStock: program.stock_quantity,
      availableStock,
      isAvailable,
      availableTimes: availableTimesForDate,
      maxParticipants: program.max_participants,
      unit: program.unit,
      price: program.price
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('재고 확인 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { date, time, quantity = 1 } = body

    if (!date || !time) {
      return NextResponse.json(
        { error: '날짜와 시간이 필요합니다.' },
        { status: 400 }
      )
    }

    // 실시간 재고 확인 및 임시 예약
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .eq('is_available', true)
      .single()

    if (programError || !program) {
      return NextResponse.json(
        { error: '프로그램을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 현재 예약 현황 확인
    const { data: reservations, error: reservationError } = await supabase
      .from('reservation_programs')
      .select('quantity')
      .eq('program_id', id)
      .eq('scheduled_date', date)
      .eq('scheduled_time', time)

    if (reservationError) {
      return NextResponse.json(
        { error: '예약 현황을 확인할 수 없습니다.' },
        { status: 500 }
      )
    }

         const bookedQuantity = reservations?.reduce((sum: number, res: any) => sum + res.quantity, 0) || 0
    const availableStock = Math.max(0, program.stock_quantity - bookedQuantity)

    if (availableStock < quantity) {
      return NextResponse.json(
        { 
          success: false,
          error: '요청하신 수량이 재고를 초과합니다.',
          availableStock,
          requestedQuantity: quantity
        },
        { status: 409 }
      )
    }

    // 임시 예약 생성 (5분간 유효)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5분 후
    
    // 실제 구현에서는 Redis나 별도 임시 예약 테이블 사용 권장
    const tempReservationId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      data: {
        tempReservationId,
        programId: id,
        date,
        time,
        quantity,
        expiresAt: expiresAt.toISOString(),
        price: program.price * quantity
      }
    })

  } catch (error) {
    console.error('임시 예약 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 