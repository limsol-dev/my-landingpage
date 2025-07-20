import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createErrorResponse
} from '@/lib/rbac'
import { format, parseISO } from 'date-fns'
import * as XLSX from 'xlsx'

// =============================================
// 분석 데이터 엑셀/CSV 다운로드 API
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
    const exportType = searchParams.get('type') || 'xlsx' // xlsx, csv
    const reportType = searchParams.get('reportType') || 'summary' // summary, detailed, conversion, popular
    const roomId = searchParams.get('roomId') || ''
    const programId = searchParams.get('programId') || ''
    const eventTypes = searchParams.get('eventTypes')?.split(',') || []
    const groupBy = searchParams.get('groupBy') || 'day'

    // =============================================
    // 분석 데이터 조회
    // =============================================
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
        reservation_id,
        check_in_date,
        check_out_date,
        adults_count,
        children_count,
        total_guests,
        room_price,
        programs_price,
        metadata
      `)
      .gte('event_timestamp', startDate)
      .lte('event_timestamp', endDate)
      .order('event_timestamp', { ascending: false })

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    if (eventTypes.length > 0) {
      query = query.in('event_type', eventTypes)
    }

    const { data: analyticsData, error: analyticsError } = await query

    if (analyticsError) {
      console.error('분석 데이터 조회 오류:', analyticsError)
      return createErrorResponse('데이터를 조회하는데 실패했습니다', 500)
    }

    // =============================================
    // 리포트 타입별 데이터 생성
    // =============================================
    let worksheetData: any[] = []
    let filename = ''

    switch (reportType) {
      case 'summary':
        worksheetData = generateAnalyticsSummaryReport(analyticsData || [])
        filename = `분석요약_${startDate}_${endDate}`
        break
      case 'detailed':
        worksheetData = generateAnalyticsDetailedReport(analyticsData || [])
        filename = `분석상세_${startDate}_${endDate}`
        break
      case 'conversion':
        worksheetData = generateConversionReport(analyticsData || [])
        filename = `전환분석_${startDate}_${endDate}`
        break
      case 'popular':
        worksheetData = generatePopularItemsReport(analyticsData || [])
        filename = `인기도분석_${startDate}_${endDate}`
        break
      default:
        worksheetData = generateAnalyticsSummaryReport(analyticsData || [])
        filename = `분석리포트_${startDate}_${endDate}`
    }

    // =============================================
    // 파일 생성 및 다운로드
    // =============================================
    if (exportType === 'csv') {
      // CSV 생성
      const csvContent = convertToCSV(worksheetData)
      
      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
          'Cache-Control': 'no-cache',
        },
      })
    } else {
      // 엑셀 파일 생성
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      
      // 컬럼 너비 자동 조정
      const maxWidth = worksheetData.reduce((acc: any, row: any) => {
        Object.keys(row).forEach(key => {
          const len = String(row[key] || '').length
          acc[key] = Math.max(acc[key] || 0, len + 2)
        })
        return acc
      }, {})
      
      worksheet['!cols'] = Object.keys(maxWidth).map(key => ({ width: Math.min(maxWidth[key], 50) }))
      
      XLSX.utils.book_append_sheet(workbook, worksheet, '분석 리포트')
      
      // 엑셀 파일을 버퍼로 생성
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
      
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
          'Cache-Control': 'no-cache',
        },
      })
    }

  } catch (error) {
    console.error('분석 리포트 다운로드 API 오류:', error)
    return createErrorResponse('파일 생성 중 오류가 발생했습니다', 500)
  }
}

// =============================================
// 리포트 생성 함수들
// =============================================

function generateAnalyticsSummaryReport(data: any[]) {
  // 세션별 집계
  const sessionStats = new Map<string, {
    sessionId: string
    events: number
    firstEvent: string
    lastEvent: string
    totalPrice: number
    conversionStep: number
    status: string
    deviceType: string
  }>()

  data.forEach(item => {
    const sessionId = item.session_id
    
    if (!sessionStats.has(sessionId)) {
      sessionStats.set(sessionId, {
        sessionId,
        events: 0,
        firstEvent: item.event_timestamp,
        lastEvent: item.event_timestamp,
        totalPrice: 0,
        conversionStep: 0,
        status: 'in_progress',
        deviceType: item.device_type || 'unknown'
      })
    }

    const stats = sessionStats.get(sessionId)!
    stats.events += 1
    stats.totalPrice = Math.max(stats.totalPrice, item.estimated_total_price || 0)
    stats.conversionStep = Math.max(stats.conversionStep, item.conversion_funnel_step || 0)
    
    if (item.event_timestamp < stats.firstEvent) {
      stats.firstEvent = item.event_timestamp
    }
    if (item.event_timestamp > stats.lastEvent) {
      stats.lastEvent = item.event_timestamp
    }
    
    if (item.event_type === 'reservation_submit') {
      stats.status = 'completed'
    } else if (item.attempt_status === 'abandoned') {
      stats.status = 'abandoned'
    }
  })

  return Array.from(sessionStats.values()).map(stats => ({
    '세션ID': stats.sessionId.substring(0, 8),
    '이벤트수': stats.events,
    '시작시간': format(new Date(stats.firstEvent), 'yyyy-MM-dd HH:mm'),
    '종료시간': format(new Date(stats.lastEvent), 'yyyy-MM-dd HH:mm'),
    '예상금액': `₩${stats.totalPrice.toLocaleString()}`,
    '전환단계': stats.conversionStep,
    '상태': getStatusText(stats.status),
    '기기타입': stats.deviceType,
    '세션시간': `${Math.round((new Date(stats.lastEvent).getTime() - new Date(stats.firstEvent).getTime()) / 1000 / 60)}분`
  }))
}

function generateAnalyticsDetailedReport(data: any[]) {
  return data.map(item => ({
    '이벤트ID': item.id,
    '이벤트타입': item.event_type,
    '발생시간': format(new Date(item.event_timestamp), 'yyyy-MM-dd HH:mm:ss'),
    '세션ID': item.session_id?.substring(0, 8) || '',
    '객실ID': item.room_id || '',
    '프로그램수': item.program_ids?.length || 0,
    '예상금액': `₩${(item.estimated_total_price || 0).toLocaleString()}`,
    '전환단계': item.conversion_funnel_step || 0,
    '시도상태': item.attempt_status || 'unknown',
    '기기타입': item.device_type || 'unknown',
    '체크인': item.check_in_date ? format(new Date(item.check_in_date), 'yyyy-MM-dd') : '',
    '체크아웃': item.check_out_date ? format(new Date(item.check_out_date), 'yyyy-MM-dd') : '',
    '성인수': item.adults_count || 0,
    '아동수': item.children_count || 0,
    '총인원': item.total_guests || 0,
    '객실료': `₩${(item.room_price || 0).toLocaleString()}`,
    '프로그램료': `₩${(item.programs_price || 0).toLocaleString()}`
  }))
}

function generateConversionReport(data: any[]) {
  // 전환 단계별 집계
  const conversionSteps = new Map<number, {
    step: number
    stepName: string
    sessions: Set<string>
    events: number
  }>()

  const stepNames = {
    1: '페이지 조회',
    2: '객실 선택',
    3: '프로그램 선택',
    4: '예약 시도',
    5: '예약 완료'
  }

  data.forEach(item => {
    const step = item.conversion_funnel_step || 1
    
    if (!conversionSteps.has(step)) {
      conversionSteps.set(step, {
        step,
        stepName: stepNames[step as keyof typeof stepNames] || `단계 ${step}`,
        sessions: new Set(),
        events: 0
      })
    }

    const stepData = conversionSteps.get(step)!
    stepData.sessions.add(item.session_id)
    stepData.events += 1
  })

  const sortedSteps = Array.from(conversionSteps.values()).sort((a, b) => a.step - b.step)

  return sortedSteps.map((stepData, index) => {
    const prevStep = index > 0 ? sortedSteps[index - 1] : null
    const conversionRate = prevStep ? (stepData.sessions.size / prevStep.sessions.size) * 100 : 100
    const dropOffRate = 100 - conversionRate

    return {
      '단계': stepData.step,
      '단계명': stepData.stepName,
      '세션수': stepData.sessions.size,
      '이벤트수': stepData.events,
      '전환율': `${conversionRate.toFixed(1)}%`,
      '이탈율': `${dropOffRate.toFixed(1)}%`
    }
  })
}

function generatePopularItemsReport(data: any[]) {
  // 객실별 집계
  const roomStats = new Map<string, {
    id: string
    views: number
    reservations: number
    revenue: number
  }>()

  // 프로그램별 집계
  const programStats = new Map<string, {
    id: string
    views: number
    reservations: number
    revenue: number
  }>()

  data.forEach(item => {
    // 객실 통계
    if (item.room_id && ['room_view', 'reservation_start', 'reservation_submit'].includes(item.event_type)) {
      const roomId = item.room_id
      
      if (!roomStats.has(roomId)) {
        roomStats.set(roomId, {
          id: roomId,
          views: 0,
          reservations: 0,
          revenue: 0
        })
      }

      const roomData = roomStats.get(roomId)!
      
      if (item.event_type === 'room_view') {
        roomData.views += 1
      } else if (item.event_type === 'reservation_submit') {
        roomData.reservations += 1
        roomData.revenue += item.estimated_total_price || 0
      }
    }

    // 프로그램 통계
    if (item.program_ids && item.program_ids.length > 0) {
      item.program_ids.forEach((programId: string) => {
        if (!programStats.has(programId)) {
          programStats.set(programId, {
            id: programId,
            views: 0,
            reservations: 0,
            revenue: 0
          })
        }

        const programData = programStats.get(programId)!
        
        if (item.event_type === 'program_view') {
          programData.views += 1
        } else if (item.event_type === 'reservation_submit') {
          programData.reservations += 1
          programData.revenue += item.estimated_total_price || 0
        }
      })
    }
  })

  // 결과 데이터 생성
  const results: any[] = []

  // 객실 데이터 추가
  Array.from(roomStats.values())
    .sort((a, b) => b.views - a.views)
    .forEach(room => {
      results.push({
        '타입': '객실',
        'ID': room.id,
        '조회수': room.views,
        '예약수': room.reservations,
        '매출': `₩${room.revenue.toLocaleString()}`,
        '전환율': room.views > 0 ? `${((room.reservations / room.views) * 100).toFixed(1)}%` : '0%'
      })
    })

  // 프로그램 데이터 추가
  Array.from(programStats.values())
    .sort((a, b) => b.views - a.views)
    .forEach(program => {
      results.push({
        '타입': '프로그램',
        'ID': program.id,
        '조회수': program.views,
        '예약수': program.reservations,
        '매출': `₩${program.revenue.toLocaleString()}`,
        '전환율': program.views > 0 ? `${((program.reservations / program.views) * 100).toFixed(1)}%` : '0%'
      })
    })

  return results
}

// =============================================
// 유틸리티 함수들
// =============================================

function convertToCSV(data: any[]) {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    // UTF-8 BOM 추가 (엑셀에서 한글 깨짐 방지)
    '\uFEFF',
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = String(row[header] || '')
        // CSV에서 쉼표, 따옴표, 줄바꿈이 포함된 값은 따옴표로 감싸기
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return '완료'
    case 'abandoned':
      return '이탈'
    case 'in_progress':
      return '진행중'
    default:
      return '알 수 없음'
  }
} 