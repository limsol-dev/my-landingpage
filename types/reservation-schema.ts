// =============================================
// 달팽이 아지트 펜션 - 예약 스키마 TypeScript 타입 정의
// =============================================

export interface Reservation {
  id: string;
  
  // 기본 정보
  customer_number: number;
  customer_name: string;
  customer_email?: string;
  phone: string;
  
  // 날짜 정보
  reservation_date: string;
  payment_completed_date?: string;
  start_date: string;
  end_date: string;
  
  // 상태 관리
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'partial' | 'completed';
  
  // 예약 목적 및 상세
  reservation_purpose: string;
  special_requests?: string;
  
  // 인원 정보
  basic_participants: number;
  additional_participants: number;
  confirmed_participants: number; // 자동계산
  
  // 매출 정보
  bus_revenue: number;
  breakfast_revenue: number;
  meat_revenue: number;
  bbq_revenue: number;
  burner_revenue: number;
  room_revenue: number;
  facility_revenue: number;
  extra_revenue: number;
  total_revenue: number; // 자동계산
  
  // 마케팅 정보
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  marketing_channel?: string;
  
  // 시스템 정보
  created_at: string;
  updated_at: string;
  confirmed_date?: string;
  cancelled_date?: string;
  
  // 추가 메타데이터
  notes?: string;
  is_group_booking: boolean;
  room_type: string;
  nights: number; // 자동계산
  
  // 고객 만족도
  rating?: number;
  review_comment?: string;
  
  // 재무 정보
  deposit_amount: number;
  balance_amount: number;
  refund_amount: number;
  commission_rate: number;
  net_revenue: number; // 자동계산
}

export interface ReservationOption {
  id: string;
  reservation_id: string;
  
  // 옵션 정보
  option_type: 'bbq' | 'meal' | 'transport' | 'experience' | 'extra' | 'room';
  option_name: string;
  option_description?: string;
  quantity: number;
  unit_price: number;
  total_price: number; // 자동계산
  
  // 시간/날짜 정보
  service_date?: string;
  service_time?: string;
  service_duration?: number;
  
  // 상태 정보
  status: 'confirmed' | 'cancelled' | 'completed';
  
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_number: number;
  
  // 기본 정보
  name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  
  // 주소 정보
  address?: string;
  city?: string;
  postal_code?: string;
  
  // 통계 정보
  total_reservations: number;
  total_spent: number;
  average_spending: number;
  last_visit_date?: string;
  first_visit_date?: string;
  
  // 고객 분류
  customer_type: 'individual' | 'group' | 'corporate';
  vip_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // 선호도 정보
  preferred_room_type?: string;
  preferred_services?: string[];
  
  // 마케팅 동의
  marketing_consent: boolean;
  sms_consent: boolean;
  email_consent: boolean;
  
  // 시스템 정보
  created_at: string;
  updated_at: string;
  
  // 메모
  notes?: string;
}

export interface ReferrerSource {
  id: string;
  source_name: string;
  source_type: 'direct' | 'search' | 'social' | 'referral' | 'paid' | 'email';
  description?: string;
  is_active: boolean;
  tracking_code?: string;
  created_at: string;
}

export interface RevenueAnalysis {
  month: string;
  total_reservations: number;
  total_revenue: number;
  total_bus_revenue: number;
  total_breakfast_revenue: number;
  total_meat_revenue: number;
  total_bbq_revenue: number;
  total_burner_revenue: number;
  total_room_revenue: number;
  avg_revenue_per_reservation: number;
  avg_participants: number;
}

export interface ReferrerAnalysis {
  referrer: string;
  reservation_count: number;
  total_revenue: number;
  avg_revenue: number;
  total_participants: number;
  avg_participants: number;
}

// Form 데이터 타입 (입력용)
export interface ReservationCreateInput {
  customer_name: string;
  customer_email?: string;
  phone: string;
  start_date: string;
  end_date: string;
  reservation_purpose?: string;
  basic_participants: number;
  additional_participants?: number;
  special_requests?: string;
  
  // 매출 정보
  bus_revenue?: number;
  breakfast_revenue?: number;
  meat_revenue?: number;
  bbq_revenue?: number;
  burner_revenue?: number;
  room_revenue?: number;
  facility_revenue?: number;
  extra_revenue?: number;
  
  // 마케팅 정보
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  // 추가 정보
  is_group_booking?: boolean;
  room_type?: string;
  notes?: string;
  
  // 재무 정보
  deposit_amount?: number;
  balance_amount?: number;
}

export interface ReservationUpdateInput {
  customer_name?: string;
  customer_email?: string;
  phone?: string;
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status?: 'pending' | 'partial' | 'completed';
  reservation_purpose?: string;
  special_requests?: string;
  
  // 인원 정보
  basic_participants?: number;
  additional_participants?: number;
  
  // 매출 정보
  bus_revenue?: number;
  breakfast_revenue?: number;
  meat_revenue?: number;
  bbq_revenue?: number;
  burner_revenue?: number;
  room_revenue?: number;
  facility_revenue?: number;
  extra_revenue?: number;
  
  // 마케팅 정보
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  // 추가 정보
  is_group_booking?: boolean;
  room_type?: string;
  notes?: string;
  
  // 고객 만족도
  rating?: number;
  review_comment?: string;
  
  // 재무 정보
  deposit_amount?: number;
  balance_amount?: number;
  refund_amount?: number;
  commission_rate?: number;
}

// API 응답 타입
export interface ReservationResponse {
  success: boolean;
  data?: Reservation;
  error?: string;
}

export interface ReservationListResponse {
  success: boolean;
  data?: Reservation[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

// 필터 타입
export interface ReservationFilters {
  status?: string;
  payment_status?: string;
  referrer?: string;
  reservation_purpose?: string;
  start_date?: string;
  end_date?: string;
  customer_name?: string;
  customer_number?: number;
  is_group_booking?: boolean;
  room_type?: string;
}

// 정렬 타입
export interface ReservationSort {
  field: keyof Reservation;
  direction: 'asc' | 'desc';
}

// 페이지네이션 타입
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 통계 타입
export interface ReservationStats {
  total_reservations: number;
  total_revenue: number;
  total_participants: number;
  avg_revenue_per_reservation: number;
  avg_participants_per_reservation: number;
  conversion_rate: number;
  
  // 매출 분석
  revenue_by_type: {
    bus: number;
    breakfast: number;
    meat: number;
    bbq: number;
    burner: number;
    room: number;
    facility: number;
    extra: number;
  };
  
  // 상태별 통계
  by_status: {
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  
  // 유입경로별 통계
  by_referrer: Record<string, number>;
  
  // 월별 트렌드
  monthly_trend: Array<{
    month: string;
    reservations: number;
    revenue: number;
  }>;
} 