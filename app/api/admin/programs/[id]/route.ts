import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/rbac'

interface RouteParams {
  params: {
    id: string
  }
}

// =============================================
// 개별 프로그램 조회 (GET /api/admin/programs/[id])
// =============================================
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 프로그램 조회 권한 확인
    const authResult = await authorizeRequest(request, 'programs:read')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const programId = params.id

    // 프로그램 정보 조회 (관련 정보 포함)
    const { data: program, error } = await supabase
      .from('programs')
      .select(`
        *,
        program_categories (
          id,
          name,
          description,
          icon,
          color_theme
        ),
        reservation_programs (
          id,
          reservation_id,
          quantity,
          scheduled_date,
          status
        )
      `)
      .eq('id', programId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('프로그램을 찾을 수 없습니다', 404)
      }
      console.error('프로그램 조회 오류:', error)
      return createErrorResponse('프로그램 정보를 불러오는데 실패했습니다', 500)
    }

    // 프로그램 예약 통계 계산
    const reservationStats = {
      totalReservations: program.reservation_programs?.length || 0,
      activeReservations: program.reservation_programs?.filter(
        (rp: any) => rp.status === 'confirmed'
      ).length || 0,
      upcomingReservations: program.reservation_programs?.filter(
        (rp: any) => rp.status === 'confirmed' && new Date(rp.scheduled_date) > new Date()
      ).length || 0
    }

    return createSuccessResponse(
      { 
        program: {
          ...program,
          stats: reservationStats
        }
      },
      '프로그램 정보 조회 성공'
    )

  } catch (error) {
    console.error('프로그램 상세 조회 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 프로그램 수정 (PUT /api/admin/programs/[id])
// =============================================
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 프로그램 수정 권한 확인
    const authResult = await authorizeRequest(request, 'programs:write')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const programId = params.id
    const body = await request.json()

    // 기존 프로그램 정보 조회
    const { data: existingProgram, error: fetchError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse('프로그램을 찾을 수 없습니다', 404)
      }
      return createErrorResponse('프로그램 정보를 불러오는데 실패했습니다', 500)
    }

    // 수정 가능한 필드 정의
    const allowedFields = [
      'name', 'description', 'category_id', 'base_price', 'duration_minutes',
      'max_participants', 'min_participants', 'is_available', 'requires_reservation',
      'advance_booking_days', 'cancellation_hours', 'images', 'features',
      'included_items', 'preparation_notes', 'age_restriction', 'difficulty_level',
      'location', 'weather_dependent', 'seasonal_availability'
    ]

    // 수정할 데이터 필터링
    const updateData: any = {}
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // 유효성 검증
    if (updateData.base_price !== undefined && updateData.base_price < 0) {
      return createErrorResponse('기본 가격은 0 이상이어야 합니다', 400)
    }

    if (updateData.duration_minutes !== undefined && updateData.duration_minutes <= 0) {
      return createErrorResponse('프로그램 소요시간은 0보다 커야 합니다', 400)
    }

    if (updateData.min_participants !== undefined && updateData.min_participants <= 0) {
      return createErrorResponse('최소 참가자 수는 1 이상이어야 합니다', 400)
    }

    if (updateData.max_participants !== undefined && updateData.min_participants !== undefined) {
      if (updateData.max_participants < updateData.min_participants) {
        return createErrorResponse('최대 참가자 수는 최소 참가자 수 이상이어야 합니다', 400)
      }
    }

    // 카테고리 변경 시 유효성 확인
    if (updateData.category_id && updateData.category_id !== existingProgram.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('program_categories')
        .select('id')
        .eq('id', updateData.category_id)
        .eq('is_active', true)
        .single()

      if (categoryError || !category) {
        return createErrorResponse('유효하지 않은 카테고리입니다', 400)
      }
    }

    // 수정 시간 추가
    updateData.updated_at = new Date().toISOString()

    // 프로그램 정보 업데이트
    const { data: updatedProgram, error: updateError } = await supabase
      .from('programs')
      .update(updateData)
      .eq('id', programId)
      .select(`
        *,
        program_categories (
          id,
          name,
          description
        )
      `)
      .single()

    if (updateError) {
      console.error('프로그램 수정 오류:', updateError)
      return createErrorResponse('프로그램 수정에 실패했습니다', 500)
    }

    return createSuccessResponse(
      { program: updatedProgram },
      '프로그램이 성공적으로 수정되었습니다'
    )

  } catch (error) {
    console.error('프로그램 수정 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 프로그램 삭제 (DELETE /api/admin/programs/[id])
// =============================================
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 프로그램 삭제 권한 확인 (더 높은 권한 필요)
    const authResult = await authorizeRequest(request, 'programs:delete')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const programId = params.id

    // 기존 프로그램 정보 조회
    const { data: existingProgram, error: fetchError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse('프로그램을 찾을 수 없습니다', 404)
      }
      return createErrorResponse('프로그램 정보를 불러오는데 실패했습니다', 500)
    }

    // 활성 예약이 있는지 확인
    const { data: activeReservations, error: reservationError } = await supabase
      .from('reservation_programs')
      .select('id')
      .eq('program_id', programId)
      .in('status', ['confirmed', 'pending'])

    if (reservationError) {
      return createErrorResponse('예약 확인 중 오류가 발생했습니다', 500)
    }

    if (activeReservations && activeReservations.length > 0) {
      return createErrorResponse(
        '활성 예약이 있는 프로그램은 삭제할 수 없습니다. 먼저 모든 예약을 처리해주세요.',
        400
      )
    }

    // 프로그램 삭제 (소프트 삭제 권장)
    const { error: deleteError } = await supabase
      .from('programs')
      .update({ 
        is_available: false, 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', programId)

    if (deleteError) {
      console.error('프로그램 삭제 오류:', deleteError)
      return createErrorResponse('프로그램 삭제에 실패했습니다', 500)
    }

    return createSuccessResponse(
      { deletedProgramId: programId },
      '프로그램이 성공적으로 삭제되었습니다'
    )

  } catch (error) {
    console.error('프로그램 삭제 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
} 