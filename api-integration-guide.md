# 🔌 예약 시스템 API 연동 가이드

랜딩페이지 예약 폼과 Supabase 데이터베이스를 연결하는 방법을 안내합니다.

## 📋 목차
1. [API 엔드포인트 구현](#api-엔드포인트-구현)
2. [랜딩페이지 연동](#랜딩페이지-연동)
3. [데이터 유효성 검증](#데이터-유효성-검증)
4. [에러 처리](#에러-처리)
5. [테스트 방법](#테스트-방법)

## 🔌 API 엔드포인트 구현

### 1. 예약 생성 API

`app/api/reservations/create/route.ts` 파일 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-simple'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 🔍 입력 데이터 검증
    const {
      // 예약자 정보
      customerName,
      customerPhone, 
      customerEmail,
      
      // 예약 기간
      checkIn,
      checkOut,
      
      // 인원 정보
      adults,
      children,
      
      // BBQ 옵션
      bbq,
      
      // 기타 옵션
      meal,
      transport,
      experience,
      extra,
      
      // 프로그램 정보
      programType,
      programId,
      programName,
      
      // 가격 정보
      totalPrice,
      basePrice = 150000,
      grillPrice = 30000,
      
      // 추가 정보
      specialRequests,
      referrer = 'website'
    } = body

    // 📊 필수 필드 검증
    if (!customerName || !customerPhone || !customerEmail || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 📅 날짜 검증
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { success: false, error: '체크아웃 날짜는 체크인 날짜보다 늦어야 합니다.' },
        { status: 400 }
      )
    }

    // 💰 가격 계산
    const roomPrice = basePrice
    const programPrice = 
      (bbq?.grillCount || 0) * grillPrice +
      (meal?.breakfastCount || 0) * 10000 +
      (transport?.needsBus ? 20000 : 0) +
      (experience?.farmExperienceCount || 0) * 15000 +
      (extra?.laundryCount || 0) * 5000

    const calculatedTotal = roomPrice + programPrice

    // 🗄️ 데이터베이스에 예약 저장
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        check_in_date: checkInDate.toISOString().split('T')[0],
        check_out_date: checkOutDate.toISOString().split('T')[0],
        adults: adults || 2,
        children: children || 0,
        
        // BBQ 옵션
        bbq_grill_count: bbq?.grillCount || 0,
        bbq_meat_set_count: bbq?.meatSetCount || 0,
        bbq_full_set_count: bbq?.fullSetCount || 0,
        
        // 기타 옵션
        meal_breakfast_count: meal?.breakfastCount || 0,
        transport_needs_bus: transport?.needsBus || false,
        experience_farm_count: experience?.farmExperienceCount || 0,
        extra_laundry_count: extra?.laundryCount || 0,
        
        // 프로그램 정보
        program_type: programType,
        program_id: programId,
        program_name: programName,
        
        // 가격 정보
        base_price: basePrice,
        grill_price: grillPrice,
        room_price: roomPrice,
        program_price: programPrice,
        total_price: calculatedTotal,
        
        // 추가 정보
        special_requests: specialRequests,
        referrer: referrer,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('예약 생성 오류:', error)
      return NextResponse.json(
        { success: false, error: '예약 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // ✅ 성공 응답
    return NextResponse.json({
      success: true,
      reservation: data,
      message: '예약이 성공적으로 생성되었습니다.'
    })

  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
```

### 2. 예약 조회 API

`app/api/reservations/[id]/route.ts` 파일 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-simple'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        reservation_programs (
          *,
          programs (
            name,
            description
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      reservation: data
    })

  } catch (error) {
    console.error('예약 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
```

### 3. 객실 목록 조회 API

`app/api/rooms/route.ts` 파일 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-simple'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_available', true)
      .order('sort_order')

    if (error) {
      console.error('객실 조회 오류:', error)
      return NextResponse.json(
        { success: false, error: '객실 정보를 불러올 수 없습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      rooms: data
    })

  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
```

## 🔗 랜딩페이지 연동

### 예약 폼 수정

기존 `components/ReservationForm.tsx`의 `handleReservationSubmit` 함수 수정:

```typescript
const handleReservationSubmit = async () => {
  try {
    // 예약 데이터 준비
    const reservationData = {
      // 예약자 정보 (모달에서 입력)
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      
      // 예약 기간
      checkIn: reservation.checkIn?.toISOString().split('T')[0],
      checkOut: reservation.checkOut?.toISOString().split('T')[0],
      
      // 인원 정보
      adults: reservation.adults,
      children: reservation.children,
      
      // 옵션 정보 (BBQ, 식사, 교통, 체험, 기타)
      bbq: reservation.bbq,
      meal: reservation.meal,
      transport: reservation.transport,
      experience: reservation.experience,
      extra: reservation.extra,
      
      // 프로그램 정보
      programType: selectedProgram?.name || '일반 예약',
      programId: selectedProgram?.id,
      programName: selectedProgram?.name,
      
      // 가격 정보
      totalPrice: totalPrice,
      basePrice: basePrice,
      grillPrice: grillPrice,
      
      // 추가 정보
      specialRequests: getReservationOptionsText(),
      referrer: 'website'
    }
    
    // 🔌 API 호출
    const response = await fetch('/api/reservations/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      // ✅ 예약 성공
      setShowBookingModal(false)
      
      alert(`✅ 예약이 완료되었습니다!

예약번호: ${result.reservation.reservation_number}
예약자: ${customerName}
연락처: ${customerPhone}
체크인: ${reservation.checkIn?.toLocaleDateString('ko-KR')}
체크아웃: ${reservation.checkOut?.toLocaleDateString('ko-KR')}
총 금액: ${totalPrice.toLocaleString()}원

관리자 확인 후 연락드리겠습니다.`)
      
      // 폼 초기화
      resetForm()
      
    } else {
      // ❌ 예약 실패
      alert('❌ 예약 처리 중 오류가 발생했습니다: ' + result.error)
    }
    
  } catch (error) {
    console.error('예약 제출 오류:', error)
    alert('❌ 예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
  }
}
```

## ✅ 데이터 유효성 검증

### 클라이언트 측 검증

```typescript
// 예약 폼 유효성 검증 함수
const validateReservationForm = (data: any): string[] => {
  const errors: string[] = []
  
  // 필수 필드 검증
  if (!data.customerName?.trim()) {
    errors.push('예약자 이름을 입력해주세요.')
  }
  
  if (!data.customerPhone?.trim()) {
    errors.push('연락처를 입력해주세요.')
  }
  
  if (!data.customerEmail?.trim()) {
    errors.push('이메일을 입력해주세요.')
  }
  
  // 날짜 검증
  if (!data.checkIn || !data.checkOut) {
    errors.push('체크인/체크아웃 날짜를 선택해주세요.')
  }
  
  if (data.checkIn && data.checkOut) {
    const checkInDate = new Date(data.checkIn)
    const checkOutDate = new Date(data.checkOut)
    
    if (checkOutDate <= checkInDate) {
      errors.push('체크아웃 날짜는 체크인 날짜보다 늦어야 합니다.')
    }
    
    if (checkInDate < new Date()) {
      errors.push('체크인 날짜는 오늘 이후여야 합니다.')
    }
  }
  
  // 인원 검증
  if (data.adults < 1) {
    errors.push('성인은 최소 1명 이상이어야 합니다.')
  }
  
  if (data.children < 0) {
    errors.push('어린이 수는 0명 이상이어야 합니다.')
  }
  
  // BBQ 로직 검증
  const hasBBQSets = (data.bbq?.meatSetCount || 0) > 0 || (data.bbq?.fullSetCount || 0) > 0
  const hasGrills = (data.bbq?.grillCount || 0) > 0
  
  if (hasBBQSets && !hasGrills) {
    errors.push('BBQ 세트 이용 시 그릴 대여가 필요합니다.')
  }
  
  // 조식 인원 검증
  const totalGuests = (data.adults || 0) + (data.children || 0)
  if ((data.meal?.breakfastCount || 0) > totalGuests) {
    errors.push('조식 신청 인원이 총 인원을 초과할 수 없습니다.')
  }
  
  return errors
}
```

### 서버 측 검증

API 엔드포인트에서도 동일한 검증 로직을 추가하세요.

## 🚨 에러 처리

### 공통 에러 핸들러

`lib/api-helpers.ts` 파일 생성:

```typescript
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createSuccessResponse<T>(data: T, message?: string): APIResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

export function createErrorResponse(error: string, status?: number): APIResponse {
  return {
    success: false,
    error
  }
}

export function handleAPIError(error: any): APIResponse {
  console.error('API 오류:', error)
  
  if (error.code === '23505') {
    return createErrorResponse('이미 존재하는 데이터입니다.')
  }
  
  if (error.code === '23503') {
    return createErrorResponse('참조된 데이터가 존재하지 않습니다.')
  }
  
  if (error.message?.includes('duplicate key')) {
    return createErrorResponse('중복된 예약입니다.')
  }
  
  return createErrorResponse('처리 중 오류가 발생했습니다.')
}
```

## 🧪 테스트 방법

### 1. API 테스트 (Postman/curl)

```bash
# 예약 생성 테스트
curl -X POST http://localhost:3000/api/reservations/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "홍길동",
    "customerPhone": "010-1234-5678",
    "customerEmail": "test@example.com",
    "checkIn": "2024-02-01",
    "checkOut": "2024-02-02",
    "adults": 2,
    "children": 0,
    "bbq": {
      "grillCount": 1,
      "meatSetCount": 1,
      "fullSetCount": 0
    },
    "meal": {
      "breakfastCount": 2
    },
    "transport": {
      "needsBus": false
    },
    "experience": {
      "farmExperienceCount": 0
    },
    "extra": {
      "laundryCount": 0
    },
    "totalPrice": 230000,
    "specialRequests": "테스트 예약입니다"
  }'
```

### 2. 브라우저 테스트

1. 개발 서버 시작: `npm run dev`
2. 브라우저에서 `http://localhost:3000` 접속
3. 예약 폼 작성 및 제출
4. 네트워크 탭에서 API 요청/응답 확인
5. 데이터베이스에서 저장된 데이터 확인

### 3. 데이터베이스 확인

Supabase Dashboard > Table Editor에서:

```sql
-- 최근 예약 확인
SELECT * FROM reservations 
ORDER BY created_at DESC 
LIMIT 10;

-- 예약 통계
SELECT 
  status,
  COUNT(*) as count,
  AVG(total_price) as avg_price
FROM reservations 
GROUP BY status;
```

## 🔧 추가 기능

### 예약 상태 업데이트 API

```typescript
// PUT /api/reservations/[id]/status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status } = await request.json()
  
  const { data, error } = await supabase
    .from('reservations')
    .update({ 
      status,
      confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
      cancelled_at: status === 'cancelled' ? new Date().toISOString() : null
    })
    .eq('id', params.id)
    .select()
    .single()
    
  // ... 에러 처리 및 응답
}
```

### 실시간 알림 설정

```typescript
// 예약 상태 변경 시 실시간 알림
useEffect(() => {
  const channel = supabase
    .channel('reservations')
    .on('postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'reservations' 
      }, 
      (payload) => {
        console.log('예약 업데이트:', payload.new)
        // UI 업데이트 로직
      }
    )
    .subscribe()

  return () => channel.unsubscribe()
}, [])
```

---

## ✅ 체크리스트

- [ ] DDL 실행 완료
- [ ] API 엔드포인트 구현
- [ ] 예약 폼 연동
- [ ] 유효성 검증 추가
- [ ] 에러 처리 구현
- [ ] 테스트 완료
- [ ] 실시간 기능 추가 (선택사항)

이제 랜딩페이지의 예약 시스템이 완전히 데이터베이스와 연동됩니다! 🎉 