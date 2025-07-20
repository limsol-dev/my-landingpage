import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let query = supabase
      .from('programs')
      .select(`
        *,
        category:program_categories(id, name, description, icon),
        partner:partners(id, name)
      `)
      .eq('is_available', true)
      .order('sort_order', { ascending: true })

    // 카테고리 필터링
    if (category) {
      query = query.eq('category_id', category)
    }

    // 검색 필터링
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 페이지네이션
    if (limit) {
      const limitNum = parseInt(limit)
      const offsetNum = offset ? parseInt(offset) : 0
      query = query.range(offsetNum, offsetNum + limitNum - 1)
    }

    const { data: programs, error } = await query

    if (error) {
      console.error('프로그램 조회 오류:', error)
      return NextResponse.json(
        { error: '프로그램을 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    // 데이터베이스에 데이터가 없는 경우 샘플 데이터 반환
    if (!programs || programs.length === 0) {
      const { programs: samplePrograms } = await import('@/data/programs')
      
      // 카테고리 필터링 적용
      let filteredPrograms = samplePrograms
      if (category) {
        filteredPrograms = samplePrograms.filter(p => p.category === category)
      }
      
      // 검색 필터링 적용
      if (search) {
        const searchLower = search.toLowerCase()
        filteredPrograms = filteredPrograms.filter(p => 
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        )
      }

      return NextResponse.json({
        success: true,
        data: filteredPrograms,
        total: filteredPrograms.length,
        message: '샘플 데이터를 반환했습니다.'
      })
    }

    // 프로그램 데이터 변환
    const transformedPrograms = programs.map((program: any) => ({
      id: program.id,
      name: program.name,
      description: program.description,
      price: program.price,
      unit: program.unit,
      maxParticipants: program.max_participants,
      duration: program.duration_minutes,
      availableTimes: program.available_times,
      category: program.category,
      partner: program.partner,
      images: program.images,
      stockQuantity: program.stock_quantity,
      isAvailable: program.is_available,
      requirements: program.requirements
    }))

    return NextResponse.json({
      success: true,
      data: transformedPrograms,
      total: transformedPrograms.length
    })

  } catch (error) {
    console.error('프로그램 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 