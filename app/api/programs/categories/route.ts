import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: categories, error } = await supabase
      .from('program_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('카테고리 조회 오류:', error)
      return NextResponse.json(
        { error: '카테고리를 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    // 데이터베이스에 데이터가 없는 경우 기본 카테고리 반환
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        {
          id: 'healing',
          name: '힐링 프로그램',
          description: '자연과 함께하는 힐링 체험',
          icon: 'heart',
          sort_order: 1,
          is_active: true
        },
        {
          id: 'education',
          name: '교육 프로그램',
          description: '배움과 성장의 기회',
          icon: 'book',
          sort_order: 2,
          is_active: true
        },
        {
          id: 'pension',
          name: '펜션 숙박',
          description: '편안한 숙박과 휴식',
          icon: 'home',
          sort_order: 3,
          is_active: true
        }
      ]

      return NextResponse.json({
        success: true,
        data: defaultCategories,
        message: '기본 카테고리를 반환했습니다.'
      })
    }

    return NextResponse.json({
      success: true,
      data: categories
    })

  } catch (error) {
    console.error('카테고리 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 