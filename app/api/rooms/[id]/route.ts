import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: '객실 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // Supabase에서 객실 데이터 조회
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) {
      console.error('Supabase 오류:', error)
      
      // Supabase 오류 시 샘플 데이터 확인
      const sampleRoom = getSampleRoom(roomId)
      if (sampleRoom) {
        return NextResponse.json({
          success: true,
          data: sampleRoom,
          message: 'Supabase 설정이 필요합니다. 샘플 데이터를 사용합니다.'
        })
      }

      return NextResponse.json(
        { success: false, error: '객실을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: '객실을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('객실 조회 오류:', error)
    
    // 오류 시 샘플 데이터 확인
    const sampleRoom = getSampleRoom(params.id)
    if (sampleRoom) {
      return NextResponse.json({
        success: true,
        data: sampleRoom,
        message: '샘플 데이터를 사용합니다.'
      })
    }

    return NextResponse.json(
      { success: false, error: '객실 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 샘플 데이터 함수
function getSampleRoom(id: string) {
  const sampleRooms: { [key: string]: any } = {
    '1': {
      id: '1',
      partner_id: '550e8400-e29b-41d4-a716-446655440001',
      name: '스탠다드 룸',
      type: 'standard',
      description: '기본적인 편의시설을 갖춘 아늑한 객실입니다. 자연의 아름다움을 만끽할 수 있는 정원 전망과 함께 편안한 휴식을 제공합니다.',
      base_price: 80000,
      max_guests: 4,
      amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'parking'],
      images: ['/images/room1.jpg', '/images/room1-2.jpg', '/images/living.jpg'],
      is_available: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    '2': {
      id: '2',
      partner_id: '550e8400-e29b-41d4-a716-446655440001',
      name: '디럭스 룸',
      type: 'deluxe',
      description: '넓은 공간과 고급 편의시설을 갖춘 객실입니다. 프라이빗 발코니에서 아름다운 산 전망을 감상하며 특별한 시간을 보내세요.',
      base_price: 120000,
      max_guests: 6,
      amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'kitchen', 'balcony', 'parking'],
      images: ['/images/room2.jpg', '/images/room2-2.jpg', '/images/kitchen.jpg'],
      is_available: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    '3': {
      id: '3',
      partner_id: '550e8400-e29b-41d4-a716-446655440001',
      name: '패밀리 스위트',
      type: 'family',
      description: '가족 단위 투숙객을 위한 넓은 객실입니다. 별도의 거실 공간과 완비된 주방 시설로 마치 집처럼 편안한 숙박을 경험하실 수 있습니다.',
      base_price: 180000,
      max_guests: 8,
      amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'kitchen', 'balcony', 'living_room', 'bathtub', 'parking'],
      images: ['/images/healing-room.jpg', '/images/living.jpg', '/images/kitchen.jpg'],
      is_available: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    '550e8400-e29b-41d4-a716-446655440021': {
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
    '550e8400-e29b-41d4-a716-446655440022': {
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
    '550e8400-e29b-41d4-a716-446655440023': {
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
  }

  return sampleRooms[id] || null
} 