import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/rbac'

// =============================================
// 프로그램 목록 조회 (GET /api/admin/programs)
// =============================================
export async function GET(request: NextRequest) {
  try {
    // 프로그램 조회 권한 확인
    const authResult = await authorizeRequest(request, 'programs:read')
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
    const category = searchParams.get('category') || ''
    const isAvailable = searchParams.get('isAvailable')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 페이지네이션 설정
    const offset = (page - 1) * limit

    // 기본 쿼리 구성
    let query = supabase
      .from('programs')
      .select(`
        *,
        program_categories (
          id,
          name,
          description
        )
      `, { count: 'exact' })

    // 검색 조건 적용
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    // 카테고리 필터
    if (category) {
      query = query.eq('category_id', category)
    }

    // 가용성 필터
    if (isAvailable !== null) {
      const available = isAvailable === 'true'
      query = query.eq('is_available', available)
    }

    // 정렬 적용
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    const { data: programs, error, count } = await query

    if (error) {
      console.error('프로그램 조회 오류:', error)
      return createErrorResponse('프로그램 목록을 불러오는데 실패했습니다', 500)
    }

    // 응답 데이터 구성
    return createSuccessResponse({
      programs: programs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        search,
        category,
        isAvailable,
        sortBy,
        sortOrder
      }
    }, '프로그램 목록 조회 성공')

  } catch (error) {
    console.error('프로그램 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 새 프로그램 생성 (POST /api/admin/programs)
// =============================================
export async function POST(request: NextRequest) {
  try {
    // 프로그램 생성 권한 확인
    const authResult = await authorizeRequest(request, 'programs:write')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const body = await request.json()
    
    // 필수 필드 검증
    const requiredFields = ['name', 'category_id', 'base_price', 'duration_minutes']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return createErrorResponse(
        `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
        400
      )
    }

    // 가격 유효성 검증
    if (body.base_price < 0) {
      return createErrorResponse('기본 가격은 0 이상이어야 합니다', 400)
    }

    // 기간 유효성 검증
    if (body.duration_minutes <= 0) {
      return createErrorResponse('프로그램 소요시간은 0보다 커야 합니다', 400)
    }

    // 카테고리 존재 확인
    const { data: category, error: categoryError } = await supabase
      .from('program_categories')
      .select('id')
      .eq('id', body.category_id)
      .eq('is_active', true)
      .single()

    if (categoryError || !category) {
      return createErrorResponse('유효하지 않은 카테고리입니다', 400)
    }

    // 프로그램 데이터 생성
    const programData = {
      name: body.name,
      description: body.description || null,
      category_id: body.category_id,
      base_price: body.base_price,
      duration_minutes: body.duration_minutes,
      max_participants: body.max_participants || null,
      min_participants: body.min_participants || 1,
      is_available: body.is_available !== undefined ? body.is_available : true,
      requires_reservation: body.requires_reservation !== undefined ? body.requires_reservation : true,
      advance_booking_days: body.advance_booking_days || 1,
      cancellation_hours: body.cancellation_hours || 24,
      images: body.images || [],
      features: body.features || [],
      included_items: body.included_items || [],
      preparation_notes: body.preparation_notes || null,
      age_restriction: body.age_restriction || null,
      difficulty_level: body.difficulty_level || 'beginner',
      location: body.location || null,
      weather_dependent: body.weather_dependent || false,
      seasonal_availability: body.seasonal_availability || null
    }

    // 데이터베이스에 프로그램 저장
    const { data: newProgram, error: insertError } = await supabase
      .from('programs')
      .insert(programData)
      .select(`
        *,
        program_categories (
          id,
          name,
          description
        )
      `)
      .single()

    if (insertError) {
      console.error('프로그램 생성 오류:', insertError)
      return createErrorResponse('프로그램 생성에 실패했습니다', 500)
    }

    return createSuccessResponse(
      { program: newProgram },
      '프로그램이 성공적으로 생성되었습니다'
    )

  } catch (error) {
    console.error('프로그램 생성 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
} 