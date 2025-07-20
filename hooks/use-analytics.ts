"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { analyticsQueue } from '@/lib/analytics-queue'
import { 
  EventType, 
  TrackEventInput, 
  CreateSessionInput, 
  ClickReservationAttempt,
  ConversionFunnelStep,
  DailyEventStats,
  RoomInterestAnalysis,
  AnalyticsFilter,
  AnalyticsAggregation,
  DeviceType
} from '@/types/analytics'

// 세션 ID를 로컬 스토리지에서 관리하는 키
const SESSION_STORAGE_KEY = 'analytics_session_id'

// 디바이스 타입 감지 함수
const getDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// 브라우저 정보 추출
const getBrowserInfo = () => {
  if (typeof window === 'undefined') return { browser: 'Unknown', os: 'Unknown' }
  
  const userAgent = navigator.userAgent
  let browser = 'Unknown'
  let os = 'Unknown'
  
  // 브라우저 감지
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  
  // OS 감지
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'
  
  return { browser, os }
}

export function useAnalytics() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const trackingQueue = useRef<TrackEventInput[]>([])
  const isProcessingQueue = useRef(false)

  // 세션 초기화
  const initializeSession = useCallback(async (sessionInput?: CreateSessionInput) => {
    if (typeof window === 'undefined') return
    
    try {
      setIsLoading(true)
      
      // 기존 세션 ID가 있는지 확인
      let existingSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
      
      if (!existingSessionId) {
        // 새 세션 ID 생성
        existingSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem(SESSION_STORAGE_KEY, existingSessionId)
        
        // 세션 데이터베이스에 저장
        const { data: currentUser } = await supabase.auth.getUser()
        const { browser, os } = getBrowserInfo()
        
        await supabase.from('user_sessions').insert({
          session_id: existingSessionId,
          user_id: currentUser?.user?.id || null,
          ip_address: null, // 클라이언트에서는 IP 주소를 직접 얻을 수 없음
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          utm_source: sessionInput?.utm_source || new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: sessionInput?.utm_medium || new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: sessionInput?.utm_campaign || new URLSearchParams(window.location.search).get('utm_campaign'),
        })
      }
      
      setSessionId(existingSessionId)
      setIsInitialized(true)
      
      // 대기 중인 이벤트들 처리
      if (trackingQueue.current.length > 0) {
        processTrackingQueue()
      }
    } catch (error) {
      console.error('Analytics session initialization failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 큐에 있는 추적 이벤트들 처리
  const processTrackingQueue = useCallback(async () => {
    if (isProcessingQueue.current || !sessionId) return
    
    isProcessingQueue.current = true
    
    try {
      while (trackingQueue.current.length > 0) {
        const event = trackingQueue.current.shift()
        if (event) {
          await trackEventDirect(event)
        }
      }
    } finally {
      isProcessingQueue.current = false
    }
  }, [sessionId])

  // 직접 이벤트 추적 (내부 함수) - 큐 시스템 사용
  const trackEventDirect = useCallback(async (eventInput: TrackEventInput) => {
    if (!sessionId) return false
    
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      const { browser, os } = getBrowserInfo()
      
      const eventData = {
        session_id: sessionId,
        user_id: currentUser?.user?.id || null,
        event_type: eventInput.event_type,
        page_url: eventInput.page_url || window.location.href,
        room_id: eventInput.room_id || null,
        program_ids: eventInput.program_ids || [],
        check_in_date: eventInput.check_in_date || null,
        check_out_date: eventInput.check_out_date || null,
        adults_count: eventInput.adults_count || 0,
        children_count: eventInput.children_count || 0,
        estimated_total_price: eventInput.estimated_total_price || null,
        room_price: eventInput.room_price || null,
        programs_price: eventInput.programs_price || null,
        attempt_status: eventInput.attempt_status || 'in_progress',
        conversion_funnel_step: eventInput.conversion_funnel_step || 1,
        device_type: getDeviceType(),
        browser,
        os,
        metadata: eventInput.metadata || {},
        reservation_id: eventInput.reservation_id || null,
      }

      // 큐 시스템을 사용하여 이벤트 전송 (재시도 및 오프라인 지원)
      analyticsQueue.enqueue(eventData)
      
      return true
    } catch (error) {
      console.error('Event tracking error:', error)
      
      // 에러 발생시에도 큐에 추가 시도
      try {
        analyticsQueue.enqueue({
          error_fallback: true,
          original_error: error.message,
          event_type: eventInput.event_type,
          session_id: sessionId,
          timestamp: Date.now()
        })
      } catch (queueError) {
        console.error('Failed to queue event even as fallback:', queueError)
      }
      
      return false
    }
  }, [sessionId])

  // 공개 이벤트 추적 함수
  const trackEvent = useCallback(async (eventInput: TrackEventInput): Promise<boolean> => {
    // 세션이 초기화되지 않은 경우 큐에 추가
    if (!isInitialized || !sessionId) {
      trackingQueue.current.push(eventInput)
      return true
    }
    
    return await trackEventDirect(eventInput)
  }, [isInitialized, sessionId, trackEventDirect])

  // 페이지 조회 추적
  const trackPageView = useCallback((pageUrl?: string, metadata?: Record<string, any>) => {
    return trackEvent({
      event_type: 'page_view',
      page_url: pageUrl,
      conversion_funnel_step: 1,
      metadata: { ...metadata, page_type: 'view' }
    })
  }, [trackEvent])

  // 객실 조회 추적
  const trackRoomView = useCallback((roomId: string, metadata?: Record<string, any>) => {
    return trackEvent({
      event_type: 'room_view',
      room_id: roomId,
      conversion_funnel_step: 2,
      metadata: { ...metadata, interaction_type: 'room_detail' }
    })
  }, [trackEvent])

  // 예약 시작 추적
  const trackReservationStart = useCallback((
    roomId: string,
    checkInDate: string,
    checkOutDate: string,
    adultsCount: number,
    childrenCount: number,
    programIds?: string[],
    estimatedPrice?: number
  ) => {
    return trackEvent({
      event_type: 'reservation_start',
      room_id: roomId,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults_count: adultsCount,
      children_count: childrenCount,
      program_ids: programIds,
      estimated_total_price: estimatedPrice,
      conversion_funnel_step: 4,
      metadata: { reservation_flow: 'started' }
    })
  }, [trackEvent])

  // 예약 완료 추적
  const trackReservationComplete = useCallback((reservationId: string, totalPrice: number, metadata?: Record<string, any>) => {
    return trackEvent({
      event_type: 'reservation_submit',
      reservation_id: reservationId,
      estimated_total_price: totalPrice,
      attempt_status: 'completed',
      conversion_funnel_step: 5,
      metadata: { ...metadata, conversion_completed: true }
    })
  }, [trackEvent])

  // 분석 데이터 조회 함수들
  const getConversionFunnel = useCallback(async (filter?: AnalyticsFilter): Promise<ConversionFunnelStep[]> => {
    try {
      let query = supabase.from('conversion_funnel_analysis').select('*')
      
      if (filter?.start_date) {
        query = query.gte('event_date', filter.start_date)
      }
      if (filter?.end_date) {
        query = query.lte('event_date', filter.end_date)
      }
      
      const { data, error } = await query.order('event_date', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch conversion funnel:', error)
      return []
    }
  }, [])

  const getDailyEventStats = useCallback(async (filter?: AnalyticsFilter): Promise<DailyEventStats[]> => {
    try {
      let query = supabase.from('daily_event_stats').select('*')
      
      if (filter?.start_date) {
        query = query.gte('event_date', filter.start_date)
      }
      if (filter?.end_date) {
        query = query.lte('event_date', filter.end_date)
      }
      if (filter?.event_types?.length) {
        query = query.in('event_type', filter.event_types)
      }
      
      const { data, error } = await query.order('event_date', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch daily event stats:', error)
      return []
    }
  }, [])

  const getRoomInterestAnalysis = useCallback(async (): Promise<RoomInterestAnalysis[]> => {
    try {
      const { data, error } = await supabase
        .from('room_interest_analysis')
        .select('*')
        .order('total_interactions', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch room interest analysis:', error)
      return []
    }
  }, [])

  // 세션 업데이트 (마지막 활동 시간)
  const updateSessionActivity = useCallback(async () => {
    if (!sessionId) return
    
    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('session_id', sessionId)
    } catch (error) {
      console.error('Failed to update session activity:', error)
    }
  }, [sessionId])

  // 컴포넌트 마운트 시 세션 초기화
  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  // 주기적으로 세션 활동 업데이트 (5분마다)
  useEffect(() => {
    if (!isInitialized) return
    
    const interval = setInterval(updateSessionActivity, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isInitialized, updateSessionActivity])

  return {
    sessionId,
    isInitialized,
    isLoading,
    
    // 세션 관리
    initializeSession,
    updateSessionActivity,
    
    // 이벤트 추적
    trackEvent,
    trackPageView,
    trackRoomView,
    trackReservationStart,
    trackReservationComplete,
    
    // 분석 데이터 조회
    getConversionFunnel,
    getDailyEventStats,
    getRoomInterestAnalysis,
  }
} 