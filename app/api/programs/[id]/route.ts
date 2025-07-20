import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: '프로그램 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const { data: program, error } = await supabase
      .from('programs')
      .select(`
        *,
        category:program_categories(id, name, description, icon),
        partner:partners(id, name, contact_name, contact_phone, address)
      `)
      .eq('id', id)
      .eq('is_available', true)
      .single()

    if (error || !program) {
      console.error('프로그램 조회 오류:', error)
      
      // 데이터베이스에 데이터가 없는 경우 샘플 데이터에서 찾기
      const { programs: samplePrograms } = await import('@/data/programs')
      const sampleProgram = samplePrograms.find(p => p.id === id)
      
      if (sampleProgram) {
        return NextResponse.json({
          success: true,
          data: sampleProgram,
          message: '샘플 데이터를 반환했습니다.'
        })
      }

      return NextResponse.json(
        { error: '프로그램을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 프로그램 데이터 변환
    const transformedProgram = {
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
      requirements: program.requirements,
      createdAt: program.created_at,
      updatedAt: program.updated_at
    }

    return NextResponse.json({
      success: true,
      data: transformedProgram
    })

  } catch (error) {
    console.error('프로그램 상세 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 