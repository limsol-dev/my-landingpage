'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

// =============================================
// 타입 정의
// =============================================

export interface SettlementSummary {
  totalRevenue: number
  totalRoomRevenue: number
  totalProgramRevenue: number
  totalReservations: number
  averageOrderValue: number
  period: {
    startDate: string
    endDate: string
  }
}

export interface DailyRevenue {
  date: string
  revenue: number
  roomRevenue: number
  programRevenue: number
  reservationCount: number
}

export interface ProgramRevenue {
  programId: string
  programName: string
  categoryName: string
  totalRevenue: number
  totalQuantity: number
  reservationCount: number
  averagePrice: number
}

export interface PartnerRevenue {
  partnerId: string
  partnerName: string
  totalRevenue: number
  totalQuantity: number
  reservationCount: number
  programCount: number
}

export interface PaymentSummary {
  totalAmount: number
  completedAmount: number
  pendingAmount: number
  refundedAmount: number
  methodBreakdown: Record<string, number>
}

export interface SettlementData {
  summary: SettlementSummary
  daily: DailyRevenue[]
  monthly: DailyRevenue[]
  programs: ProgramRevenue[]
  partners: PartnerRevenue[]
  payments: PaymentSummary
  filters: {
    groupBy: string
    programId: string
    partnerId: string
    paymentStatus: string
    startDate: string
    endDate: string
  }
}

export interface SettlementFilters {
  startDate: string
  endDate: string
  groupBy: 'day' | 'month' | 'program' | 'partner'
  programId?: string
  partnerId?: string
  paymentStatus?: string
}

export interface UseSettlementDataOptions {
  initialFilters?: Partial<SettlementFilters>
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface UseSettlementDataReturn {
  data: SettlementData | null
  isLoading: boolean
  error: string | null
  filters: SettlementFilters
  setFilters: (filters: Partial<SettlementFilters>) => void
  refreshData: () => Promise<void>
  exportData: (type: 'xlsx' | 'csv', reportType: 'summary' | 'detailed' | 'programs' | 'partners') => Promise<void>
  lastUpdated: Date
}

// =============================================
// 기본값 설정
// =============================================

const defaultFilters: SettlementFilters = {
  startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  groupBy: 'day',
  programId: '',
  partnerId: '',
  paymentStatus: 'completed'
}

// =============================================
// 메인 훅 함수
// =============================================

export function useSettlementData(options: UseSettlementDataOptions = {}): UseSettlementDataReturn {
  const {
    initialFilters = {},
    autoRefresh = false,
    refreshInterval = 300000 // 5분
  } = options

  // 상태 관리
  const [data, setData] = useState<SettlementData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [filters, setFiltersState] = useState<SettlementFilters>({
    ...defaultFilters,
    ...initialFilters
  })

  // =============================================
  // API 호출 함수
  // =============================================

  const fetchSettlementData = useCallback(async (currentFilters: SettlementFilters) => {
    try {
      setIsLoading(true)
      setError(null)

      const searchParams = new URLSearchParams({
        startDate: currentFilters.startDate,
        endDate: currentFilters.endDate,
        groupBy: currentFilters.groupBy,
        ...(currentFilters.programId && { programId: currentFilters.programId }),
        ...(currentFilters.partnerId && { partnerId: currentFilters.partnerId }),
        ...(currentFilters.paymentStatus && { paymentStatus: currentFilters.paymentStatus })
      })

      const response = await fetch(`/api/admin/reports/settlement?${searchParams}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '정산 데이터 조회에 실패했습니다')
      }

      setData(result.data)
      setLastUpdated(new Date())

    } catch (err) {
      console.error('정산 데이터 조회 오류:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // =============================================
  // 필터 업데이트 함수
  // =============================================

  const setFilters = useCallback((newFilters: Partial<SettlementFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  // =============================================
  // 데이터 새로고침 함수
  // =============================================

  const refreshData = useCallback(async () => {
    await fetchSettlementData(filters)
  }, [fetchSettlementData, filters])

  // =============================================
  // 엑셀/CSV 다운로드 함수
  // =============================================

  const exportData = useCallback(async (
    type: 'xlsx' | 'csv', 
    reportType: 'summary' | 'detailed' | 'programs' | 'partners'
  ) => {
    try {
      const searchParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        type,
        reportType,
        ...(filters.programId && { programId: filters.programId }),
        ...(filters.partnerId && { partnerId: filters.partnerId }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus })
      })

      const response = await fetch(`/api/admin/reports/export?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`다운로드 실패: ${response.status}`)
      }

      // 파일 다운로드 처리
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 파일명 추출 (Content-Disposition 헤더에서)
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `정산리포트_${filters.startDate}_${filters.endDate}.${type}`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (err) {
      console.error('파일 다운로드 오류:', err)
      throw new Error(err instanceof Error ? err.message : '파일 다운로드에 실패했습니다')
    }
  }, [filters])

  // =============================================
  // 필터 변경 시 데이터 자동 갱신
  // =============================================

  useEffect(() => {
    fetchSettlementData(filters)
  }, [fetchSettlementData, filters])

  // =============================================
  // 자동 새로고침 설정
  // =============================================

  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchSettlementData(filters)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchSettlementData, filters])

  // =============================================
  // 메모이제이션된 계산값들
  // =============================================

  const memoizedReturn = useMemo((): UseSettlementDataReturn => ({
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refreshData,
    exportData,
    lastUpdated
  }), [data, isLoading, error, filters, setFilters, refreshData, exportData, lastUpdated])

  return memoizedReturn
}

// =============================================
// 유틸리티 훅들
// =============================================

/**
 * 정산 데이터의 주요 지표만 간단히 가져오는 훅
 */
export function useSettlementSummary(filters?: Partial<SettlementFilters>) {
  const { data, isLoading, error } = useSettlementData({ 
    initialFilters: filters,
    autoRefresh: false
  })

  return {
    summary: data?.summary || null,
    isLoading,
    error
  }
}

/**
 * 특정 기간의 일별 매출 트렌드만 가져오는 훅
 */
export function useDailyRevenueTrend(startDate: string, endDate: string) {
  const { data, isLoading, error } = useSettlementData({
    initialFilters: {
      startDate,
      endDate,
      groupBy: 'day'
    },
    autoRefresh: false
  })

  return {
    dailyData: data?.daily || [],
    isLoading,
    error
  }
}

/**
 * 프로그램별 매출 순위를 가져오는 훅
 */
export function useProgramRanking(filters?: Partial<SettlementFilters>) {
  const { data, isLoading, error } = useSettlementData({
    initialFilters: filters,
    autoRefresh: false
  })

  const topPrograms = useMemo(() => {
    return data?.programs.slice(0, 10) || []
  }, [data?.programs])

  return {
    topPrograms,
    allPrograms: data?.programs || [],
    isLoading,
    error
  }
} 