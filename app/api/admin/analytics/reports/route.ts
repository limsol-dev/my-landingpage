import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/rbac'
import { format, startOfDay, endOfDay, parseISO, addDays, differenceInDays } from 'date-fns'

// =============================================
// 타입 정의
// =============================================

interface AnalyticsEvent {
  id: string
  event_type: string
  event_timestamp: string
  session_id: string
  room_id?: string
  program_ids?: string[]
  estimated_total_price?: number
  conversion_funnel_step?: number
  attempt_status?: string
  device_type?: string
  user_id?: string
  reservation_id?: string
}

interface RoomEvent extends AnalyticsEvent {
  rooms?: {
    name: string
    type: string
  }
}

// =============================================
// 분석 리포트 데이터 조회 API
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
    const startDate = searchParams.get('startDate') || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    const endDate = searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd')
    const groupBy = searchParams.get('groupBy') || 'day' // day, week, month
    const roomId = searchParams.get('roomId') || ''
    const programId = searchParams.get('programId') || ''
    const eventTypes = searchParams.get('eventTypes')?.split(',') || []
    const limit = parseInt(searchParams.get('limit') || '1000')

    // 날짜 유효성 검증
    const startDateObj = parseISO(startDate)
    const endDateObj = parseISO(endDate)
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return createErrorResponse('잘못된 날짜 형식입니다', 400)
    }

    if (startDateObj >= endDateObj) {
      return createErrorResponse('시작일은 종료일보다 이전이어야 합니다', 400)
    }

    // 날짜 범위 제한 (최대 1년)
    const daysDiff = differenceInDays(endDateObj, startDateObj)
    if (daysDiff > 365) {
      return createErrorResponse('조회 기간은 최대 1년까지 가능합니다', 400)
    }

    // =============================================
    // 병렬 데이터 조회
    // =============================================
    
    const [
      summaryResult,
      conversionFunnelResult,
      popularRoomsResult,
      popularProgramsResult,
      timeseriesResult,
      detailedEventsResult
    ] = await Promise.all([
      // 1. 요약 통계
      fetchSummaryStats(startDate, endDate, roomId, programId, eventTypes),
      
      // 2. 전환 퍼널 데이터
      fetchConversionFunnel(startDate, endDate, roomId, programId),
      
      // 3. 인기 객실 데이터
      fetchPopularRooms(startDate, endDate, limit),
      
      // 4. 인기 프로그램 데이터
      fetchPopularPrograms(startDate, endDate, limit),
      
      // 5. 시계열 데이터
      fetchTimeseriesData(startDate, endDate, groupBy, roomId, programId, eventTypes),
      
      // 6. 상세 이벤트 목록
      fetchDetailedEvents(startDate, endDate, roomId, programId, eventTypes, limit)
    ])

    // 에러 체크
    if (summaryResult.error) throw new Error(summaryResult.error)
    if (conversionFunnelResult.error) throw new Error(conversionFunnelResult.error)
    if (popularRoomsResult.error) throw new Error(popularRoomsResult.error)
    if (popularProgramsResult.error) throw new Error(popularProgramsResult.error)
    if (timeseriesResult.error) throw new Error(timeseriesResult.error)
    if (detailedEventsResult.error) throw new Error(detailedEventsResult.error)

    // =============================================
    // 응답 데이터 구성
    // =============================================
    const analyticsData = {
      summary: summaryResult.data,
      conversionFunnel: conversionFunnelResult.data,
      popularRooms: popularRoomsResult.data,
      popularPrograms: popularProgramsResult.data,
      timeseriesData: timeseriesResult.data,
      detailedEvents: detailedEventsResult.data,
      filters: {
        startDate,
        endDate,
        groupBy,
        roomId,
        programId,
        eventTypes
      }
    }

    return createSuccessResponse(analyticsData, '분석 리포트 조회 성공')

  } catch (error: any) {
    console.error('분석 리포트 API 오류:', error)
    return createErrorResponse(
      error.message || '분석 리포트 조회 중 오류가 발생했습니다',
      500
    )
  }
}

// =============================================
// 데이터 조회 함수들
// =============================================

