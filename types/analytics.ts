// =============================================================================
// Analytics Data Model Types
// =============================================================================

export type EventType = 
  | 'page_view'
  | 'room_view'
  | 'program_view'
  | 'date_select'
  | 'guest_count_change'
  | 'program_add'
  | 'program_remove'
  | 'price_check'
  | 'reservation_start'
  | 'reservation_submit'
  | 'payment_start'
  | 'payment_complete'
  | 'payment_fail'
  | 'reservation_cancel'
  | 'booking_abandon'

export type AttemptStatus = 
  | 'in_progress'
  | 'completed'
  | 'abandoned'
  | 'cancelled'
  | 'failed'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface UserSession {
  id: string
  session_id: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  created_at: string
  last_activity_at: string
  is_active: boolean
}

export interface ClickReservationAttempt {
  id: string
  
  // 사용자 식별 정보
  user_id?: string
  session_id: string
  
  // 이벤트 정보
  event_type: EventType
  event_timestamp: string
  page_url?: string
  
  // 예약 관련 정보
  room_id?: string
  program_ids: string[]
  check_in_date?: string
  check_out_date?: string
  adults_count: number
  children_count: number
  total_guests: number
  
  // 금액 정보
  estimated_total_price?: number
  room_price?: number
  programs_price?: number
  
  // 상태 및 메타데이터
  attempt_status: AttemptStatus
  conversion_funnel_step: number
  
  // 기술적 정보
  device_type?: DeviceType
  browser?: string
  os?: string
  
  // 추가 데이터
  metadata: Record<string, any>
  
  // 관련 예약
  reservation_id?: string
  
  // 타임스탬프
  created_at: string
  updated_at: string
}

// 분석용 인터페이스들
export interface ConversionFunnelStep {
  conversion_funnel_step: number
  attempts_count: number
  unique_sessions: number
  unique_users: number
  avg_order_value: number
  event_date: string
}

export interface DailyEventStats {
  event_date: string
  event_type: EventType
  event_count: number
  unique_sessions: number
  unique_users: number
}

export interface RoomInterestAnalysis {
  room_id: string
  room_name: string
  total_interactions: number
  views: number
  reservation_starts: number
  reservation_submits: number
  completed_reservations: number
  conversion_rate_percent: number
}

// 이벤트 추적을 위한 입력 타입
export interface TrackEventInput {
  event_type: EventType
  page_url?: string
  room_id?: string
  program_ids?: string[]
  check_in_date?: string
  check_out_date?: string
  adults_count?: number
  children_count?: number
  estimated_total_price?: number
  room_price?: number
  programs_price?: number
  conversion_funnel_step?: number
  attempt_status?: AttemptStatus
  metadata?: Record<string, any>
  reservation_id?: string
}

// 세션 생성을 위한 입력 타입
export interface CreateSessionInput {
  user_id?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

// 필터링을 위한 타입
export interface AnalyticsFilter {
  start_date?: string
  end_date?: string
  event_types?: EventType[]
  room_ids?: string[]
  user_id?: string
  session_id?: string
  attempt_status?: AttemptStatus[]
  conversion_funnel_steps?: number[]
  device_types?: DeviceType[]
}

// 집계 데이터 타입
export interface AnalyticsAggregation {
  total_events: number
  unique_sessions: number
  unique_users: number
  conversion_rate: number
  avg_order_value: number
  most_popular_rooms: Array<{
    room_id: string
    room_name: string
    interaction_count: number
  }>
  funnel_drop_off: Array<{
    step: number
    step_name: string
    count: number
    drop_off_rate: number
  }>
} 