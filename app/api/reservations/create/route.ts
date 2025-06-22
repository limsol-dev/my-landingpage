import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { formatReservationForSupabase } from '@/lib/supabase-utils'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('받은 예약 데이터:', JSON.stringify(data, null, 2))
    
    // 폼 데이터를 Supabase 형식으로 변환  
    const supabaseData = formatReservationForSupabase(data)
    
    // Supabase에 예약 데이터 저장
    const { data: reservation, error } = await supabaseAdmin
      .from('reservations')
      .insert(supabaseData)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase 저장 오류:', error)
      throw error
    }
    
    console.log('새 예약 생성:', reservation)
    
    return NextResponse.json({
      success: true,
      reservation: reservation,
      message: '예약이 성공적으로 접수되었습니다.'
    })
    
  } catch (error) {
    console.error('예약 생성 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '예약 처리 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Supabase에서 예약 목록 조회
    const { data: reservations, error } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase 조회 오류:', error)
      throw error
    }
    
    console.log('현재 저장된 예약 수:', reservations?.length || 0)
    
    return NextResponse.json({
      success: true,
      reservations: reservations || []
    })
  } catch (error) {
    console.error('예약 조회 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '예약 조회 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
} 