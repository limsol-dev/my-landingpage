import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/rbac'

// =============================================
// 타입 정의
// =============================================
interface RoomItem {
  room_id: string
  rooms: {
    name: string
    type: string
  }
  count: number
}

interface ProgramItem {
  program_ids: string[]
  count: number
}

interface EventItem {
  event_type: string
  count: number
}

interface TrendItem {
  event_timestamp: string
  event_type: string
  conversion_funnel_step: number
}

interface ProcessedEventStat {
  eventType: string
  eventCount: number
}

// =============================================
// 실시간 클릭/예약 시도 분석 데이터 조회 API
// =============================================
export async function GET(request: NextRequest) {
  try {
    // 분석 조회 권한 확인
    const authResult = await authorizeRequest(request, 'analytics:read')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h' // 1h, 24h, 7d, 30d
    const limit = parseInt(searchParams.get('limit') || '10')

    // 시간 범위 계산
    const now = new Date()
    let startTime: Date

    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // 병렬로 데이터 조회
    const [
      topRoomsResult,
      topProgramsResult,
      eventStatsResult,
      hourlyTrendsResult
    ] = await Promise.all([
      // 1. 인기 객실 TOP N
      supabase
        .from('click_reservation_attempts')
        .select(`
          room_id,
          rooms!inner(name, type),
          count:id
        `)
        .not('room_id', 'is', null)
        .gte('event_timestamp', startTime.toISOString())
        .in('event_type', ['room_view', 'reservation_start'])
        .order('count', { ascending: false })
        .limit(limit),

      // 2. 인기 프로그램 TOP N
      supabase
        .from('click_reservation_attempts')
        .select(`
          program_ids,
          count:id
        `)
        .not('program_ids', 'eq', '{}')
        .gte('event_timestamp', startTime.toISOString())
        .in('event_type', ['program_add', 'program_view'])
        .limit(limit * 3), // 프로그램 배열 처리를 위해 더 많이 조회

      // 3. 이벤트 타입별 통계
      supabase
        .from('click_reservation_attempts')
        .select(`
          event_type,
          count:id
        `)
        .gte('event_timestamp', startTime.toISOString())
        .order('count', { ascending: false }),

      // 4. 시간별 트렌드 (최근 24시간)
      supabase
        .from('click_reservation_attempts')
        .select(`
          event_timestamp,
          event_type,
          conversion_funnel_step
        `)
        .gte('event_timestamp', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .order('event_timestamp', { ascending: true })
    ])

    // 에러 체크
    if (topRoomsResult.error) throw topRoomsResult.error
    if (topProgramsResult.error) throw topProgramsResult.error
    if (eventStatsResult.error) throw eventStatsResult.error
    if (hourlyTrendsResult.error) throw hourlyTrendsResult.error

    // 데이터 후처리
    const topRooms = (topRoomsResult.data as RoomItem[] || []).map((item: RoomItem) => ({
      roomId: item.room_id,
      roomName: item.rooms?.name || '알 수 없음',
      roomType: item.rooms?.type || 'standard',
      interactionCount: item.count || 0
    }))

    // 프로그램 집계 처리
    const programCounts = new Map<string, number>()
    const programData = topProgramsResult.data as ProgramItem[] || []
    programData.forEach((item: ProgramItem) => {
      if (item.program_ids && Array.isArray(item.program_ids)) {
        item.program_ids.forEach((programId: string) => {
          programCounts.set(programId, (programCounts.get(programId) || 0) + 1)
        })
      }
    })

    const topPrograms = Array.from(programCounts.entries())
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, limit)
      .map(([programId, count]: [string, number]) => ({
        programId,
        programName: `프로그램 ${programId.substring(0, 8)}...`, // 실제로는 programs 테이블과 조인 필요
        interactionCount: count
      }))

    const eventStats: ProcessedEventStat[] = (eventStatsResult.data as EventItem[] || []).map((item: EventItem) => ({
      eventType: item.event_type,
      eventCount: item.count || 0
    }))

    // 시간별 트렌드 집계
    const hourlyData = new Map<string, { hour: string; events: number; conversions: number }>()
    const trendData = hourlyTrendsResult.data as TrendItem[] || []
    trendData.forEach((item: TrendItem) => {
      const hour = new Date(item.event_timestamp).toISOString().substring(0, 13) + ':00:00.000Z'
      const existing = hourlyData.get(hour) || { hour, events: 0, conversions: 0 }
      existing.events += 1
      if (item.conversion_funnel_step >= 4) {
        existing.conversions += 1
      }
      hourlyData.set(hour, existing)
    })

    const hourlyTrends = Array.from(hourlyData.values())
      .sort((a: { hour: string; events: number; conversions: number }, b: { hour: string; events: number; conversions: number }) => a.hour.localeCompare(b.hour))
      .slice(-24) // 최근 24시간만

    return createSuccessResponse({
      timeRange,
      lastUpdated: now.toISOString(),
      topRooms,
      topPrograms,
      eventStats,
      hourlyTrends,
      summary: {
        totalEvents: eventStats.reduce((sum: number, stat: ProcessedEventStat) => sum + stat.eventCount, 0),
        totalRoomViews: eventStats.find((stat: ProcessedEventStat) => stat.eventType === 'room_view')?.eventCount || 0,
        totalReservationAttempts: eventStats.find((stat: ProcessedEventStat) => stat.eventType === 'reservation_start')?.eventCount || 0,
        conversionRate: 0 // 계산 필요
      }
    }, '실시간 분석 데이터 조회 성공')

  } catch (error: any) {
    console.error('실시간 분석 데이터 조회 API 오류:', error)
    return createErrorResponse(
      error.message || '실시간 분석 데이터 조회 중 오류가 발생했습니다',
      500
    )
  }
} 