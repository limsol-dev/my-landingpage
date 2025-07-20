import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/rbac'

// =============================================
// 사용자 목록 조회 (GET /api/admin/users)
// =============================================
export async function GET(request: NextRequest) {
  try {
    // 사용자 조회 권한 확인
    const authResult = await authorizeRequest(request, 'users:read')
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
    const role = searchParams.get('role') || ''
    const isActive = searchParams.get('isActive')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 페이지네이션 설정
    const offset = (page - 1) * limit

    // 기본 쿼리 구성
    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        reservations!inner (
          id,
          check_in_date,
          total_price,
          status
        )
      `, { count: 'exact' })

    // 검색 조건 적용
    if (search) {
      query = query.or(
        `username.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    // 역할 필터
    if (role) {
      query = query.eq('role', role)
    }

    // 활성 상태 필터
    if (isActive !== null) {
      const active = isActive === 'true'
      query = query.eq('is_active', active)
    }

    // 정렬 적용
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) {
      console.error('사용자 조회 오류:', error)
      return createErrorResponse('사용자 목록을 불러오는데 실패했습니다', 500)
    }

    // 사용자별 통계 계산
    const usersWithStats = users?.map((user: any) => {
      const userReservations = user.reservations || []
      const totalReservations = userReservations.length
      const totalSpent = userReservations
        .filter((r: any) => r.status === 'completed')
        .reduce((sum: number, r: any) => sum + (r.total_price || 0), 0)
      const lastReservation = userReservations
        .sort((a: any, b: any) => new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime())[0]

      return {
        ...user,
        stats: {
          totalReservations,
          totalSpent,
          lastReservationDate: lastReservation?.check_in_date || null,
          averageSpent: totalReservations > 0 ? Math.round(totalSpent / totalReservations) : 0
        },
        reservations: undefined // 중복 데이터 제거
      }
    }) || []

    // 응답 데이터 구성
    return createSuccessResponse({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        search,
        role,
        isActive,
        sortBy,
        sortOrder
      }
    }, '사용자 목록 조회 성공')

  } catch (error) {
    console.error('사용자 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 새 사용자 생성 (POST /api/admin/users)
// =============================================
export async function POST(request: NextRequest) {
  try {
    // 사용자 생성 권한 확인
    const authResult = await authorizeRequest(request, 'users:write')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const body = await request.json()
    
    // 필수 필드 검증
    const requiredFields = ['username', 'email', 'password']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return createErrorResponse(
        `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
        400
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return createErrorResponse('유효하지 않은 이메일 형식입니다', 400)
    }

    // 사용자명 중복 확인
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .or(`username.eq.${body.username},email.eq.${body.email}`)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      return createErrorResponse('사용자 중복 확인 중 오류가 발생했습니다', 500)
    }

    if (existingUser) {
      return createErrorResponse('이미 존재하는 사용자명 또는 이메일입니다', 409)
    }

    // Supabase Auth를 통해 사용자 생성
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        username: body.username,
        full_name: body.full_name || null
      }
    })

    if (authError) {
      console.error('Auth 사용자 생성 오류:', authError)
      return createErrorResponse('사용자 생성에 실패했습니다', 500)
    }

    // 사용자 프로필 데이터 생성
    const profileData = {
      id: authUser.user.id,
      username: body.username,
      email: body.email,
      full_name: body.full_name || null,
      phone: body.phone || null,
      birth_date: body.birth_date || null,
      profile_image: body.profile_image || null,
      bio: body.bio || null,
      role: body.role || 'user',
      is_active: body.is_active !== undefined ? body.is_active : true,
      email_verified: true
    }

    // 프로필 저장
    const { data: newProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (profileError) {
      console.error('프로필 생성 오류:', profileError)
      // Auth 사용자는 생성되었지만 프로필 생성 실패 - 정리 필요
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return createErrorResponse('사용자 프로필 생성에 실패했습니다', 500)
    }

    return createSuccessResponse(
      { user: newProfile },
      '사용자가 성공적으로 생성되었습니다'
    )

  } catch (error) {
    console.error('사용자 생성 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
} 