async function fetchSummaryStats(
  startDate: string, 
  endDate: string, 
  roomId: string, 
  programId: string, 
  eventTypes: string[]
) {
  try {
    let query = supabase
      .from('click_reservation_attempts')
      .select('*')
      .gte('event_timestamp', startDate)
      .lte('event_timestamp', endDate)

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    if (eventTypes.length > 0) {
      query = query.in('event_type', eventTypes)
    }

    const { data: events, error } = await query

    if (error) {
      return { error: error.message }
    }

    // 통계 계산
    const uniqueSessions = new Set(events?.map((e: AnalyticsEvent) => e.session_id) || []).size
    const totalEvents = events?.length || 0
    const reservationEvents = events?.filter((e: AnalyticsEvent) => e.event_type === 'reservation_submit') || []
    const totalReservations = reservationEvents.length

    // 평균 주문 금액 계산
    const totalOrderValue = reservationEvents.reduce((sum: number, event: AnalyticsEvent) => {
      return sum + (event.estimated_total_price || 0)
    }, 0)

    const averageOrderValue = totalReservations > 0 ? totalOrderValue / totalReservations : 0

    // 전환율 계산
    const overallConversionRate = uniqueSessions > 0 ? (totalReservations / uniqueSessions) * 100 : 0

    // 바운스율 계산 (단일 이벤트만 있는 세션)
    const sessionEventCounts = new Map<string, number>()
    events?.forEach((event: AnalyticsEvent) => {
      const sessionId = event.session_id
      sessionEventCounts.set(sessionId, (sessionEventCounts.get(sessionId) || 0) + 1)
    })

    const bounceSessions = Array.from(sessionEventCounts.values()).filter(count => count === 1).length
    const bounceRate = uniqueSessions > 0 ? (bounceSessions / uniqueSessions) * 100 : 0

    return {
      data: {
        totalEvents,
        totalSessions: uniqueSessions,
        totalReservations,
        overallConversionRate,
        averageOrderValue,
        bounceRate
      }
    }
  } catch (error: any) {
    return { error: error.message }
  }
}

async function fetchConversionFunnel(
  startDate: string, 
  endDate: string, 
  roomId: string, 
  programId: string
) {
  try {
    let query = supabase
      .from('click_reservation_attempts')
      .select('conversion_funnel_step, session_id, event_type')
      .gte('event_timestamp', startDate)
      .lte('event_timestamp', endDate)

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    const { data: events, error } = await query

    if (error) {
      return { error: error.message }
    }

    // 퍼널 단계별 집계
    const funnelSteps = [
      { step: 1, name: '페이지 조회' },
      { step: 2, name: '객실 선택' },
      { step: 3, name: '프로그램 선택' },
      { step: 4, name: '예약 시도' },
      { step: 5, name: '예약 완료' }
    ]

    const funnelData = funnelSteps.map((stepInfo, index) => {
      const stepEvents = events?.filter((e: AnalyticsEvent) => e.conversion_funnel_step === stepInfo.step) || []
      const uniqueSessions = new Set(stepEvents.map((e: AnalyticsEvent) => e.session_id)).size
      
      // 이전 단계 대비 전환율
      const prevStepEvents = index > 0 ? 
        events?.filter((e: AnalyticsEvent) => e.conversion_funnel_step === funnelSteps[index - 1].step) || [] : 
        []
      const prevUniqueSessions = index > 0 ? new Set(prevStepEvents.map((e: AnalyticsEvent) => e.session_id)).size : uniqueSessions

      const conversionRate = prevUniqueSessions > 0 ? (uniqueSessions / prevUniqueSessions) * 100 : 100
      const dropOffRate = 100 - conversionRate

      return {
        step: stepInfo.name,
        count: uniqueSessions,
        conversionRate,
        dropOffRate
      }
    })

    return { data: funnelData }
  } catch (error: any) {
    return { error: error.message }
  }
}

