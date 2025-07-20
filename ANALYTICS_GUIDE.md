# 📊 분석 시스템 사용 가이드

## 📋 개요
달팽이 아지트 펜션 예약 사이트의 사용자 행동 분석 및 전환 추적 시스템입니다. 모든 클릭, 조회, 예약 시도를 체계적으로 추적하여 사용자 경험 개선과 비즈니스 인사이트를 제공합니다.

## 🏗️ 시스템 구조

### 1. 데이터베이스 테이블
- **user_sessions**: 사용자 세션 추적 (로그인/비로그인 모두)
- **click_reservation_attempts**: 모든 사용자 상호작용 및 예약 시도 기록

### 2. 추적 이벤트 타입
```typescript
- page_view: 페이지 조회
- room_view: 객실 상세 조회
- program_view: 프로그램 상세 조회
- date_select: 날짜 선택
- guest_count_change: 인원 수 변경
- program_add/remove: 프로그램 추가/제거
- price_check: 가격 확인
- reservation_start: 예약 시작
- reservation_submit: 예약 제출
- payment_start/complete/fail: 결제 관련
- reservation_cancel: 예약 취소
- booking_abandon: 예약 중단
```

### 3. 전환 깔때기 단계
1. **조회 (1단계)**: 페이지 방문, 콘텐츠 조회
2. **선택 (2단계)**: 객실/프로그램 상세 조회
3. **예약시도 (3단계)**: 날짜/인원 선택, 옵션 추가
4. **결제 (4단계)**: 예약 시작, 결제 진행
5. **완료 (5단계)**: 예약/결제 완료

## 🔧 설치 및 설정

### 1. 데이터베이스 설정
```sql
-- Supabase SQL Editor에서 실행
-- create-analytics-tables.sql 파일 내용 전체 실행
```

### 2. 기본 사용법
```typescript
import { useAnalytics } from '@/hooks/use-analytics'

function MyComponent() {
  const { 
    trackPageView, 
    trackRoomView, 
    trackReservationStart,
    isInitialized 
  } = useAnalytics()
  
  useEffect(() => {
    if (isInitialized) {
      trackPageView()
    }
  }, [isInitialized, trackPageView])
  
  const handleRoomClick = (roomId: string) => {
    trackRoomView(roomId, { source: 'room_list' })
    // 객실 상세 페이지로 이동
  }
  
  return <div>...</div>
}
```

## 📈 주요 기능 및 사용 예시

### 1. 페이지 조회 추적
```typescript
// 기본 페이지 조회
trackPageView()

// 메타데이터와 함께 추적
trackPageView('/rooms', { 
  page_type: 'room_listing',
  filter_applied: true 
})
```

### 2. 객실 관심도 추적
```typescript
// 객실 상세 조회
trackRoomView('room-uuid-123', {
  source: 'search_results', // 유입 경로
  position: 1              // 리스트에서의 위치
})
```

### 3. 예약 플로우 추적
```typescript
// 예약 시작
trackReservationStart(
  'room-uuid-123',
  '2024-07-15',           // 체크인
  '2024-07-16',           // 체크아웃
  2,                      // 성인
  0,                      // 어린이
  ['program-uuid-1'],     // 선택된 프로그램
  450000                  // 예상 총액
)

// 예약 완료
trackReservationComplete('reservation-uuid-456', 450000, {
  payment_method: 'card',
  completion_time_minutes: 12
})
```

### 4. 커스텀 이벤트 추적
```typescript
// 가격 확인
trackEvent({
  event_type: 'price_check',
  room_id: 'room-uuid-123',
  adults_count: 2,
  check_in_date: '2024-07-15',
  estimated_total_price: 450000,
  metadata: { 
    price_comparison: true,
    discount_applied: false 
  }
})
```

## 📊 분석 데이터 조회

### 1. 전환 깔때기 분석
```typescript
const { getConversionFunnel } = useAnalytics()

const funnelData = await getConversionFunnel({
  start_date: '2024-07-01',
  end_date: '2024-07-31'
})

// 결과: 단계별 사용자 수, 전환율, 평균 주문 금액
```

### 2. 일별 이벤트 통계
```typescript
const { getDailyEventStats } = useAnalytics()

const dailyStats = await getDailyEventStats({
  start_date: '2024-07-01',
  event_types: ['page_view', 'room_view', 'reservation_start']
})
```

### 3. 객실별 관심도 분석
```typescript
const { getRoomInterestAnalysis } = useAnalytics()

const roomAnalysis = await getRoomInterestAnalysis()
// 결과: 객실별 조회수, 예약 시도, 완료율 등
```

