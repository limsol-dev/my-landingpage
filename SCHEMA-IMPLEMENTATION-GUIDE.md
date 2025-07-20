# 🗄️ 달팽이 아지트 펜션 - 완전한 예약 스키마 구현 가이드

## 📋 개요
이 가이드는 요청하신 모든 필드를 포함한 완전한 예약 스키마를 Supabase에 적용하는 방법을 안내합니다.

### 🎯 포함된 필드
- ✅ **예약날짜** (reservation_date)
- ✅ **결제완료 날짜** (payment_completed_date)
- ✅ **이름/고객 넘버링** (customer_name, customer_number)
- ✅ **예약상태** (status)
- ✅ **연락처** (phone)
- ✅ **예약목적** (reservation_purpose)
- ✅ **확정인원** (confirmed_participants - 자동계산)
- ✅ **기본인원** (basic_participants)
- ✅ **추가인원** (additional_participants)
- ✅ **버스매출** (bus_revenue)
- ✅ **조식매출** (breakfast_revenue)
- ✅ **고기매출** (meat_revenue)
- ✅ **총매출** (total_revenue - 자동계산)
- ✅ **바베큐매출** (bbq_revenue)
- ✅ **버너매출** (burner_revenue)
- ✅ **유입경로** (referrer)

## 🛠️ 1단계: 스키마 적용

### Supabase Dashboard에서 적용
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → SQL Editor 클릭
3. `supabase/comprehensive-reservation-schema.sql` 파일 내용 복사 후 실행

### 또는 로컬에서 적용
```bash
# 파일 경로: supabase/comprehensive-reservation-schema.sql
psql -h your-db-host -U postgres -d your-db-name -f supabase/comprehensive-reservation-schema.sql
```

## 📊 2단계: 테이블 구조 확인

### 주요 테이블
1. **reservations** - 메인 예약 테이블
2. **reservation_options** - 예약 옵션 상세
3. **customers** - 고객 정보 관리
4. **referrer_sources** - 유입경로 마스터

### 자동 계산 필드
- `confirmed_participants` = `basic_participants` + `additional_participants`
- `total_revenue` = 모든 매출 필드의 합계
- `net_revenue` = `total_revenue` - `refund_amount`
- `nights` = `end_date` - `start_date`

## 🔧 3단계: API 연동

