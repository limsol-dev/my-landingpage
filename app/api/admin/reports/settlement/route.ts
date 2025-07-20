import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  authorizeRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/rbac'
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, parseISO } from 'date-fns'

// =============================================
// 정산 리포트 데이터 조회 (GET /api/admin/reports/settlement)
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
    const groupBy = searchParams.get('groupBy') || 'day' // day, month, program, partner
    const programId = searchParams.get('programId') || ''
    const partnerId = searchParams.get('partnerId') || ''
    const paymentStatus = searchParams.get('paymentStatus') || 'completed'

    // =============================================
    // 기본 매출 통계 조회
    // =============================================
    const { data: basicStats, error: basicError } = await supabase
      .from('reservations')
      .select(`
        id,
        total_price,
        room_price,
        created_at,
        check_in_date,
        status,
        customer_name,
        customer_email,
        reservation_programs (
          id,
          total_price,
          program_id,
          quantity,
          programs (
            id,
            name,
            category_name,
            partner_id,
            partners (
              id,
              name
            )
          )
        )
      `)
      .gte('check_in_date', startDate)
      .lte('check_in_date', endDate)
      .eq('status', 'confirmed')

    if (basicError) {
      console.error('기본 매출 통계 조회 오류:', basicError)
      return createErrorResponse('매출 데이터를 불러오는데 실패했습니다', 500)
    }

    // =============================================
    // 데이터 집계 및 변환
    // =============================================
    
    // 전체 매출 요약
    const totalRevenue = basicStats?.reduce((sum: number, reservation: any) => {
      return sum + (reservation.total_price || 0)
    }, 0) || 0

    const totalRoomRevenue = basicStats?.reduce((sum: number, reservation: any) => {
      return sum + (reservation.room_price || 0)
    }, 0) || 0

    const totalProgramRevenue = basicStats?.reduce((sum: number, reservation: any) => {
      const programRevenue = reservation.reservation_programs?.reduce((pSum: number, rp: any) => {
        return pSum + (rp.total_price || 0)
      }, 0) || 0
      return sum + programRevenue
    }, 0) || 0

    const totalReservations = basicStats?.length || 0

    // 일별 매출 집계
    const dailyRevenue = groupBy === 'day' ? aggregateByDay(basicStats || []) : []
    
    // 월별 매출 집계
    const monthlyRevenue = groupBy === 'month' ? aggregateByMonth(basicStats || []) : []
    
    // 프로그램별 매출 집계
    const programRevenue = aggregateByProgram(basicStats || [])
    
    // 파트너별 매출 집계 
    const partnerRevenue = aggregateByPartner(basicStats || [])

    // 결제 상태별 집계
    const { data: paymentStats, error: paymentError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_method,
        payment_date,
        reservation_id
      `)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)

    const paymentSummary = paymentStats ? aggregatePayments(paymentStats) : {
      totalAmount: 0,
      completedAmount: 0,
      pendingAmount: 0,
      refundedAmount: 0,
      methodBreakdown: {}
    }

    // =============================================
    // 응답 데이터 구성
    // =============================================
    const reportData = {
      summary: {
        totalRevenue,
        totalRoomRevenue,
        totalProgramRevenue,
        totalReservations,
        averageOrderValue: totalReservations > 0 ? Math.round(totalRevenue / totalReservations) : 0,
        period: { startDate, endDate }
      },
      daily: dailyRevenue,
      monthly: monthlyRevenue,
      programs: programRevenue,
      partners: partnerRevenue,
      payments: paymentSummary,
      filters: {
        groupBy,
        programId,
        partnerId,
        paymentStatus,
        startDate,
        endDate
      }
    }

    return createSuccessResponse(reportData, '정산 리포트 조회 성공')

  } catch (error) {
    console.error('정산 리포트 API 오류:', error)
    return createErrorResponse('서버 오류가 발생했습니다', 500)
  }
}

// =============================================
// 데이터 집계 헬퍼 함수들
// =============================================

function aggregateByDay(reservations: any[]) {
  const dayMap = new Map()
  
  reservations.forEach(reservation => {
    const day = format(new Date(reservation.check_in_date), 'yyyy-MM-dd')
    
    if (!dayMap.has(day)) {
      dayMap.set(day, {
        date: day,
        revenue: 0,
        roomRevenue: 0,
        programRevenue: 0,
        reservationCount: 0
      })
    }
    
    const dayData = dayMap.get(day)
    dayData.revenue += reservation.total_price || 0
    dayData.roomRevenue += reservation.room_price || 0
    dayData.reservationCount += 1
    
    // 프로그램 매출 집계
    const programRevenue = reservation.reservation_programs?.reduce((sum: number, rp: any) => {
      return sum + (rp.total_price || 0)
    }, 0) || 0
    dayData.programRevenue += programRevenue
  })
  
  return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function aggregateByMonth(reservations: any[]) {
  const monthMap = new Map()
  
  reservations.forEach(reservation => {
    const month = format(new Date(reservation.check_in_date), 'yyyy-MM')
    
    if (!monthMap.has(month)) {
      monthMap.set(month, {
        month,
        revenue: 0,
        roomRevenue: 0,
        programRevenue: 0,
        reservationCount: 0
      })
    }
    
    const monthData = monthMap.get(month)
    monthData.revenue += reservation.total_price || 0
    monthData.roomRevenue += reservation.room_price || 0
    monthData.reservationCount += 1
    
    const programRevenue = reservation.reservation_programs?.reduce((sum: number, rp: any) => {
      return sum + (rp.total_price || 0)
    }, 0) || 0
    monthData.programRevenue += programRevenue
  })
  
  return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month))
}

function aggregateByProgram(reservations: any[]) {
  const programMap = new Map()
  
  reservations.forEach(reservation => {
    reservation.reservation_programs?.forEach((rp: any) => {
      const program = rp.programs
      if (!program) return
      
      const programId = program.id
      
      if (!programMap.has(programId)) {
        programMap.set(programId, {
          programId,
          programName: program.name,
          categoryName: program.category_name || '기타',
          totalRevenue: 0,
          totalQuantity: 0,
          reservationCount: 0,
          averagePrice: 0
        })
      }
      
      const programData = programMap.get(programId)
      programData.totalRevenue += rp.total_price || 0
      programData.totalQuantity += rp.quantity || 0
      programData.reservationCount += 1
    })
  })
  
  // 평균 가격 계산
  Array.from(programMap.values()).forEach(program => {
    if (program.totalQuantity > 0) {
      program.averagePrice = Math.round(program.totalRevenue / program.totalQuantity)
    }
  })
  
  return Array.from(programMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)
}

function aggregateByPartner(reservations: any[]) {
  const partnerMap = new Map()
  
  reservations.forEach(reservation => {
    reservation.reservation_programs?.forEach((rp: any) => {
      const partner = rp.programs?.partners
      if (!partner) return
      
      const partnerId = partner.id
      
      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          totalRevenue: 0,
          totalQuantity: 0,
          reservationCount: 0,
          programCount: 0
        })
      }
      
      const partnerData = partnerMap.get(partnerId)
      partnerData.totalRevenue += rp.total_price || 0
      partnerData.totalQuantity += rp.quantity || 0
      partnerData.reservationCount += 1
    })
  })
  
  return Array.from(partnerMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)
}

function aggregatePayments(payments: any[]) {
  const summary = {
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    methodBreakdown: {} as Record<string, number>
  }
  
  payments.forEach(payment => {
    summary.totalAmount += payment.amount || 0
    
    switch (payment.status) {
      case 'completed':
        summary.completedAmount += payment.amount || 0
        break
      case 'pending':
        summary.pendingAmount += payment.amount || 0
        break
      case 'refunded':
        summary.refundedAmount += payment.amount || 0
        break
    }
    
    // 결제 수단별 집계
    const method = payment.payment_method || 'unknown'
    summary.methodBreakdown[method] = (summary.methodBreakdown[method] || 0) + (payment.amount || 0)
  })
  
  return summary
} 