import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, contact, checkIn, checkOut, guests } = await request.json()

    // 입력값 검증
    if (!name || !contact || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: '모든 필드가 필요합니다.' },
        { status: 400 }
      )
    }

    // SMS 메시지 구성
    const message = `[달팽이아지트펜션 예약문의]
이름: ${name}
연락처: ${contact}
체크인: ${checkIn}
체크아웃: ${checkOut}
인원수: ${guests}명`

    // 실제 SMS 발송 로직 (여기서는 콘솔 로그로 대체)
    // 실제 환경에서는 SMS API (예: 알리고, 네이버 클라우드 등)를 사용해야 합니다
    console.log('SMS 전송 대상: 010-8531-9531')
    console.log('SMS 내용:', message)

    // 실제 SMS API 호출 예시 (주석 처리)
    /*
    const response = await fetch('SMS_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        to: '010-8531-9531',
        message: message
      })
    })

    if (!response.ok) {
      throw new Error('SMS 전송 실패')
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: '예약 문의가 성공적으로 전송되었습니다.' 
    })

  } catch (error) {
    console.error('SMS 전송 오류:', error)
    return NextResponse.json(
      { error: 'SMS 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 