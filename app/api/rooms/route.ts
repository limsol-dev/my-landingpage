import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const available = searchParams.get('available')
    const maxPrice = searchParams.get('maxPrice')
    const minGuests = searchParams.get('minGuests')

    // Supabase 쿼리 시작
    let query = supabase
      .from('rooms')
      .select('*')
      .order('sort_order', { ascending: true })

    // 필터 적용
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (available === 'true') {
      query = query.eq('is_available', true)
    }

    if (maxPrice) {
      query = query.lte('base_price', parseInt(maxPrice))
    }

    if (minGuests) {
      query = query.gte('max_guests', parseInt(minGuests))
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase 오류:', error)
      // Supabase 오류 시 샘플 데이터 반환
      return NextResponse.json({
        success: true,
        data: getSampleRooms(),
        message: 'Supabase 설정이 필요합니다. 샘플 데이터를 사용합니다.'
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('객실 목록 조회 오류:', error)
    
    // 오류 시 샘플 데이터 반환
    return NextResponse.json({
      success: true,
      data: getSampleRooms(),
      message: '샘플 데이터를 사용합니다.'
    })
  }
}

// 샘플 데이터 함수
function getSampleRooms() {
  return [
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      partner_id: '550e8400-e29b-41d4-a716-446655440001',
      name: '스탠다드 룸',
      type: 'standard',
      description: '기본적인 편의시설을 갖춘 아늑한 객실입니다.',
      base_price: 80000,
      max_guests: 4,
      amenities: ['wifi', 'tv', 'aircon', 'refrigerator'],
      images: ['/images/room1.jpg', '/images/room1-2.jpg'],
      is_available: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440022',
      partner_id: '550e8400-e29b-41d4-a716-446655440001',
      name: '디럭스 룸',
      type: 'deluxe',
      description: '넓은 공간과 고급 편의시설을 갖춘 객실입니다.',
      base_price: 120000,
      max_guests: 6,
      amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'kitchen', 'balcony'],
      images: ['/images/room2.jpg', '/images/room2-2.jpg'],
      is_available: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440023',
      partner_id: '550e8400-e29b-41d4-a716-446655440001',
      name: '패밀리 스위트',
      type: 'family',
      description: '가족 단위 투숙객을 위한 넓은 객실입니다.',
      base_price: 180000,
      max_guests: 8,
      amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'kitchen', 'balcony', 'living_room'],
      images: ['/images/suite.jpg', '/images/suite-2.jpg'],
      is_available: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
} 