async function fetchPopularRooms(startDate: string, endDate: string, limit: number) {
  try {
    const { data: events, error } = await supabase
      .from('click_reservation_attempts')
      .select(`
        room_id,
        event_type,
        session_id,
        estimated_total_price,
        rooms!inner(name, type)
      `)
      .not('room_id', 'is', null)
      .gte('event_timestamp', startDate)
      .lte('event_timestamp', endDate)
      .in('event_type', ['room_view', 'reservation_start', 'reservation_submit'])

    if (error) {
      return { error: error.message }
    }

    // 객실별 집계
    const roomStats = new Map<string, {
      id: string
      name: string
      views: number
      reservations: number
      revenue: number
    }>()

    events?.forEach((event: RoomEvent) => {
      const roomId = event.room_id
      const roomName = event.rooms?.name || '알 수 없음'
      
      if (!roomId) return // roomId가 없으면 건너뛰기
      
      if (!roomStats.has(roomId)) {
        roomStats.set(roomId, {
          id: roomId,
          name: roomName,
          views: 0,
          reservations: 0,
          revenue: 0
        })
      }

      const stats = roomStats.get(roomId)!
      
      if (event.event_type === 'room_view') {
        stats.views += 1
      } else if (event.event_type === 'reservation_submit') {
        stats.reservations += 1
        stats.revenue += event.estimated_total_price || 0
      }
    })

    // 인기 순으로 정렬
    const popularRooms = Array.from(roomStats.values())
      .map(room => ({
        ...room,
        conversionRate: room.views > 0 ? (room.reservations / room.views) * 100 : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)

    return { data: popularRooms }
  } catch (error: any) {
    return { error: error.message }
  }
}

async function fetchPopularPrograms(startDate: string, endDate: string, limit: number) {
  try {
    const { data: events, error } = await supabase
      .from('click_reservation_attempts')
      .select(`
        program_ids,
        event_type,
        session_id,
        estimated_total_price
      `)
      .not('program_ids', 'eq', '{}')
      .gte('event_timestamp', startDate)
      .lte('event_timestamp', endDate)
      .in('event_type', ['program_view', 'program_add', 'reservation_submit'])

    if (error) {
      return { error: error.message }
    }

    // 프로그램별 집계
    const programStats = new Map<string, {
      id: string
      name: string
      views: number
      reservations: number
      revenue: number
    }>()

    events?.forEach((event: AnalyticsEvent) => {
      const programIds = event.program_ids || []
      
      programIds.forEach((programId: string) => {
        if (!programStats.has(programId)) {
          programStats.set(programId, {
            id: programId,
            name: `프로그램 ${programId.substring(0, 8)}...`, // 실제로는 programs 테이블과 조인 필요
            views: 0,
            reservations: 0,
            revenue: 0
          })
        }

        const stats = programStats.get(programId)!
        
        if (event.event_type === 'program_view') {
          stats.views += 1
        } else if (event.event_type === 'reservation_submit') {
          stats.reservations += 1
          stats.revenue += event.estimated_total_price || 0
        }
      })
    })

    // 인기 순으로 정렬
    const popularPrograms = Array.from(programStats.values())
      .map(program => ({
        ...program,
        conversionRate: program.views > 0 ? (program.reservations / program.views) * 100 : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)

    return { data: popularPrograms }
  } catch (error: any) {
    return { error: error.message }
  }
}

async function fetchTimeseriesData(
  startDate: string, 
  endDate: string, 
  groupBy: string, 
  roomId: string, 
  programId: string, 
  eventTypes: string[]
) {
  try {
    let query = supabase
      .from('click_reservation_attempts')
      .select('event_timestamp, event_type, session_id, estimated_total_price')
      .gte('event_timestamp', startDate)
      .lte('event_timestamp', endDate)

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    if (eventTypes.length > 0) {
      query = query.in('event_type', eventTypes)
    }

    const { data: events, error } = await query

    if (error) {
      return { error: error.message }
    }

    // 시간대별 집계
    const timeGroups = new Map<string, {
      date: string
      events: number
      sessions: Set<string>
      reservations: number
    }>()

    events?.forEach((event: AnalyticsEvent) => {
      const eventDate = new Date(event.event_timestamp)
      let groupKey: string

      switch (groupBy) {
        case 'day':
          groupKey = format(eventDate, 'yyyy-MM-dd')
          break
        case 'week':
          const weekStart = new Date(eventDate)
          weekStart.setDate(eventDate.getDate() - eventDate.getDay())
          groupKey = format(weekStart, 'yyyy-MM-dd')
          break
        case 'month':
          groupKey = format(eventDate, 'yyyy-MM')
          break
        default:
          groupKey = format(eventDate, 'yyyy-MM-dd')
      }

      if (!timeGroups.has(groupKey)) {
        timeGroups.set(groupKey, {
          date: groupKey,
          events: 0,
          sessions: new Set(),
          reservations: 0
        })
      }

      const group = timeGroups.get(groupKey)!
      group.events += 1
      group.sessions.add(event.session_id)
      
      if (event.event_type === 'reservation_submit') {
        group.reservations += 1
      }
    })

    // 시계열 데이터 생성
    const timeseriesData = Array.from(timeGroups.values())
      .map(group => ({
        date: group.date,
        events: group.events,
        sessions: group.sessions.size,
        reservations: group.reservations,
        conversionRate: group.sessions.size > 0 ? (group.reservations / group.sessions.size) * 100 : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { data: timeseriesData }
  } catch (error: any) {
    return { error: error.message }
  }
}

async function fetchDetailedEvents(
  startDate: string, 
  endDate: string, 
  roomId: string, 
  programId: string, 
  eventTypes: string[], 
  limit: number
) {
  try {
    let query = supabase
      .from('click_reservation_attempts')
      .select(`
        id,
        event_type,
        event_timestamp,
        session_id,
        room_id,
        program_ids,
        estimated_total_price,
        conversion_funnel_step,
        attempt_status,
        device_type,
        user_id,
        reservation_id
      `)
      .gte('event_timestamp', startDate)
      .lte('event_timestamp', endDate)
      .order('event_timestamp', { ascending: false })
      .limit(limit)

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    if (eventTypes.length > 0) {
      query = query.in('event_type', eventTypes)
    }

    const { data: events, error } = await query

    if (error) {
      return { error: error.message }
    }

    // 필요한 경우 user_profiles에서 고객 이름 조회
    const userIds = events?.map((e: AnalyticsEvent) => e.user_id).filter(Boolean) || []
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', userIds)

    const userMap = new Map(users?.map((u: any) => [u.id, u.full_name]) || [])

    // 상세 이벤트 데이터 가공
    const detailedEvents = events?.map((event: AnalyticsEvent) => ({
      id: event.id,
      eventType: event.event_type,
      timestamp: event.event_timestamp,
      sessionId: event.session_id,
      roomId: event.room_id,
      programIds: event.program_ids || [],
      estimatedPrice: event.estimated_total_price || 0,
      conversionStep: event.conversion_funnel_step || 0,
      attemptStatus: event.attempt_status || 'unknown',
      deviceType: event.device_type || 'unknown',
      customerName: event.user_id ? userMap.get(event.user_id) : undefined
    })) || []

    return { data: detailedEvents }
  } catch (error: any) {
    return { error: error.message }
  }
} 