## 🔍 주요 분석 뷰

### 1. 전환 깔때기 분석 (conversion_funnel_analysis)
- 단계별 사용자 수 및 이탈률
- 일별 전환 트렌드
- 평균 주문 금액 변화

### 2. 일별 이벤트 통계 (daily_event_stats)
- 이벤트 타입별 발생 빈도
- 순 방문자/세션 수
- 시간대별 활동 패턴

### 3. 객실 관심도 분석 (room_interest_analysis)
- 객실별 조회수 및 인기도
- 조회 대비 예약 전환율
- 가장 관심받는 객실 랭킹

## 🎯 실제 적용 사례

### 1. 메인 페이지 (app/page.tsx)
```typescript
function HomePage() {
  const { trackPageView } = useAnalytics()
  
  useEffect(() => {
    trackPageView('/', { page_type: 'landing' })
  }, [])
  
  return <div>...</div>
}
```

### 2. 객실 리스트 페이지 (app/rooms/page.tsx)
```typescript
function RoomsPage() {
  const { trackPageView, trackRoomView } = useAnalytics()
  
  useEffect(() => {
    trackPageView('/rooms', { page_type: 'room_listing' })
  }, [])
  
  const handleRoomClick = (room: Room, index: number) => {
    trackRoomView(room.id, {
      source: 'room_listing',
      position: index + 1,
      room_name: room.name
    })
  }
  
  return <div>...</div>
}
```

### 3. 예약 페이지 (app/booking/page.tsx)
```typescript
function BookingPage() {
  const { trackReservationStart, trackEvent } = useAnalytics()
  
  const handleDateChange = (checkIn: string, checkOut: string) => {
    trackEvent({
      event_type: 'date_select',
      check_in_date: checkIn,
      check_out_date: checkOut,
      conversion_funnel_step: 3
    })
  }
  
  const handleSubmitReservation = async (data: ReservationData) => {
    trackReservationStart(
      data.roomId,
      data.checkIn,
      data.checkOut,
      data.adults,
      data.children,
      data.programIds,
      data.totalPrice
    )
    
    // 예약 처리 로직...
  }
  
  return <div>...</div>
}
```

## 📊 관리자 대시보드 연동

### 1. 실시간 전환율 모니터링
```typescript
function AdminDashboard() {
  const [funnelData, setFunnelData] = useState([])
  const { getConversionFunnel } = useAnalytics()
  
  useEffect(() => {
    const loadFunnelData = async () => {
      const data = await getConversionFunnel({
        start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd')
      })
      setFunnelData(data)
    }
    
    loadFunnelData()
    const interval = setInterval(loadFunnelData, 60000) // 1분마다 갱신
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div>
      <h2>전환 깔때기 분석</h2>
      {/* 차트 컴포넌트 */}
    </div>
  )
}
```

## 🔒 보안 및 개인정보 보호

### 1. RLS (Row Level Security) 정책
- 사용자는 자신의 데이터만 조회 가능
- 관리자는 모든 분석 데이터 접근 가능
- 세션 기반 접근 제어

### 2. 개인정보 처리 방침
- IP 주소는 해시화하여 저장 권장
- 개인 식별 정보는 별도 수집하지 않음
- 데이터 보관 기간: 1년 (자동 삭제)

## 🛠️ 유지보수

### 1. 데이터 정리
```sql
-- 1년 이상 된 데이터 삭제
SELECT cleanup_old_analytics_data(365);

-- 비활성 세션 정리 (30일)
DELETE FROM user_sessions 
WHERE last_activity_at < NOW() - INTERVAL '30 days' 
AND is_active = FALSE;
```

### 2. 성능 최적화
- 정기적인 인덱스 재구성
- 파티셔닝 고려 (대용량 데이터)
- 분석 뷰 materialized view 전환

### 3. 모니터링
- 이벤트 추적 실패율 모니터링
- 세션 생성 오류 알림
- 데이터베이스 성능 지표 확인

## 📞 문제 해결

### 일반적인 오류들

**세션 초기화 실패**
```typescript
// 수동 세션 초기화
const { initializeSession } = useAnalytics()
initializeSession({ utm_source: 'manual' })
```

**이벤트 추적 실패**
- 네트워크 연결 확인
- Supabase RLS 정책 점검
- 브라우저 개발자 도구 확인

**데이터 조회 오류**
- 관리자 권한 확인
- 날짜 범위 유효성 검증
- 뷰 권한 설정 점검

---

이 시스템을 통해 사용자 행동을 체계적으로 분석하고, 데이터 기반의 의사결정을 내릴 수 있습니다! 📈 