### 예약 생성 API 예시
```typescript
// app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ReservationCreateInput } from '@/types/reservation-schema';

export async function POST(request: NextRequest) {
  try {
    const data: ReservationCreateInput = await request.json();
    
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert([{
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        phone: data.phone,
        start_date: data.start_date,
        end_date: data.end_date,
        reservation_purpose: data.reservation_purpose || '휴양',
        basic_participants: data.basic_participants,
        additional_participants: data.additional_participants || 0,
        special_requests: data.special_requests,
        
        // 매출 정보
        bus_revenue: data.bus_revenue || 0,
        breakfast_revenue: data.breakfast_revenue || 0,
        meat_revenue: data.meat_revenue || 0,
        bbq_revenue: data.bbq_revenue || 0,
        burner_revenue: data.burner_revenue || 0,
        room_revenue: data.room_revenue || 0,
        facility_revenue: data.facility_revenue || 0,
        extra_revenue: data.extra_revenue || 0,
        
        // 마케팅 정보
        referrer: data.referrer || '직접방문',
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        
        // 추가 정보
        is_group_booking: data.is_group_booking || false,
        room_type: data.room_type || 'standard',
        notes: data.notes,
        
        // 재무 정보
        deposit_amount: data.deposit_amount || 0,
        balance_amount: data.balance_amount || 0,
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    console.error('예약 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '예약 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 예약 조회 API 예시
```typescript
// app/api/reservations/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const referrer = searchParams.get('referrer');
    
    let query = supabase
      .from('reservations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // 필터 적용
    if (status) {
      query = query.eq('status', status);
    }
    
    if (referrer) {
      query = query.eq('referrer', referrer);
    }
    
    // 페이지네이션
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await query.range(from, to);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('예약 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '예약 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

## 📈 4단계: 매출 분석 활용

### 매출 분석 뷰 사용
```typescript
// 월별 매출 분석
const { data: revenueAnalysis } = await supabase
  .from('revenue_analysis')
  .select('*')
  .order('month', { ascending: false });

// 유입경로별 분석
const { data: referrerAnalysis } = await supabase
  .from('referrer_analysis')
  .select('*')
  .order('reservation_count', { ascending: false });
```

### 실시간 통계 쿼리
```typescript
// 오늘 예약 현황
const { data: todayStats } = await supabase
  .from('reservations')
  .select('status, total_revenue, confirmed_participants')
  .gte('created_at', new Date().toISOString().split('T')[0]);

// 월별 매출 트렌드
const { data: monthlyTrend } = await supabase
  .from('reservations')
  .select('reservation_date, total_revenue, confirmed_participants')
  .gte('reservation_date', '2024-01-01')
  .order('reservation_date', { ascending: true });
```

## 🎨 5단계: 프론트엔드 컴포넌트 예시

### 예약 폼 컴포넌트
```typescript
// components/ReservationForm.tsx
import { useState } from 'react';
import { ReservationCreateInput } from '@/types/reservation-schema';

export default function ReservationForm() {
  const [formData, setFormData] = useState<ReservationCreateInput>({
    customer_name: '',
    phone: '',
    start_date: '',
    end_date: '',
    basic_participants: 2,
    additional_participants: 0,
    reservation_purpose: '휴양',
    referrer: '직접방문',
    // 매출 정보
    bus_revenue: 0,
    breakfast_revenue: 0,
    meat_revenue: 0,
    bbq_revenue: 0,
    burner_revenue: 0,
    room_revenue: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('예약이 성공적으로 등록되었습니다!');
        // 폼 초기화 또는 리다이렉트
      } else {
        alert('예약 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 등록 오류:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 기본 정보 */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          고객명
        </label>
        <input
          type="text"
          value={formData.customer_name}
          onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          연락처
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      {/* 날짜 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            체크인 날짜
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            체크아웃 날짜
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>

      {/* 인원 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            기본인원
          </label>
          <input
            type="number"
            min="1"
            value={formData.basic_participants}
            onChange={(e) => setFormData({...formData, basic_participants: parseInt(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            추가인원
          </label>
          <input
            type="number"
            min="0"
            value={formData.additional_participants}
            onChange={(e) => setFormData({...formData, additional_participants: parseInt(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      {/* 예약 목적 */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          예약 목적
        </label>
        <select
          value={formData.reservation_purpose}
          onChange={(e) => setFormData({...formData, reservation_purpose: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="휴양">휴양</option>
          <option value="워크샵">워크샵</option>
          <option value="가족여행">가족여행</option>
          <option value="회사워크샵">회사워크샵</option>
          <option value="동호회모임">동호회모임</option>
          <option value="기타">기타</option>
        </select>
      </div>

      {/* 매출 정보 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            버스매출
          </label>
          <input
            type="number"
            min="0"
            value={formData.bus_revenue}
            onChange={(e) => setFormData({...formData, bus_revenue: parseInt(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            조식매출
          </label>
          <input
            type="number"
            min="0"
            value={formData.breakfast_revenue}
            onChange={(e) => setFormData({...formData, breakfast_revenue: parseInt(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            고기매출
          </label>
          <input
            type="number"
            min="0"
            value={formData.meat_revenue}
            onChange={(e) => setFormData({...formData, meat_revenue: parseInt(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      {/* 유입경로 */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          유입경로
        </label>
        <select
          value={formData.referrer}
          onChange={(e) => setFormData({...formData, referrer: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="직접방문">직접방문</option>
          <option value="네이버">네이버</option>
          <option value="구글">구글</option>
          <option value="인스타그램">인스타그램</option>
          <option value="카카오톡">카카오톡</option>
          <option value="블로그">블로그</option>
          <option value="지인추천">지인추천</option>
          <option value="광고">광고</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        예약 등록
      </button>
    </form>
  );
}
```

## 🔍 6단계: 분석 대시보드

### 매출 분석 컴포넌트
```typescript
// components/admin/RevenueAnalytics.tsx
import { useState, useEffect } from 'react';
import { RevenueAnalysis, ReferrerAnalysis } from '@/types/reservation-schema';

export default function RevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<RevenueAnalysis[]>([]);
  const [referrerData, setReferrerData] = useState<ReferrerAnalysis[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [revenueRes, referrerRes] = await Promise.all([
        fetch('/api/analytics/revenue'),
        fetch('/api/analytics/referrer')
      ]);

      const revenueResult = await revenueRes.json();
      const referrerResult = await referrerRes.json();

      if (revenueResult.success) {
        setRevenueData(revenueResult.data);
      }

      if (referrerResult.success) {
        setReferrerData(referrerResult.data);
      }
    } catch (error) {
      console.error('분석 데이터 로드 오류:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 월별 매출 분석 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">월별 매출 분석</h3>
        <div className="space-y-4">
          {revenueData.map((item) => (
            <div key={item.month} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.month}</span>
                <span className="text-green-600 font-bold">
                  {item.total_revenue.toLocaleString()}원
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                예약 {item.total_reservations}건 / 평균 {item.avg_participants}명
              </div>
              <div className="text-xs text-gray-500 mt-1">
                버스: {item.total_bus_revenue.toLocaleString()}원 | 
                조식: {item.total_breakfast_revenue.toLocaleString()}원 | 
                고기: {item.total_meat_revenue.toLocaleString()}원
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 유입경로별 분석 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">유입경로별 분석</h3>
        <div className="space-y-4">
          {referrerData.map((item) => (
            <div key={item.referrer} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.referrer}</span>
                <span className="text-blue-600 font-bold">
                  {item.reservation_count}건
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                총 매출: {item.total_revenue.toLocaleString()}원
              </div>
              <div className="text-xs text-gray-500 mt-1">
                평균 매출: {item.avg_revenue.toLocaleString()}원 / 
                평균 인원: {item.avg_participants}명
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 📝 7단계: 마이그레이션 체크리스트

### 적용 전 체크리스트
- [ ] 기존 데이터 백업 완료
- [ ] 스키마 파일 검토 완료
- [ ] 의존성 확인 완료
- [ ] 테스트 환경 적용 완료

### 적용 후 체크리스트
- [ ] 모든 테이블 생성 확인
- [ ] 인덱스 생성 확인
- [ ] 트리거 작동 확인
- [ ] RLS 정책 적용 확인
- [ ] 기본 데이터 삽입 확인

### 테스트 시나리오
1. **예약 생성 테스트**
   - 모든 필드 정상 입력
   - 자동 계산 필드 확인
   - 유효성 검사 확인

2. **매출 분석 테스트**
   - 뷰 쿼리 실행
   - 실시간 데이터 확인
   - 성능 측정

3. **고객 관리 테스트**
   - 고객 정보 자동 업데이트
   - 통계 계산 확인
   - 중복 처리 확인

## 🚀 8단계: 성능 최적화 권장사항

### 인덱스 최적화
```sql
-- 자주 사용되는 쿼리에 맞는 복합 인덱스 추가
CREATE INDEX idx_reservations_status_date ON reservations(status, start_date);
CREATE INDEX idx_reservations_referrer_date ON reservations(referrer, created_at);
```

### 뷰 최적화
```sql
-- 자주 사용되는 분석 쿼리를 위한 Materialized View 생성
CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT 
  DATE(reservation_date) as date,
  COUNT(*) as reservations,
  SUM(total_revenue) as revenue
FROM reservations
WHERE status != 'cancelled'
GROUP BY DATE(reservation_date)
ORDER BY date DESC;
```

## 🎉 완료!

이제 모든 요청 필드가 포함된 완전한 예약 스키마가 준비되었습니다!

### 🔧 추가 지원 기능
- 자동 고객 넘버링 시스템
- 실시간 매출 분석
- 유입경로 추적
- 고객 관리 시스템
- 자동 통계 업데이트

### 📞 문의 사항
추가 기능이나 수정사항이 있으시면 언제든지 말씀해주세요! 