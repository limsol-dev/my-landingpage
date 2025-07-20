import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// =============================================
// Dashboard Data Types
// =============================================

export interface DashboardStats {
  totalReservations: number
  todayReservations: number
  thisWeekReservations: number
  thisMonthReservations: number
  totalRevenue: number
  todayRevenue: number
  thisWeekRevenue: number
  thisMonthRevenue: number
  averageReservationValue: number
  occupancyRate: number
  pendingReservations: number
  confirmedReservations: number
  cancelledReservations: number
  completedReservations: number
}

export interface ReservationTrend {
  date: string
  reservations: number
  revenue: number
}

export interface ProgramPopularity {
  programName: string
  reservationCount: number
  revenue: number
  percentage: number
}

export interface RoomOccupancy {
  roomId: string
  roomName: string
  totalBookings: number
  confirmedBookings: number
  occupancyRate: number
}

export interface DashboardData {
  stats: DashboardStats
  recentReservations: any[]
  reservationTrends: ReservationTrend[]
  programPopularity: ProgramPopularity[]
  roomOccupancy: RoomOccupancy[]
  lastUpdated: Date
}

// =============================================
// Dashboard Data Hook
// =============================================

interface UseDashboardDataOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealtime?: boolean
}

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30초
    enableRealtime = true
  } = options

  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // =============================================
  // API 호출 함수들
  // =============================================

  const fetchReservations = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/reservations?limit=100&sortBy=created_at&sortOrder=desc')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      return result.success ? result.data.reservations : []
    } catch (error) {
      console.error('예약 데이터 조회 실패:', error)
      throw error
    }
  }, [])

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/programs?limit=50')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      return result.success ? result.data.programs : []
    } catch (error) {
      console.error('프로그램 데이터 조회 실패:', error)
      return []
    }
  }, [])

  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch('/api/rooms')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      return result.success ? result.data : []
    } catch (error) {
      console.error('객실 데이터 조회 실패:', error)
      return []
    }
  }, [])

  // =============================================
  // 데이터 처리 함수들
  // =============================================

  const calculateStats = useCallback((reservations: any[]): DashboardStats => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1)

    const todayReservations = reservations.filter(r => {
      const checkIn = new Date(r.check_in_date || r.startDate)
      return checkIn >= today && checkIn < new Date(today.getTime() + 24 * 60 * 60 * 1000)
    })

    const thisWeekReservations = reservations.filter(r => {
      const checkIn = new Date(r.check_in_date || r.startDate)
      return checkIn >= weekAgo
    })

    const thisMonthReservations = reservations.filter(r => {
      const checkIn = new Date(r.check_in_date || r.startDate)
      return checkIn >= monthAgo
    })

    const confirmedOrCompleted = reservations.filter(r => 
      r.status === 'confirmed' || r.status === 'completed'
    )

    const totalRevenue = confirmedOrCompleted.reduce((sum, r) => 
      sum + (r.total_price || r.totalPrice || 0), 0
    )

    const todayRevenue = todayReservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + (r.total_price || r.totalPrice || 0), 0)

    const thisWeekRevenue = thisWeekReservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + (r.total_price || r.totalPrice || 0), 0)

    const thisMonthRevenue = thisMonthReservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + (r.total_price || r.totalPrice || 0), 0)

    return {
      totalReservations: reservations.length,
      todayReservations: todayReservations.length,
      thisWeekReservations: thisWeekReservations.length,
      thisMonthReservations: thisMonthReservations.length,
      totalRevenue,
      todayRevenue,
      thisWeekRevenue,
      thisMonthRevenue,
      averageReservationValue: confirmedOrCompleted.length > 0 ? 
        Math.round(totalRevenue / confirmedOrCompleted.length) : 0,
      occupancyRate: 0, // 별도 계산 필요
      pendingReservations: reservations.filter(r => r.status === 'pending').length,
      confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
      cancelledReservations: reservations.filter(r => r.status === 'cancelled').length,
      completedReservations: reservations.filter(r => r.status === 'completed').length
    }
  }, [])

  const calculateTrends = useCallback((reservations: any[]): ReservationTrend[] => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last30Days.map(date => {
      const dayReservations = reservations.filter(r => {
        const checkIn = new Date(r.check_in_date || r.startDate)
        return checkIn.toISOString().split('T')[0] === date
      })

      const revenue = dayReservations
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((sum, r) => sum + (r.total_price || r.totalPrice || 0), 0)

      return {
        date,
        reservations: dayReservations.length,
        revenue
      }
    })
  }, [])

  const calculateProgramPopularity = useCallback((reservations: any[]): ProgramPopularity[] => {
    const programMap = new Map<string, { count: number; revenue: number }>()

    reservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .forEach(r => {
        const programName = r.programType || '기본 프로그램'
        const current = programMap.get(programName) || { count: 0, revenue: 0 }
        programMap.set(programName, {
          count: current.count + 1,
          revenue: current.revenue + (r.total_price || r.totalPrice || 0)
        })
      })

    const totalReservations = Array.from(programMap.values())
      .reduce((sum, p) => sum + p.count, 0)

    return Array.from(programMap.entries())
      .map(([name, data]) => ({
        programName: name,
        reservationCount: data.count,
        revenue: data.revenue,
        percentage: totalReservations > 0 ? Math.round((data.count / totalReservations) * 100) : 0
      }))
      .sort((a, b) => b.reservationCount - a.reservationCount)
      .slice(0, 10)
  }, [])

  // =============================================
  // 메인 데이터 페칭 함수
  // =============================================

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [reservations, programs, rooms] = await Promise.all([
        fetchReservations(),
        fetchPrograms(),
        fetchRooms()
      ])

      const stats = calculateStats(reservations)
      const trends = calculateTrends(reservations)
      const programPopularity = calculateProgramPopularity(reservations)

      // 최근 예약 10건
      const recentReservations = reservations
        .sort((a: any, b: any) => {
          const aDate = new Date(a.created_at || a.createdAt || 0)
          const bDate = new Date(b.created_at || b.createdAt || 0)
          return bDate.getTime() - aDate.getTime()
        })
        .slice(0, 10)

      // 객실 점유율 (임시 계산)
      const roomOccupancy: RoomOccupancy[] = rooms.map((room: any) => {
                 const roomReservations = reservations.filter((r: any) => r.room_id === room.id)
         const confirmedBookings = roomReservations.filter((r: any) => 
          r.status === 'confirmed' || r.status === 'completed'
        ).length

        return {
          roomId: room.id,
          roomName: room.name || `객실 ${room.id}`,
          totalBookings: roomReservations.length,
          confirmedBookings,
          occupancyRate: roomReservations.length > 0 ? 
            Math.round((confirmedBookings / roomReservations.length) * 100) : 0
        }
      })

      const dashboardData: DashboardData = {
        stats,
        recentReservations,
        reservationTrends: trends,
        programPopularity,
        roomOccupancy,
        lastUpdated: new Date()
      }

      setData(dashboardData)
      setLastUpdated(new Date())

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '데이터 로딩 실패'
      setError(errorMessage)
      toast.error(`대시보드 데이터 로딩 실패: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [fetchReservations, fetchPrograms, fetchRooms, calculateStats, calculateTrends, calculateProgramPopularity])

  // =============================================
  // 효과 및 자동 새로고침
  // =============================================

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchAllData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchAllData])

  // =============================================
  // 실시간 업데이트 (향후 Supabase Realtime 연동)
  // =============================================

  useEffect(() => {
    if (!enableRealtime) return

    // TODO: Supabase Realtime 구독 설정
    // const channel = supabase.channel('dashboard')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
    //     fetchAllData()
    //   })
    //   .subscribe()

    // return () => {
    //   supabase.removeChannel(channel)
    // }
  }, [enableRealtime, fetchAllData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData: fetchAllData,
    stats: data?.stats || null,
    recentReservations: data?.recentReservations || [],
    reservationTrends: data?.reservationTrends || [],
    programPopularity: data?.programPopularity || [],
    roomOccupancy: data?.roomOccupancy || []
  }
} 