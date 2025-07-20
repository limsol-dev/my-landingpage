import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createSuccessResponse, 
  createErrorResponse,
  canAccessResource
} from '@/lib/rbac'

interface RouteParams {
  params: {
    id: string
  }
}

// =============================================
// 개별 예약 조회 (GET /api/admin/reservations/[id])
// =============================================
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 관리자 권한 확인
    const authResult = await authorizeRequest(request, 'reservations:read')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const reservationId = params.id

    // 예약 정보 조회 (관련 정보 포함)
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select(`
        *,
        rooms (
          id,
          name,
          type,
          max_occupancy,
          base_price
        ),
        reservation_programs (
          id,
          program_id,
          quantity,
          unit_price,
          total_price,
          scheduled_date,
          scheduled_time,
          status,
          programs (
            id,
            name,
            description,
            category_name,
            base_price
          )
        ),
        payments (
          id,
          amount,
          payment_method,
          payment_status,
          payment_date,
          transaction_id
        )
      `)
      .eq('id', reservationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('예약을 찾을 수 없습니다', 404)
      }
      console.error('예약 조회 오류:', error)
      return createErrorResponse('예약 정보를 불러오는데 실패했습니다', 500)
    }

    // 리소스 접근 권한 확인
    if (!canAccessResource(authResult.user, reservation.user_id || '', 'reservation')) {
      return createErrorResponse('이 예약에 접근할 권한이 없습니다', 403)
    }

    return createSuccessResponse(
      { reservation },
      '예약 정보 조회 성공'
    )

  } catch (error) {
    console.error('예약 상세 조회 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 예약 수정 (PUT /api/admin/reservations/[id])
// =============================================
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 관리자 권한 확인
    const authResult = await authorizeRequest(request, 'reservations:write')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const reservationId = params.id
    const body = await request.json()

    // 기존 예약 정보 조회
    const { data: existingReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse('예약을 찾을 수 없습니다', 404)
      }
      return createErrorResponse('예약 정보를 불러오는데 실패했습니다', 500)
    }

    // 리소스 접근 권한 확인
    if (!canAccessResource(authResult.user, existingReservation.user_id || '', 'reservation')) {
      return createErrorResponse('이 예약을 수정할 권한이 없습니다', 403)
    }

    // 수정 가능한 필드 정의
    const allowedFields = [
      'customer_name', 'customer_email', 'customer_phone',
      'check_in_date', 'check_out_date', 'adults', 'children',
      'room_price', 'program_price', 'total_price',
      'status', 'payment_status', 'special_requests',
      'referrer', 'confirmed_date'
    ]

    // 수정할 데이터 필터링
    const updateData: any = {}
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // 날짜 유효성 검증 (날짜가 수정되는 경우)
    if (updateData.check_in_date || updateData.check_out_date) {
      const checkIn = new Date(updateData.check_in_date || existingReservation.check_in_date)
      const checkOut = new Date(updateData.check_out_date || existingReservation.check_out_date)
      
      if (checkIn >= checkOut) {
        return createErrorResponse('체크아웃 날짜는 체크인 날짜 이후여야 합니다', 400)
      }

      // 날짜 변경 시 객실 가용성 재확인
      if (updateData.check_in_date || updateData.check_out_date) {
        const { data: conflictingReservations, error: availabilityError } = await supabase
          .from('reservations')
          .select('id')
          .eq('room_id', existingReservation.room_id)
          .neq('id', reservationId) // 현재 예약 제외
          .gte('check_out_date', checkIn.toISOString().split('T')[0])
          .lte('check_in_date', checkOut.toISOString().split('T')[0])
          .neq('status', 'cancelled')

        if (availabilityError) {
          return createErrorResponse('가용성 확인 중 오류가 발생했습니다', 500)
        }

        if (conflictingReservations && conflictingReservations.length > 0) {
          return createErrorResponse('선택한 날짜에 다른 예약과 충돌합니다', 409)
        }
      }
    }

    // 확정 날짜 자동 설정
    if (updateData.status === 'confirmed' && !existingReservation.confirmed_date) {
      updateData.confirmed_date = new Date().toISOString().split('T')[0]
    }

    // 수정 시간 추가
    updateData.updated_at = new Date().toISOString()

    // 예약 정보 업데이트
    const { data: updatedReservation, error: updateError } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservationId)
      .select()
      .single()

    if (updateError) {
      console.error('예약 수정 오류:', updateError)
      return createErrorResponse('예약 수정에 실패했습니다', 500)
    }

    // 프로그램 업데이트 처리
    if (body.programs && Array.isArray(body.programs)) {
      // 기존 프로그램 삭제
      await supabase
        .from('reservation_programs')
        .delete()
        .eq('reservation_id', reservationId)

      // 새 프로그램 추가
      if (body.programs.length > 0) {
        const programData = body.programs.map((program: any) => ({
          reservation_id: reservationId,
          program_id: program.program_id,
          quantity: program.quantity || 1,
          unit_price: program.unit_price || 0,
          total_price: program.total_price || 0,
          scheduled_date: program.scheduled_date || updateData.check_in_date || existingReservation.check_in_date,
          scheduled_time: program.scheduled_time || null,
          status: program.status || 'confirmed'
        }))

        const { error: programError } = await supabase
          .from('reservation_programs')
          .insert(programData)

        if (programError) {
          console.error('예약 프로그램 업데이트 오류:', programError)
          // 경고만 표시, 예약 수정은 성공으로 처리
        }
      }
    }

    return createSuccessResponse(
      { reservation: updatedReservation },
      '예약이 성공적으로 수정되었습니다'
    )

  } catch (error) {
    console.error('예약 수정 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 예약 삭제 (DELETE /api/admin/reservations/[id])
// =============================================
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 관리자 권한 확인 (삭제는 더 높은 권한 필요)
    const authResult = await authorizeRequest(request, 'reservations:delete')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const reservationId = params.id

    // 기존 예약 정보 조회
    const { data: existingReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse('예약을 찾을 수 없습니다', 404)
      }
      return createErrorResponse('예약 정보를 불러오는데 실패했습니다', 500)
    }

    // 리소스 접근 권한 확인
    if (!canAccessResource(authResult.user, existingReservation.user_id || '', 'reservation')) {
      return createErrorResponse('이 예약을 삭제할 권한이 없습니다', 403)
    }

    // 삭제 가능 여부 확인 (완료된 예약은 삭제 불가)
    if (existingReservation.status === 'completed') {
      return createErrorResponse('완료된 예약은 삭제할 수 없습니다', 400)
    }

    // 관련 프로그램 먼저 삭제
    const { error: programDeleteError } = await supabase
      .from('reservation_programs')
      .delete()
      .eq('reservation_id', reservationId)

    if (programDeleteError) {
      console.error('예약 프로그램 삭제 오류:', programDeleteError)
      return createErrorResponse('예약 프로그램 삭제에 실패했습니다', 500)
    }

    // 관련 결제 정보 삭제
    const { error: paymentDeleteError } = await supabase
      .from('payments')
      .delete()
      .eq('reservation_id', reservationId)

    if (paymentDeleteError) {
      console.error('결제 정보 삭제 오류:', paymentDeleteError)
      return createErrorResponse('결제 정보 삭제에 실패했습니다', 500)
    }

    // 예약 삭제
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservationId)

    if (deleteError) {
      console.error('예약 삭제 오류:', deleteError)
      return createErrorResponse('예약 삭제에 실패했습니다', 500)
    }

    return createSuccessResponse(
      { deletedReservationId: reservationId },
      '예약이 성공적으로 삭제되었습니다'
    )

  } catch (error) {
    console.error('예약 삭제 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
} 