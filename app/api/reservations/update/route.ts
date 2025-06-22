import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ReservationUpdate } from '@/types/supabase'
import { formatReservationFromSupabase } from '@/lib/supabase-utils'

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

    // Supabase 업데이트 데이터 준비
    const supabaseUpdateData: ReservationUpdate = {
      updated_at: new Date().toISOString()
    }

    // 필드 매핑
    if (updateData.status) supabaseUpdateData.status = updateData.status
    if (updateData.paymentStatus) supabaseUpdateData.payment_status = updateData.paymentStatus
    if (updateData.confirmedDate) supabaseUpdateData.confirmed_date = updateData.confirmedDate
    if (updateData.customerName) supabaseUpdateData.customer_name = updateData.customerName
    if (updateData.phone) supabaseUpdateData.phone = updateData.phone
    if (updateData.email) supabaseUpdateData.email = updateData.email
    if (updateData.participants) supabaseUpdateData.participants = updateData.participants
    if (updateData.programType) supabaseUpdateData.program_type = updateData.programType
    if (updateData.totalPrice) supabaseUpdateData.total_price = updateData.totalPrice
    if (updateData.startDate) supabaseUpdateData.start_date = updateData.startDate
    if (updateData.endDate) supabaseUpdateData.end_date = updateData.endDate
    if (updateData.referrer) supabaseUpdateData.referrer = updateData.referrer
    if (updateData.specialRequests) supabaseUpdateData.special_requests = updateData.specialRequests

    // Supabase에서 예약 업데이트
    const { data: updatedReservation, error } = await supabaseAdmin
      .from('reservations')
      .update(supabaseUpdateData)
      .eq('id', updateData.reservationId)
      .select()
      .single()

    if (error) {
      console.error('Supabase 업데이트 오류:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '예약을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      
      throw new Error(`데이터베이스 업데이트 실패: ${error.message}`)
    }

    console.log('예약 업데이트 완료 (Supabase):', updatedReservation.id)

    // supabase-utils 함수를 사용하여 응답 데이터 변환
    const responseReservation = formatReservationFromSupabase(updatedReservation)

    return NextResponse.json({
      success: true,
      message: '예약이 성공적으로 업데이트되었습니다.',
      reservation: responseReservation
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