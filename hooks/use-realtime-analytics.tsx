'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { TimeRange } from '@/components/admin/dashboard/TimeFilter'

// =============================================
// 타입 정의
// =============================================
interface RealtimeAnalyticsData {
  timeRange: TimeRange
  lastUpdated: string
  topRooms: Array<{
    roomId: string
    roomName: string
    roomType: string
    interactionCount: number
  }>
  topPrograms: Array<{
    programId: string
    programName: string
    interactionCount: number
  }>
  eventStats: Array<{
    eventType: string
    eventCount: number
  }>
  hourlyTrends: Array<{
    hour: string
    events: number
    conversions: number
  }>
  summary: {
    totalEvents: number
    totalRoomViews: number
    totalReservationAttempts: number
    conversionRate: number
  }
}

interface UseRealtimeAnalyticsOptions {
  timeRange?: TimeRange
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealtime?: boolean
}

interface UseRealtimeAnalyticsReturn {
  data: RealtimeAnalyticsData | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
  setTimeRange: (timeRange: TimeRange) => void
}

// =============================================
// 실시간 분석 데이터 훅
// =============================================
export function useRealtimeAnalytics(options: UseRealtimeAnalyticsOptions = {}): UseRealtimeAnalyticsReturn {
  const {
    timeRange: initialTimeRange = '24h',
    autoRefresh = true,
    refreshInterval = 30000, // 30초
    enableRealtime = true
  } = options

  // 상태 관리
  const [data, setData] = useState<RealtimeAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange)

  // ref로 관리할 값들
  const realtimeChannelRef = useRef<any>(null)
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // =============================================
  // 데이터 패칭 함수
  // =============================================
  const fetchAnalyticsData = useCallback(async (currentTimeRange?: TimeRange) => {
    try {
      setIsLoading(true)
      setError(null)

      const targetTimeRange = currentTimeRange || timeRange
      const searchParams = new URLSearchParams({
        timeRange: targetTimeRange,
        limit: '10'
      })

      const response = await fetch(`/api/admin/analytics/realtime?${searchParams}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '실시간 분석 데이터 조회에 실패했습니다')
      }

      setData(result.data)
      setLastUpdated(new Date())

    } catch (err) {
      console.error('실시간 분석 데이터 조회 오류:', err)
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
      setError(errorMessage)
      
      // 개발 환경에서만 toast 표시
      if (process.env.NODE_ENV === 'development') {
        toast.error(`실시간 분석 데이터 로딩 실패: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  // =============================================
  // 시간 범위 변경 함수
  // =============================================
  const handleTimeRangeChange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange)
    fetchAnalyticsData(newTimeRange)
  }, [fetchAnalyticsData])

  // =============================================
  // 수동 새로고침 함수
  // =============================================
  const refresh = useCallback(async () => {
    await fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // =============================================
  // 자동 새로고침 설정
  // =============================================
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return

    // 기존 인터벌 클리어
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current)
    }

    // 새로운 인터벌 설정
    autoRefreshIntervalRef.current = setInterval(() => {
      fetchAnalyticsData()
    }, refreshInterval)

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, fetchAnalyticsData])

  // =============================================
  // Supabase Realtime 구독 설정
  // =============================================
  useEffect(() => {
    if (!enableRealtime) return

    // Realtime 채널 구독
    const setupRealtimeSubscription = () => {
      try {
        const channel = supabase
          .channel('analytics-realtime')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'click_reservation_attempts'
            },
            (payload: any) => {
              console.log('📈 새로운 분석 이벤트:', payload)
              // 새로운 이벤트가 추가되면 데이터 새로고침
              setTimeout(() => {
                fetchAnalyticsData()
              }, 1000) // 1초 후 새로고침 (DB 반영 시간 고려)
            }
          )
          .subscribe((status: string) => {
            console.log('📡 Realtime 구독 상태:', status)
            if (status === 'SUBSCRIBED') {
              console.log('✅ 실시간 분석 데이터 구독이 시작되었습니다')
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Realtime 채널 오류가 발생했습니다')
            }
          })

        realtimeChannelRef.current = channel
      } catch (error) {
        console.error('Realtime 구독 설정 오류:', error)
      }
    }

    setupRealtimeSubscription()

    return () => {
      // 컴포넌트 언마운트 시 구독 해제
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
        realtimeChannelRef.current = null
        console.log('🔌 실시간 분석 데이터 구독이 해제되었습니다')
      }
    }
  }, [enableRealtime, fetchAnalyticsData])

  // =============================================
  // 초기 데이터 로딩
  // =============================================
  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // =============================================
  // 컴포넌트 언마운트 시 정리
  // =============================================
  useEffect(() => {
    return () => {
      // 자동 새로고침 인터벌 정리
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current)
      }
      
      // Realtime 채널 정리
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    setTimeRange: handleTimeRangeChange
  }
} 