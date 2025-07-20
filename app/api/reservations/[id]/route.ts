import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id

    if (!reservationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '예약 ID가 필요합니다.' 
        },
        { status: 400 }
      )
    }

    // Supabase에서 예약 정보 조회 (관련 프로그램 정보 포함)
    const { data: reservation, error } = await supabase
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
          scheduled_time,
          notes,
          programs (
            id,
            name,
            description,
            price,
            unit,
            duration_minutes,
            category:program_categories(name, description)
          )
        )
      `)
      .eq('id', reservationId)
      .single()

    if (error) {
      console.error('Supabase 예약 조회 오류:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false, 
            error: '예약 정보를 찾을 수 없습니다.' 
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { 
          success: false, 
          error: '예약 정보 조회 중 오류가 발생했습니다.' 
        },
        { status: 500 }
      )
    }

    if (!reservation) {
      return NextResponse.json(
        { 
          success: false, 
          error: '예약 정보를 찾을 수 없습니다.' 
        },
        { status: 404 }
      )
    }

    // 응답 데이터 포맷팅
    const formattedReservation = {
      ...reservation,
      // 숙박 일수 계산
      nights: Math.ceil(
        (new Date(reservation.check_out_date).getTime() - 
         new Date(reservation.check_in_date).getTime()) / 
        (1000 * 60 * 60 * 24)
      ),
      // 프로그램 총 가격 계산
      programs_total_price: reservation.reservation_programs?.reduce(
        (sum: number, program: any) => sum + program.total_price, 
        0
      ) || 0
    }

    return NextResponse.json({
      success: true,
      reservation: formattedReservation
    })

  } catch (error) {
    console.error('예약 조회 API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '예약 정보 조회 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}

// 예약 정보 업데이트 (관리자 전용)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id
    const updateData = await request.json()

    if (!reservationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '예약 ID가 필요합니다.' 
        },
        { status: 400 }
      )
    }

    // 허용된 업데이트 필드만 필터링
    const allowedFields = [
      'status',
      'payment_status',
      'special_requests',
      'confirmed_at',
      'cancelled_at'
    ]

    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updateData[key]
        return obj
      }, {})

    // 업데이트 시간 추가
    filteredData.updated_at = new Date().toISOString()

    // Supabase에서 예약 정보 업데이트
    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update(filteredData)
      .eq('id', reservationId)
      .select()
      .single()

    if (error) {
      console.error('Supabase 예약 업데이트 오류:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: '예약 정보 업데이트 중 오류가 발생했습니다.' 
        },
        { status: 500 }
      )
    }

    if (!updatedReservation) {
      return NextResponse.json(
        { 
          success: false, 
          error: '예약 정보를 찾을 수 없습니다.' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
      message: '예약 정보가 성공적으로 업데이트되었습니다.'
    })

  } catch (error) {
    console.error('예약 업데이트 API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '예약 정보 업데이트 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}

// 예약 취소 (소프트 딜리트)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id

    if (!reservationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '예약 ID가 필요합니다.' 
        },
        { status: 400 }
      )
    }

    // 예약 취소 (상태를 cancelled로 변경)
    const { data: cancelledReservation, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)
      .select()
      .single()

    if (error) {
      console.error('Supabase 예약 취소 오류:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: '예약 취소 중 오류가 발생했습니다.' 
        },
        { status: 500 }
      )
    }

    if (!cancelledReservation) {
      return NextResponse.json(
        { 
          success: false, 
          error: '예약 정보를 찾을 수 없습니다.' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      reservation: cancelledReservation,
      message: '예약이 성공적으로 취소되었습니다.'
    })

  } catch (error) {
    console.error('예약 취소 API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '예약 취소 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
} 