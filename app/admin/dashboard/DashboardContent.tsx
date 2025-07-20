'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  CalendarDays, 
  Users, 
  CreditCard, 
  Clock, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  Wifi,
  WifiOff,
  BarChart3,
  FileBarChart
} from 'lucide-react'
import { useState } from 'react'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import DashboardCharts from '@/components/admin/dashboard/DashboardCharts'
import RealtimeAnalyticsDashboard from '@/components/admin/dashboard/RealtimeAnalyticsDashboard'
import ReportsAnalytics from '@/components/admin/dashboard/ReportsAnalytics'

// =============================================
// Dashboard Stats Widgets
// =============================================

function StatsWidget({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  isLoading = false,
  formatValue = (v: number) => v.toString()
}: {
  title: string
  value: number
  icon: any
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  isLoading?: boolean
  formatValue?: (value: number) => string
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {trendValue && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================
// Recent Reservations Table
// =============================================

function RecentReservationsTable({ 
  reservations, 
  isLoading = false 
}: { 
  reservations: any[], 
  isLoading?: boolean 
}) {
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleViewDetails = (reservation: any) => {
    setSelectedReservation(reservation)
    setShowDetailModal(true)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { color: 'text-green-600', text: '확정', variant: 'default' as const }
      case 'pending':
        return { color: 'text-yellow-600', text: '대기중', variant: 'secondary' as const }
      case 'cancelled':
        return { color: 'text-red-600', text: '취소', variant: 'destructive' as const }
      case 'completed':
        return { color: 'text-blue-600', text: '완료', variant: 'outline' as const }
      default:
        return { color: 'text-gray-600', text: '알 수 없음', variant: 'secondary' as const }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 예약 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>최근 예약 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2 font-medium">예약번호</th>
                  <th className="p-2 font-medium">고객정보</th>
                  <th className="p-2 font-medium">프로그램</th>
                  <th className="p-2 font-medium">체크인</th>
                  <th className="p-2 font-medium">금액</th>
                  <th className="p-2 font-medium">상태</th>
                  <th className="p-2 font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {reservations.slice(0, 10).map((reservation) => {
                  const statusInfo = getStatusInfo(reservation.status)
                  return (
                    <tr key={reservation.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium text-blue-600">
                        {reservation.id}
                      </td>
                      <td className="p-2">
                        <div>{reservation.customer_name || reservation.customerName}</div>
                        <div className="text-xs text-gray-500">
                          {reservation.customer_phone || reservation.phone}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-32 truncate">
                          {reservation.programType || '기본 프로그램'}
                        </div>
                      </td>
                      <td className="p-2">
                        {new Date(reservation.check_in_date || reservation.startDate).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="p-2 font-medium">
                        ₩{(reservation.total_price || reservation.totalPrice || 0).toLocaleString()}
                      </td>
                      <td className="p-2">
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.text}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(reservation)}
                        >
                          상세
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 상세 정보 모달 */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>예약 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">예약 정보</h4>
                  <p>번호: {selectedReservation.id}</p>
                  <p>날짜: {new Date(selectedReservation.check_in_date || selectedReservation.startDate).toLocaleDateString('ko-KR')}</p>
                  <p>상태: {getStatusInfo(selectedReservation.status).text}</p>
                </div>
                <div>
                  <h4 className="font-medium">고객 정보</h4>
                  <p>이름: {selectedReservation.customer_name || selectedReservation.customerName}</p>
                  <p>연락처: {selectedReservation.customer_phone || selectedReservation.phone}</p>
                  <p>이메일: {selectedReservation.customer_email || selectedReservation.email}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium">결제 정보</h4>
                <p>총 금액: ₩{(selectedReservation.total_price || selectedReservation.totalPrice || 0).toLocaleString()}</p>
                <p>프로그램: {selectedReservation.programType || '기본 프로그램'}</p>
              </div>
              {selectedReservation.special_requests && (
                <div>
                  <h4 className="font-medium">특별 요청사항</h4>
                  <p>{selectedReservation.special_requests}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// =============================================
// Main Dashboard Component
// =============================================

export function DashboardContent() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const {
    data,
    stats,
    recentReservations,
    reservationTrends,
    programPopularity,
    roomOccupancy,
    isLoading,
    error,
    lastUpdated,
    refreshData
  } = useDashboardData({
    autoRefresh: true,
    refreshInterval: 30000,
    enableRealtime: true
  })

  // 에러 상태 처리
  if (error && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            대시보드 데이터를 불러오는데 실패했습니다: {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-muted-foreground">
            펜션 예약 현황 및 분석을 확인하세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {error ? (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-500">연결 오류</span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span>실시간 연결</span>
              </>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 탭 구조 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            실시간 현황
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            실시간 분석
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            누적 리포트
          </TabsTrigger>
        </TabsList>

        {/* 실시간 현황 탭 */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsWidget
              title="오늘 예약"
              value={stats?.todayReservations || 0}
              icon={CalendarDays}
              trend="up"
              trendValue="vs 어제"
              isLoading={isLoading}
              formatValue={(v) => `${v}건`}
            />
            <StatsWidget
              title="이번 주 예약"
              value={stats?.thisWeekReservations || 0}
              icon={Users}
              trend="up"
              trendValue="vs 지난주"
              isLoading={isLoading}
              formatValue={(v) => `${v}건`}
            />
            <StatsWidget
              title="이번 달 매출"
              value={stats?.thisMonthRevenue || 0}
              icon={CreditCard}
              trend="up"
              trendValue="vs 지난달"
              isLoading={isLoading}
              formatValue={(v) => `₩${v.toLocaleString()}`}
            />
            <StatsWidget
              title="평균 예약 금액"
              value={stats?.averageReservationValue || 0}
              icon={Activity}
              trend="neutral"
              trendValue="최근 30일"
              isLoading={isLoading}
              formatValue={(v) => `₩${v.toLocaleString()}`}
            />
          </div>

          {/* Error Banner */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                일부 데이터 업데이트에 실패했습니다: {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Charts Section */}
          {stats && (
            <DashboardCharts
              stats={stats}
              reservationTrends={reservationTrends}
              programPopularity={programPopularity}
              roomOccupancy={roomOccupancy}
              isLoading={isLoading}
            />
          )}

          {/* Recent Reservations */}
          <RecentReservationsTable 
            reservations={recentReservations} 
            isLoading={isLoading}
          />
        </TabsContent>

        {/* 실시간 분석 탭 */}
        <TabsContent value="analytics" className="space-y-6">
          <RealtimeAnalyticsDashboard />
        </TabsContent>

        {/* 누적 리포트 탭 */}
        <TabsContent value="reports" className="space-y-6">
          <ReportsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
} 