"use client"

import { useEffect } from 'react'
import { useReservationStore } from '@/store/useReservationStore'
import { useAnalytics } from '@/hooks/use-analytics'

/**
 * 예약 스토어와 analytics 시스템을 자동으로 연결하는 훅
 * 예약 관련 컴포넌트에서 한 번만 호출하면 모든 예약 상태 변경이 추적됨
 */
export function useReservationAnalytics() {
  const { setTrackEvent } = useReservationStore()
  const { trackEvent, isInitialized } = useAnalytics()

  // Analytics 초기화되면 예약 스토어에 trackEvent 함수 주입
  useEffect(() => {
    if (isInitialized && trackEvent) {
      setTrackEvent(trackEvent)
    }
  }, [isInitialized, trackEvent, setTrackEvent])

  // Analytics 시스템 상태 반환
  return {
    isInitialized,
    trackEvent
  }
} 