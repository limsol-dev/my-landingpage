import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createErrorResponse
} from '@/lib/rbac'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import * as XLSX from 'xlsx'

// =============================================
// 정산 리포트 엑셀/CSV 다운로드 (GET /api/admin/reports/export)
// =============================================
export async function GET(request: NextRequest) {
  try {
    // 정산 조회 권한 확인
    const authResult = await authorizeRequest(request, 'analytics:read')
    if (!authResult.success || !authResult.user) {
      return createErrorResponse(
        authResult.error || '권한이 없습니다',
        authResult.statusCode || 403
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const endDate = searchParams.get('endDate') || format(endOfMonth(new Date()), 'yyyy-MM-dd')
    const exportType = searchParams.get('type') || 'xlsx' // xlsx, csv
    const reportType = searchParams.get('reportType') || 'summary' // summary, detailed, programs, partners

    // =============================================
    // 정산 데이터 조회
    // =============================================
    const { data: reservations, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        check_in_date,
        check_out_date,
        adults,
        children,
        total_price,
        room_price,
        status,
        payment_status,
        created_at,
        reservation_programs (
          id,
          quantity,
          unit_price,
          total_price,
          scheduled_date,
          programs (
            id,
            name,
            category_name,
            partners (
              id,
              name
            )
          )
        ),
        rooms (
          id,
          name,
          type
        )
      `)
      .gte('check_in_date', startDate)
      .lte('check_in_date', endDate)
      .eq('status', 'confirmed')

    if (reservationError) {
      console.error('예약 데이터 조회 오류:', reservationError)
      return createErrorResponse('데이터를 조회하는데 실패했습니다', 500)
    }

    // =============================================
    // 리포트 타입별 데이터 생성
    // =============================================
    let worksheetData: any[] = []
    let filename = ''

    switch (reportType) {
      case 'summary':
        worksheetData = generateSummaryReport(reservations || [])
        filename = `정산요약_${startDate}_${endDate}`
        break
      case 'detailed':
        worksheetData = generateDetailedReport(reservations || [])
        filename = `정산상세_${startDate}_${endDate}`
        break
      case 'programs':
        worksheetData = generateProgramReport(reservations || [])
        filename = `프로그램별정산_${startDate}_${endDate}`
        break
      case 'partners':
        worksheetData = generatePartnerReport(reservations || [])
        filename = `파트너별정산_${startDate}_${endDate}`
        break
      default:
        worksheetData = generateSummaryReport(reservations || [])
        filename = `정산리포트_${startDate}_${endDate}`
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
      
      XLSX.utils.book_append_sheet(workbook, worksheet, '정산 리포트')
      
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
    console.error('리포트 다운로드 API 오류:', error)
    return createErrorResponse('파일 생성 중 오류가 발생했습니다', 500)
  }
}

// =============================================
// 리포트 생성 함수들
// =============================================

function generateSummaryReport(reservations: any[]) {
  const summary = reservations.map(reservation => {
    const programRevenue = reservation.reservation_programs?.reduce((sum: number, rp: any) => {
      return sum + (rp.total_price || 0)
    }, 0) || 0

    return {
      '예약번호': reservation.id.slice(0, 8),
      '고객명': reservation.customer_name,
      '체크인': format(new Date(reservation.check_in_date), 'yyyy-MM-dd'),
      '체크아웃': format(new Date(reservation.check_out_date), 'yyyy-MM-dd'),
      '인원수': `성인 ${reservation.adults || 0}명, 아동 ${reservation.children || 0}명`,
      '객실료': `₩${(reservation.room_price || 0).toLocaleString()}`,
      '프로그램료': `₩${programRevenue.toLocaleString()}`,
      '총금액': `₩${(reservation.total_price || 0).toLocaleString()}`,
      '상태': getStatusText(reservation.status),
      '결제상태': getPaymentStatusText(reservation.payment_status),
      '예약일': format(new Date(reservation.created_at), 'yyyy-MM-dd HH:mm')
    }
  })

  // 총계 행 추가
  const totalRevenue = reservations.reduce((sum: number, r: any) => sum + (r.total_price || 0), 0)
  const totalRoomRevenue = reservations.reduce((sum: number, r: any) => sum + (r.room_price || 0), 0)
  const totalProgramRevenue = reservations.reduce((sum: number, r: any) => {
    return sum + (r.reservation_programs?.reduce((pSum: number, rp: any) => pSum + (rp.total_price || 0), 0) || 0)
  }, 0)

  summary.push({
    '예약번호': '=== 총계 ===',
    '고객명': '',
    '체크인': '',
    '체크아웃': '',
    '인원수': `총 ${reservations.length}건`,
    '객실료': `₩${totalRoomRevenue.toLocaleString()}`,
    '프로그램료': `₩${totalProgramRevenue.toLocaleString()}`,
    '총금액': `₩${totalRevenue.toLocaleString()}`,
    '상태': '',
    '결제상태': '',
    '예약일': ''
  })

  return summary
}

function generateDetailedReport(reservations: any[]) {
  const detailed: any[] = []

  reservations.forEach(reservation => {
    // 기본 예약 정보 추가
    detailed.push({
      '구분': '예약',
      '예약번호': reservation.id.slice(0, 8),
      '고객명': reservation.customer_name,
      '연락처': reservation.customer_phone,
      '이메일': reservation.customer_email,
      '체크인': format(new Date(reservation.check_in_date), 'yyyy-MM-dd'),
      '체크아웃': format(new Date(reservation.check_out_date), 'yyyy-MM-dd'),
      '항목명': `${reservation.rooms?.name || '객실'} (${reservation.rooms?.type || ''})`,
      '수량': 1,
      '단가': `₩${(reservation.room_price || 0).toLocaleString()}`,
      '금액': `₩${(reservation.room_price || 0).toLocaleString()}`,
      '카테고리': '객실',
      '파트너': '직영',
      '상태': getStatusText(reservation.status)
    })

    // 프로그램 정보 추가
    reservation.reservation_programs?.forEach((rp: any) => {
      detailed.push({
        '구분': '프로그램',
        '예약번호': reservation.id.slice(0, 8),
        '고객명': reservation.customer_name,
        '연락처': reservation.customer_phone,
        '이메일': reservation.customer_email,
        '체크인': format(new Date(reservation.check_in_date), 'yyyy-MM-dd'),
        '체크아웃': format(new Date(reservation.check_out_date), 'yyyy-MM-dd'),
        '항목명': rp.programs?.name || '프로그램',
        '수량': rp.quantity || 1,
        '단가': `₩${(rp.unit_price || 0).toLocaleString()}`,
        '금액': `₩${(rp.total_price || 0).toLocaleString()}`,
        '카테고리': rp.programs?.category_name || '기타',
        '파트너': rp.programs?.partners?.name || '직영',
        '상태': getStatusText(reservation.status)
      })
    })
  })

  return detailed
}

function generateProgramReport(reservations: any[]) {
  const programMap = new Map()

  reservations.forEach(reservation => {
    reservation.reservation_programs?.forEach((rp: any) => {
      const programId = rp.programs?.id
      if (!programId) return

      if (!programMap.has(programId)) {
        programMap.set(programId, {
          '프로그램명': rp.programs?.name || '프로그램',
          '카테고리': rp.programs?.category_name || '기타',
          '파트너': rp.programs?.partners?.name || '직영',
          '총주문수': 0,
          '총수량': 0,
          '평균단가': 0,
          '총매출': 0,
          '예약건수': 0
        })
      }

      const programData = programMap.get(programId)
      programData['총주문수'] += 1
      programData['총수량'] += rp.quantity || 0
      programData['총매출'] += rp.total_price || 0
      programData['예약건수'] = new Set([...Array.from(programMap.values()), reservation.id]).size
    })
  })

  // 평균 단가 계산 및 통화 포맷팅
  const programReport = Array.from(programMap.values()).map((program: any) => {
    if (program['총수량'] > 0) {
      program['평균단가'] = `₩${Math.round(program['총매출'] / program['총수량']).toLocaleString()}`
    } else {
      program['평균단가'] = '₩0'
    }
    program['총매출'] = `₩${program['총매출'].toLocaleString()}`
    return program
  })

  return programReport.sort((a: any, b: any) => {
    const aRevenue = parseInt(a['총매출'].replace(/[₩,]/g, ''))
    const bRevenue = parseInt(b['총매출'].replace(/[₩,]/g, ''))
    return bRevenue - aRevenue
  })
}

function generatePartnerReport(reservations: any[]) {
  const partnerMap = new Map()

  reservations.forEach(reservation => {
    reservation.reservation_programs?.forEach((rp: any) => {
      const partnerId = rp.programs?.partners?.id || 'direct'
      const partnerName = rp.programs?.partners?.name || '직영'

      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          '파트너명': partnerName,
          '프로그램수': new Set(),
          '총주문수': 0,
          '총매출': 0,
          '예약건수': new Set()
        })
      }

      const partnerData = partnerMap.get(partnerId)
      partnerData['프로그램수'].add(rp.programs?.id)
      partnerData['총주문수'] += 1
      partnerData['총매출'] += rp.total_price || 0
      partnerData['예약건수'].add(reservation.id)
    })
  })

  const partnerReport = Array.from(partnerMap.values()).map((partner: any) => ({
    '파트너명': partner['파트너명'],
    '프로그램수': partner['프로그램수'].size,
    '총주문수': partner['총주문수'],
    '예약건수': partner['예약건수'].size,
    '총매출': `₩${partner['총매출'].toLocaleString()}`,
    '평균주문금액': `₩${Math.round(partner['총매출'] / Math.max(partner['총주문수'], 1)).toLocaleString()}`
  }))

  return partnerReport.sort((a: any, b: any) => {
    const aRevenue = parseInt(a['총매출'].replace(/[₩,]/g, ''))
    const bRevenue = parseInt(b['총매출'].replace(/[₩,]/g, ''))
    return bRevenue - aRevenue
  })
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
  const statusMap: Record<string, string> = {
    'pending': '대기중',
    'confirmed': '확정',
    'cancelled': '취소',
    'completed': '완료',
    'no_show': '노쇼'
  }
  return statusMap[status] || status
}

function getPaymentStatusText(paymentStatus: string) {
  const statusMap: Record<string, string> = {
    'pending': '결제대기',
    'partial': '부분결제',
    'completed': '결제완료',
    'refunded': '환불완료'
  }
  return statusMap[paymentStatus] || paymentStatus
} 