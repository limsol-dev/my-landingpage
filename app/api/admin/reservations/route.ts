import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createSuccessResponse, 
  createErrorResponse,
  canAccessResource
} from '@/lib/rbac'

// =============================================
// 예약 목록 조회 (GET /api/admin/reservations)
// =============================================
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authResult = await authorizeRequest(request, 'reservations:read')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 페이지네이션 설정
    const offset = (page - 1) * limit

    // 기본 쿼리 구성
    let query = supabase
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
          programs (
            id,
            name,
            description
          )
        )
      `, { count: 'exact' })

    // 검색 조건 적용
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`
      )
    }

    // 상태 필터
    if (status) {
      query = query.eq('status', status)
    }

    // 날짜 범위 필터
    if (startDate) {
      query = query.gte('check_in_date', startDate)
    }
    if (endDate) {
      query = query.lte('check_out_date', endDate)
    }

    // 사용자 역할에 따른 필터링
    if (authResult.user.role === 'group_leader') {
      // 모임장은 본인 예약만 조회
      query = query.eq('user_id', authResult.user.id)
    }

    // 정렬 적용
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    const { data: reservations, error, count } = await query

    if (error) {
      console.error('예약 조회 오류:', error)
      return createErrorResponse('예약 목록을 불러오는데 실패했습니다', 500)
    }

    // 응답 데이터 구성
    return createSuccessResponse({
      reservations: reservations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        search,
        status,
        startDate,
        endDate,
        sortBy,
        sortOrder
      }
    }, '예약 목록 조회 성공')

  } catch (error) {
    console.error('예약 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 새 예약 생성 (POST /api/admin/reservations)
// =============================================
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authResult = await authorizeRequest(request, 'reservations:write')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const body = await request.json()
    
    // 필수 필드 검증
    const requiredFields = ['customer_name', 'customer_email', 'customer_phone', 'room_id', 'check_in_date', 'check_out_date', 'adults', 'total_price']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return createErrorResponse(
        `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
        400
      )
    }

    // 날짜 유효성 검증
    const checkIn = new Date(body.check_in_date)
    const checkOut = new Date(body.check_out_date)
    
    if (checkIn >= checkOut) {
      return createErrorResponse('체크아웃 날짜는 체크인 날짜 이후여야 합니다', 400)
    }

    // 객실 가용성 확인
    const { data: existingReservations, error: availabilityError } = await supabase
      .from('reservations')
      .select('id')
      .eq('room_id', body.room_id)
      .gte('check_out_date', body.check_in_date)
      .lte('check_in_date', body.check_out_date)
      .neq('status', 'cancelled')

    if (availabilityError) {
      return createErrorResponse('가용성 확인 중 오류가 발생했습니다', 500)
    }

    if (existingReservations && existingReservations.length > 0) {
      return createErrorResponse('선택한 날짜에 이미 예약이 있습니다', 409)
    }

    // 예약 데이터 생성
    const reservationData = {
      user_id: body.user_id || authResult.user.id,
      room_id: body.room_id,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      check_in_date: body.check_in_date,
      check_out_date: body.check_out_date,
      adults: body.adults,
      children: body.children || 0,
      room_price: body.room_price || body.total_price,
      program_price: body.program_price || 0,
      total_price: body.total_price,
      status: body.status || 'pending',
      payment_status: body.payment_status || 'pending',
      special_requests: body.special_requests || null,
      referrer: body.referrer || null,
      group_reservation_id: body.group_reservation_id || null
    }

    // 데이터베이스에 예약 저장
    const { data: newReservation, error: insertError } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single()

    if (insertError) {
      console.error('예약 생성 오류:', insertError)
      return createErrorResponse('예약 생성에 실패했습니다', 500)
    }

    // 선택된 프로그램이 있으면 추가
    if (body.programs && Array.isArray(body.programs)) {
      const programData = body.programs.map((program: any) => ({
        reservation_id: newReservation.id,
        program_id: program.program_id,
        quantity: program.quantity || 1,
        unit_price: program.unit_price || 0,
        total_price: program.total_price || 0,
        scheduled_date: program.scheduled_date || body.check_in_date,
        scheduled_time: program.scheduled_time || null,
        status: 'confirmed'
      }))

      const { error: programError } = await supabase
        .from('reservation_programs')
        .insert(programData)

      if (programError) {
        console.error('예약 프로그램 추가 오류:', programError)
        // 예약은 생성되었지만 프로그램 추가 실패 - 경고만 표시
      }
    }

    return createSuccessResponse(
      { reservation: newReservation },
      '예약이 성공적으로 생성되었습니다'
    )

  } catch (error) {
    console.error('예약 생성 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
} 