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
// 개별 사용자 조회 (GET /api/admin/users/[id])
// =============================================
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 사용자 조회 권한 확인
    const authResult = await authorizeRequest(request, 'users:read')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const userId = params.id

    // 사용자 정보 조회 (예약 이력 포함)
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        reservations (
          id,
          check_in_date,
          check_out_date,
          adults,
          children,
          total_price,
          status,
          payment_status,
          created_at,
          rooms (
            id,
            name,
            type
          ),
          reservation_programs (
            id,
            quantity,
            total_price,
            programs (
              id,
              name,
              category_name
            )
          )
        )
      `)
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('사용자를 찾을 수 없습니다', 404)
      }
      console.error('사용자 조회 오류:', error)
      return createErrorResponse('사용자 정보를 불러오는데 실패했습니다', 500)
    }

    // 리소스 접근 권한 확인
    if (!canAccessResource(authResult.user, userId, 'profile')) {
      return createErrorResponse('이 사용자 정보에 접근할 권한이 없습니다', 403)
    }

    // 사용자 통계 계산
    const reservations = user.reservations || []
    const stats = {
      totalReservations: reservations.length,
      completedReservations: reservations.filter((r: any) => r.status === 'completed').length,
      totalSpent: reservations
        .filter((r: any) => r.status === 'completed')
        .reduce((sum: number, r: any) => sum + (r.total_price || 0), 0),
      averageStayDuration: reservations.length > 0 
        ? Math.round(reservations.reduce((sum: number, r: any) => {
            const checkIn = new Date(r.check_in_date)
            const checkOut = new Date(r.check_out_date)
            const duration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            return sum + duration
          }, 0) / reservations.length)
        : 0,
      firstReservation: reservations.length > 0 
        ? reservations.sort((a: any, b: any) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )[0]?.created_at
        : null,
      lastReservation: reservations.length > 0 
        ? reservations.sort((a: any, b: any) => 
            new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime()
          )[0]?.check_in_date
        : null,
             preferredRoomTypes: getPreferredRoomTypes(reservations),
       favoritePrograms: getFavoritePrograms(reservations)
    }

    return createSuccessResponse(
      { 
        user: {
          ...user,
          stats
        }
      },
      '사용자 정보 조회 성공'
    )

  } catch (error) {
    console.error('사용자 상세 조회 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 사용자 정보 수정 (PUT /api/admin/users/[id])
// =============================================
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 사용자 수정 권한 확인
    const authResult = await authorizeRequest(request, 'users:write')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const userId = params.id
    const body = await request.json()

    // 기존 사용자 정보 조회
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse('사용자를 찾을 수 없습니다', 404)
      }
      return createErrorResponse('사용자 정보를 불러오는데 실패했습니다', 500)
    }

    // 리소스 접근 권한 확인
    if (!canAccessResource(authResult.user, userId, 'profile')) {
      return createErrorResponse('이 사용자 정보를 수정할 권한이 없습니다', 403)
    }

    // 수정 가능한 필드 정의
    const allowedFields = [
      'username', 'email', 'full_name', 'phone', 'birth_date',
      'profile_image', 'bio', 'role', 'is_active'
    ]

    // super_admin만 역할 변경 가능
    if (body.role && authResult.user.role !== 'super_admin') {
      return createErrorResponse('역할 변경은 최고 관리자만 가능합니다', 403)
    }

    // 수정할 데이터 필터링
    const updateData: any = {}
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // 이메일 변경 시 유효성 검증
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return createErrorResponse('유효하지 않은 이메일 형식입니다', 400)
      }

      // 이메일 중복 확인
      const { data: duplicateEmail, error: emailCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', updateData.email)
        .neq('id', userId)
        .single()

      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        return createErrorResponse('이메일 중복 확인 중 오류가 발생했습니다', 500)
      }

      if (duplicateEmail) {
        return createErrorResponse('이미 사용 중인 이메일입니다', 409)
      }
    }

    // 사용자명 변경 시 중복 확인
    if (updateData.username && updateData.username !== existingUser.username) {
      const { data: duplicateUsername, error: usernameCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', updateData.username)
        .neq('id', userId)
        .single()

      if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
        return createErrorResponse('사용자명 중복 확인 중 오류가 발생했습니다', 500)
      }

      if (duplicateUsername) {
        return createErrorResponse('이미 사용 중인 사용자명입니다', 409)
      }
    }

    // 수정 시간 추가
    updateData.updated_at = new Date().toISOString()

    // 사용자 정보 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('사용자 정보 수정 오류:', updateError)
      return createErrorResponse('사용자 정보 수정에 실패했습니다', 500)
    }

    return createSuccessResponse(
      { user: updatedUser },
      '사용자 정보가 성공적으로 수정되었습니다'
    )

  } catch (error) {
    console.error('사용자 수정 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 사용자 삭제 (DELETE /api/admin/users/[id])
// =============================================
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 사용자 삭제 권한 확인 (최고 권한 필요)
    const authResult = await authorizeRequest(request, 'users:delete')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const userId = params.id

    // 본인 삭제 방지
    if (userId === authResult.user.id) {
      return createErrorResponse('본인 계정은 삭제할 수 없습니다', 400)
    }

    // 기존 사용자 정보 조회
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse('사용자를 찾을 수 없습니다', 404)
      }
      return createErrorResponse('사용자 정보를 불러오는데 실패했습니다', 500)
    }

    // 활성 예약이 있는지 확인
    const { data: activeReservations, error: reservationError } = await supabase
      .from('reservations')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['confirmed', 'pending'])

    if (reservationError) {
      return createErrorResponse('예약 확인 중 오류가 발생했습니다', 500)
    }

    if (activeReservations && activeReservations.length > 0) {
      return createErrorResponse(
        '활성 예약이 있는 사용자는 삭제할 수 없습니다. 먼저 모든 예약을 처리해주세요.',
        400
      )
    }

    // 사용자 비활성화 (소프트 삭제)
    const { error: deactivateError } = await supabase
      .from('user_profiles')
      .update({ 
        is_active: false,
        username: `${existingUser.username}_deleted_${Date.now()}`,
        email: `deleted_${Date.now()}_${existingUser.email}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (deactivateError) {
      console.error('사용자 비활성화 오류:', deactivateError)
      return createErrorResponse('사용자 삭제에 실패했습니다', 500)
    }

    return createSuccessResponse(
      { deletedUserId: userId },
      '사용자가 성공적으로 삭제되었습니다'
    )

  } catch (error) {
    console.error('사용자 삭제 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 헬퍼 함수들
// =============================================

function getPreferredRoomTypes(reservations: any[]): string[] {
  const roomTypeCount: { [key: string]: number } = {}
  
  reservations.forEach((reservation: any) => {
    const roomType = reservation.rooms?.type || 'unknown'
    roomTypeCount[roomType] = (roomTypeCount[roomType] || 0) + 1
  })

  return Object.entries(roomTypeCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type)
}

function getFavoritePrograms(reservations: any[]): string[] {
  const programCount: { [key: string]: number } = {}
  
  reservations.forEach((reservation: any) => {
    reservation.reservation_programs?.forEach((rp: any) => {
      const programName = rp.programs?.name || 'unknown'
      programCount[programName] = (programCount[programName] || 0) + rp.quantity
    })
  })

  return Object.entries(programCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name)
} 