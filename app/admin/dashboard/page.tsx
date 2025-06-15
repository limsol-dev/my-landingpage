"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Activity,
  BarChart3,
  Timer,
  Target
} from 'lucide-react'

// 예약 데이터 (예약 관리 페이지와 동일한 데이터) - 예약일과 생성일 추가
const reservations = [
  {
    id: 'R001',
    customerName: '김민지',
    programType: '힐링 캠프',
    startDate: '2024-04-15',
    createdDate: '2024-04-10', // 예약 생성일
    status: 'confirmed',
    totalPrice: 190000,
    participants: 4
  },
  {
    id: 'R002',
    customerName: '박준호',
    programType: '디지털 디톡스 캠프',
    startDate: '2024-04-18',
    createdDate: '2024-04-12',
    status: 'confirmed',
    totalPrice: 450000,
    participants: 2
  },
  {
    id: 'R003',
    customerName: '이수연',
    programType: '교원 힐링 연수',
    startDate: '2024-04-22',
    createdDate: '2024-04-15',
    status: 'pending',
    totalPrice: 580000,
    participants: 12
  },
  {
    id: 'R004',
    customerName: '최가족',
    programType: '가족 힐링 캠프',
    startDate: '2024-04-26',
    createdDate: '2024-04-20',
    status: 'confirmed',
    totalPrice: 360000,
    participants: 4
  },
  {
    id: 'R005',
    customerName: '정건우',
    programType: '웰니스 디톡스',
    startDate: '2024-04-28',
    createdDate: '2024-04-22',
    status: 'confirmed',
    totalPrice: 890000,
    participants: 1
  },
  {
    id: 'R006',
    customerName: '한소영',
    programType: '펜션기본15인',
    startDate: '2024-05-03',
    createdDate: '2024-04-25',
    status: 'confirmed',
    totalPrice: 700000,
    participants: 15
  },
  {
    id: 'R007',
    customerName: '윤태현',
    programType: '명상 프로그램',
    startDate: '2024-05-05',
    createdDate: '2024-05-01',
    status: 'completed',
    totalPrice: 80000,
    participants: 1
  },
  {
    id: 'R008',
    customerName: '강은지',
    programType: '싱잉볼 테라피',
    startDate: '2024-05-07',
    createdDate: '2024-05-03',
    status: 'confirmed',
    totalPrice: 120000,
    participants: 1
  },
  {
    id: 'R009',
    customerName: '임동혁',
    programType: '자연 요가 클래스',
    startDate: '2024-05-10',
    createdDate: '2024-05-06',
    status: 'pending',
    totalPrice: 70000,
    participants: 1
  },
  {
    id: 'R010',
    customerName: '송민아',
    programType: '주/야간 패키지',
    startDate: '2024-05-12',
    createdDate: '2024-05-08',
    status: 'cancelled',
    totalPrice: 400000,
    participants: 6
  }
]

// 프로그램별 최대 수용 인원 (실시간 점유율 계산용)
const programCapacity = {
  '힐링 캠프': 20,
  '디지털 디톡스 캠프': 15,
  '교원 힐링 연수': 30,
  '가족 힐링 캠프': 25,
  '웰니스 디톡스': 10,
  '펜션기본15인': 15,
  '명상 프로그램': 12,
  '싱잉볼 테라피': 8,
  '자연 요가 클래스': 15,
  '주/야간 패키지': 20
}

export default function AdminDashboardPage() {
  // 현재 날짜 기준 계산
  const today = new Date()
  const todayString = today.toDateString()
  
  // 오늘 예약 (실제 프로그램 시작일이 오늘인 예약)
  const todayReservations = reservations.filter(r => 
    new Date(r.startDate).toDateString() === todayString
  )
  
  // 이번 달 예약 (프로그램 시작일 기준)
  const thisMonth = new Date()
  const thisMonthReservations = reservations.filter(r => {
    const startDate = new Date(r.startDate)
    return startDate.getMonth() === thisMonth.getMonth() && 
           startDate.getFullYear() === thisMonth.getFullYear()
  })
  
  // 확정된 예약 (confirmed + completed)
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'completed')
  
  // 1. 실시간 점유율 계산 - 오늘 확정된 예약 기준
  const calculateOccupancyRate = () => {
    const todayConfirmedReservations = reservations.filter(r => 
      new Date(r.startDate).toDateString() === todayString && 
      (r.status === 'confirmed' || r.status === 'completed')
    )
    
    const totalCapacity = Object.values(programCapacity).reduce((sum, capacity) => sum + capacity, 0)
    const occupiedCapacity = todayConfirmedReservations.reduce((sum, r) => sum + r.participants, 0)
    
    return totalCapacity > 0 ? Math.round((occupiedCapacity / totalCapacity) * 100) : 0
  }

  // 2. 당일 & 주간 매출 계산 - 확정된 예약만
  const calculateDailyWeeklyRevenue = () => {
    // 당일 매출 (오늘 시작하는 확정된 예약)
    const dailyRevenue = reservations
      .filter(r => 
        new Date(r.startDate).toDateString() === todayString && 
        (r.status === 'confirmed' || r.status === 'completed')
      )
      .reduce((sum, r) => sum + r.totalPrice, 0)

    // 주간 매출 (최근 7일간 시작한 확정된 예약)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weeklyRevenue = reservations
      .filter(r => {
        const startDate = new Date(r.startDate)
        return startDate >= weekAgo && 
               startDate <= today && 
               (r.status === 'confirmed' || r.status === 'completed')
      })
      .reduce((sum, r) => sum + r.totalPrice, 0)

    return { dailyRevenue, weeklyRevenue }
  }

  // 3. 평균 프로그램 단가 계산 - 확정된 예약 기준
  const calculateAverageProgramPrice = () => {
    if (confirmedReservations.length === 0) return 0
    
    const totalRevenue = confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0)
    return Math.round(totalRevenue / confirmedReservations.length)
  }

  // 4. 평균 예약 리드 타임 계산 - 확정된 예약 기준
  const calculateAverageLeadTime = () => {
    if (confirmedReservations.length === 0) return { average: 0, max: 0, min: 0 }
    
    const leadTimes = confirmedReservations.map(r => {
      const createdDate = new Date(r.createdDate)
      const startDate = new Date(r.startDate)
      const diffTime = Math.abs(startDate.getTime() - createdDate.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // 일 단위로 변환
    })
    
    const averageLeadTime = leadTimes.reduce((sum, days) => sum + days, 0) / leadTimes.length
    const maxLeadTime = Math.max(...leadTimes)
    const minLeadTime = Math.min(...leadTimes)
    
    return { 
      average: Math.round(averageLeadTime),
      max: maxLeadTime,
      min: minLeadTime
    }
  }

  // 5. 이번 달 매출 계산 - 이번 달 시작하는 확정된 예약
  const calculateThisMonthRevenue = () => {
    return thisMonthReservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0)
  }

  // 6. 예약 확정률 계산 - 전체 예약 대비 확정 비율
  const calculateConfirmationRate = () => {
    if (reservations.length === 0) return 0
    return Math.round((confirmedReservations.length / reservations.length) * 100)
  }

  // 7. 매출 분석 데이터
  const calculateRevenueAnalysis = () => {
    const totalRevenue = confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0)
    const averageRevenuePerReservation = confirmedReservations.length > 0 ? 
      Math.round(totalRevenue / confirmedReservations.length) : 0
    
    // 프로그램별 매출
    const programRevenue = confirmedReservations.reduce((acc, r) => {
      acc[r.programType] = (acc[r.programType] || 0) + r.totalPrice
      return acc
    }, {} as Record<string, number>)
    
    const topRevenueProgram = Object.entries(programRevenue)
      .sort(([,a], [,b]) => b - a)[0]
    
    return {
      totalRevenue,
      averageRevenuePerReservation,
      topRevenueProgram: topRevenueProgram ? topRevenueProgram[0] : '없음',
      topRevenueAmount: topRevenueProgram ? topRevenueProgram[1] : 0
    }
  }

  // 8. 리드타임 분석 데이터
  const calculateLeadTimeAnalysis = () => {
    if (confirmedReservations.length === 0) {
      return {
        immediate: 0, // 당일 예약
        shortTerm: 0, // 1-3일
        mediumTerm: 0, // 4-7일
        longTerm: 0 // 8일 이상
      }
    }
    
    const leadTimeCategories = confirmedReservations.reduce((acc, r) => {
      const createdDate = new Date(r.createdDate)
      const startDate = new Date(r.startDate)
      const diffTime = Math.abs(startDate.getTime() - createdDate.getTime())
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (days === 0) acc.immediate++
      else if (days <= 3) acc.shortTerm++
      else if (days <= 7) acc.mediumTerm++
      else acc.longTerm++
      
      return acc
    }, { immediate: 0, shortTerm: 0, mediumTerm: 0, longTerm: 0 })
    
    return leadTimeCategories
  }

  // 계산된 값들
  const occupancyRate = calculateOccupancyRate()
  const { dailyRevenue, weeklyRevenue } = calculateDailyWeeklyRevenue()
  const averageProgramPrice = calculateAverageProgramPrice()
  const averageLeadTime = calculateAverageLeadTime()
  const thisMonthRevenue = calculateThisMonthRevenue()
  const confirmationRate = calculateConfirmationRate()
  const revenueAnalysis = calculateRevenueAnalysis()
  const leadTimeAnalysis = calculateLeadTimeAnalysis()

  // 프로그램별 통계
  const programStats = reservations.reduce((acc, reservation) => {
    if (reservation.status !== 'cancelled') {
      if (!acc[reservation.programType]) {
        acc[reservation.programType] = { count: 0, revenue: 0, participants: 0 }
      }
      acc[reservation.programType].count++
      acc[reservation.programType].revenue += reservation.totalPrice
      acc[reservation.programType].participants += reservation.participants
    }
    return acc
  }, {} as Record<string, { count: number; revenue: number; participants: number }>)

  // 인기 프로그램 (예약 수 기준)
  const popularPrograms = Object.entries(programStats)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 3)

  // 최근 예약 (최신 5개)
  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5)

  // 기존 통계 + 새로운 통계
  const stats = [
    {
      name: '실시간 점유율',
      value: `${occupancyRate}%`,
      icon: Activity,
      description: `오늘 ${todayReservations.filter(r => r.status === 'confirmed' || r.status === 'completed').reduce((sum, r) => sum + r.participants, 0)}명 / 총 ${Object.values(programCapacity).reduce((sum, capacity) => sum + capacity, 0)}명`,
      trend: occupancyRate > 70 ? '+높음' : occupancyRate > 40 ? '보통' : '낮음',
      color: occupancyRate > 70 ? 'text-red-600' : occupancyRate > 40 ? 'text-yellow-600' : 'text-green-600'
    },
    {
      name: '당일 매출',
      value: `₩${dailyRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: `주간: ₩${weeklyRevenue.toLocaleString()}`,
      trend: dailyRevenue > 0 ? '+매출 발생' : '매출 없음',
      color: 'text-green-600'
    },
    {
      name: '평균 프로그램 단가',
      value: `₩${averageProgramPrice.toLocaleString()}`,
      icon: BarChart3,
      description: `예약당 평균 금액`,
      trend: averageProgramPrice > 300000 ? '+고가' : averageProgramPrice > 150000 ? '중가' : '저가',
      color: 'text-blue-600'
    },
    {
      name: '평균 예약 리드타임',
      value: `${averageLeadTime.average}일`,
      icon: Timer,
      description: `예약~이용일 평균 간격`,
      trend: averageLeadTime.average > 7 ? '길음' : averageLeadTime.average > 3 ? '보통' : '짧음',
      color: 'text-purple-600'
    },
    {
      name: '이번 달 매출',
      value: `₩${thisMonthRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: `${confirmedReservations.length}건 확정`,
      trend: `${Math.round((confirmedReservations.length / reservations.length) * 100)}% 확정률`,
      color: 'text-green-600'
    },
    {
      name: '예약 확정률',
      value: `${confirmationRate}%`,
      icon: TrendingUp,
      description: `${reservations.filter(r => r.status === 'cancelled').length}건 취소`,
      trend: reservations.filter(r => r.status === 'cancelled').length === 0 ? '취소 없음' : `${reservations.filter(r => r.status === 'cancelled').length}건 취소`,
      color: 'text-orange-600'
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">확정</Badge>
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">완료</Badge>
      case 'cancelled':
        return <Badge variant="destructive">취소</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <div className="text-sm text-muted-foreground">
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </div>
      </div>

      {/* 핵심 지표 카드 (새로 추가된 4개) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 실시간 점유율 */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">실시간 점유율</CardTitle>
            <Activity className={`h-4 w-4 ${occupancyRate > 70 ? 'text-red-600' : occupancyRate > 40 ? 'text-yellow-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <div className="mt-2">
              <Progress 
                value={occupancyRate} 
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              오늘 {todayReservations.filter(r => r.status === 'confirmed' || r.status === 'completed').reduce((sum, r) => sum + r.participants, 0)}명 / 총 {Object.values(programCapacity).reduce((sum, capacity) => sum + capacity, 0)}명
            </p>
            <div className="flex items-center pt-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${occupancyRate > 70 ? 'bg-red-500' : occupancyRate > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className={`text-xs ${occupancyRate > 70 ? 'text-red-600' : occupancyRate > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                {occupancyRate > 70 ? '높은 점유율' : occupancyRate > 40 ? '보통 점유율' : '낮은 점유율'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 당일 & 주간 매출 */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">당일 & 주간 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{dailyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              오늘 매출
            </p>
            <div className="mt-2 p-2 bg-green-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-700">주간 매출</span>
                <span className="text-sm font-medium text-green-800">₩{weeklyRevenue.toLocaleString()}</span>
              </div>
            </div>
                          <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">{dailyRevenue > 0 ? '매출 발생' : '매출 없음'}</span>
              </div>
          </CardContent>
        </Card>

        {/* 평균 프로그램 단가 */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 프로그램 단가</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{averageProgramPrice.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              예약당 평균 금액
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>최고가 프로그램</span>
                <span className="font-medium">웰니스 디톡스</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>최저가 프로그램</span>
                <span className="font-medium">자연 요가 클래스</span>
              </div>
            </div>
            <div className="flex items-center pt-1">
              <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-500">{averageProgramPrice > 300000 ? '고가 프로그램' : '적정 가격'}</span>
            </div>
          </CardContent>
        </Card>

        {/* 평균 예약 리드타임 */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 예약 리드타임</CardTitle>
            <Timer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageLeadTime.average}일</div>
            <p className="text-xs text-muted-foreground">
              예약~이용일 평균 간격
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>최장 리드타임</span>
                <span className="font-medium">{averageLeadTime.max}일</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>최단 리드타임</span>
                <span className="font-medium">{averageLeadTime.min}일</span>
              </div>
            </div>
            <div className="flex items-center pt-1">
              <Clock className={`h-3 w-3 mr-1 ${averageLeadTime.average > 7 ? 'text-red-500' : averageLeadTime.average > 3 ? 'text-yellow-500' : 'text-green-500'}`} />
              <span className={`text-xs ${averageLeadTime.average > 7 ? 'text-red-500' : averageLeadTime.average > 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                {averageLeadTime.average > 7 ? '긴 리드타임' : averageLeadTime.average > 3 ? '보통 리드타임' : '짧은 리드타임'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 기존 통계 카드들 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.slice(4).map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 매출 트렌드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              매출 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">당일 매출</span>
                <span className="font-medium text-green-600">
                  ₩{dailyRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">주간 매출</span>
                <span className="font-medium">
                  ₩{weeklyRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">월간 예상</span>
                <span className="font-medium text-blue-600">
                  ₩{(weeklyRevenue * 4.3).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">평균 단가</span>
                <span className="font-medium">
                  ₩{averageProgramPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 최근 예약 */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              최근 예약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{reservation.customerName}</p>
                      {getStatusBadge(reservation.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reservation.programType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.participants}명 • {reservation.startDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩{reservation.totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 인기 프로그램 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              인기 프로그램
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularPrograms.map(([program, stats], index) => (
                <div key={program} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`} />
                      <span className="text-sm font-medium truncate" title={program}>
                        {program.length > 15 ? program.substring(0, 15) + '...' : program}
                      </span>
                    </div>
                    <span className="text-sm font-bold">{stats.count}건</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.participants}명 • ₩{stats.revenue.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}
                      style={{ 
                        width: `${(stats.count / Math.max(...Object.values(programStats).map(s => s.count))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 예약 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>예약 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">확정</span>
                </div>
                <span className="font-medium text-green-600">
                  {reservations.filter(r => r.status === 'confirmed').length}건
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">대기중</span>
                </div>
                <span className="font-medium text-yellow-600">
                  {reservations.filter(r => r.status === 'pending').length}건
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">완료</span>
                </div>
                <span className="font-medium text-blue-600">
                  {reservations.filter(r => r.status === 'completed').length}건
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">취소</span>
                </div>
                <span className="font-medium text-red-600">
                  {reservations.filter(r => r.status === 'cancelled').length}건
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이번 달 통계 */}
        <Card>
          <CardHeader>
            <CardTitle>이번 달 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">총 예약</span>
                <span className="font-medium">{thisMonthReservations.length}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">총 참가자</span>
                <span className="font-medium">
                  {thisMonthReservations.reduce((sum, r) => sum + r.participants, 0)}명
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">확정 매출</span>
                <span className="font-medium text-green-600">
                  ₩{thisMonthRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">평균 예약금액</span>
                <span className="font-medium">
                  ₩{thisMonthReservations.filter(r => r.status !== 'cancelled').length > 0 ? 
                    Math.round(
                      thisMonthReservations
                        .filter(r => r.status !== 'cancelled')
                        .reduce((sum, r) => sum + r.totalPrice, 0) / 
                      thisMonthReservations.filter(r => r.status !== 'cancelled').length
                    ).toLocaleString() : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">확정률</span>
                <span className="font-medium text-blue-600">
                  {confirmationRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 프로그램별 매출 순위 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              프로그램별 매출 순위
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(programStats)
                .sort(([,a], [,b]) => b.revenue - a.revenue)
                .slice(0, 5)
                .map(([program, stats], index) => (
                  <div key={program} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium truncate" title={program}>
                          {program.length > 12 ? program.substring(0, 12) + '...' : program}
                        </span>
                      </div>
                      <span className="text-sm font-bold">₩{stats.revenue.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.count}건 예약 • {stats.participants}명 참가
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 매출 분석 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              매출 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">총 매출</span>
                <span className="font-medium text-green-600">
                  ₩{revenueAnalysis.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">예약당 평균 매출</span>
                <span className="font-medium">
                  ₩{revenueAnalysis.averageRevenuePerReservation.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">최고 매출 프로그램</span>
                <span className="font-medium text-yellow-600">
                  {revenueAnalysis.topRevenueProgram.length > 10 ? 
                    revenueAnalysis.topRevenueProgram.substring(0, 10) + '...' : 
                    revenueAnalysis.topRevenueProgram}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">최고 매출 금액</span>
                <span className="font-medium text-blue-600">
                  ₩{revenueAnalysis.topRevenueAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">확정 예약 수</span>
                <span className="font-medium">
                  {confirmedReservations.length}건
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 리드타임 분석 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              리드타임 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">당일 예약</span>
                <span className="font-medium text-red-600">
                  {leadTimeAnalysis.immediate}건
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">단기 예약 (1-3일)</span>
                <span className="font-medium text-yellow-600">
                  {leadTimeAnalysis.shortTerm}건
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">중기 예약 (4-7일)</span>
                <span className="font-medium text-blue-600">
                  {leadTimeAnalysis.mediumTerm}건
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">장기 예약 (8일+)</span>
                <span className="font-medium text-green-600">
                  {leadTimeAnalysis.longTerm}건
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">평균 리드타임</span>
                <span className="font-medium">
                  {averageLeadTime.average}일
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 최근 예약 */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              최근 예약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{reservation.customerName}</p>
                      {getStatusBadge(reservation.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reservation.programType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.participants}명 • {reservation.startDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩{reservation.totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 인기 프로그램 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              인기 프로그램
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularPrograms.map(([program, stats], index) => (
                <div key={program} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`} />
                      <span className="text-sm font-medium truncate" title={program}>
                        {program.length > 15 ? program.substring(0, 15) + '...' : program}
                      </span>
                    </div>
                    <span className="text-sm font-bold">{stats.count}건</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.participants}명 • ₩{stats.revenue.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}
                      style={{ 
                        width: `${(stats.count / Math.max(...Object.values(programStats).map(s => s.count))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 예약 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>예약 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">확정</span>
                </div>
                <span className="font-medium text-green-600">
                  {reservations.filter(r => r.status === 'confirmed').length}건
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">대기중</span>
                </div>
                <span className="font-medium text-yellow-600">
                  {reservations.filter(r => r.status === 'pending').length}건
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">완료</span>
                </div>
                <span className="font-medium text-blue-600">
                  {reservations.filter(r => r.status === 'completed').length}건
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">취소</span>
                </div>
                <span className="font-medium text-red-600">
                  {reservations.filter(r => r.status === 'cancelled').length}건
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이번 달 통계 */}
        <Card>
          <CardHeader>
            <CardTitle>이번 달 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">총 예약</span>
                <span className="font-medium">{thisMonthReservations.length}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">총 참가자</span>
                <span className="font-medium">
                  {thisMonthReservations.reduce((sum, r) => sum + r.participants, 0)}명
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">확정 매출</span>
                <span className="font-medium text-green-600">
                  ₩{thisMonthRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">평균 예약금액</span>
                <span className="font-medium">
                  ₩{thisMonthReservations.filter(r => r.status !== 'cancelled').length > 0 ? 
                    Math.round(
                      thisMonthReservations
                        .filter(r => r.status !== 'cancelled')
                        .reduce((sum, r) => sum + r.totalPrice, 0) / 
                      thisMonthReservations.filter(r => r.status !== 'cancelled').length
                    ).toLocaleString() : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">확정률</span>
                <span className="font-medium text-blue-600">
                  {confirmationRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 고객 분석 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              고객 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">총 고객수</span>
                <span className="font-medium">
                  {new Set(reservations.map(r => r.customerName)).size}명
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">재방문 고객</span>
                <span className="font-medium text-green-600">
                  {Object.values(reservations.reduce((acc, r) => {
                    acc[r.customerName] = (acc[r.customerName] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)).filter(count => count > 1).length}명
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">평균 참가인원</span>
                <span className="font-medium">
                  {Math.round(reservations.reduce((sum, r) => sum + r.participants, 0) / reservations.length)}명
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">최대 단체</span>
                <span className="font-medium text-blue-600">
                  {Math.max(...reservations.map(r => r.participants))}명
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">단체 예약 비율</span>
                <span className="font-medium">
                  {Math.round((reservations.filter(r => r.participants >= 10).length / reservations.length) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 운영 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              운영 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">운영 프로그램</span>
                <span className="font-medium">{Object.keys(programCapacity).length}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">총 수용인원</span>
                <span className="font-medium">
                  {Object.values(programCapacity).reduce((sum, capacity) => sum + capacity, 0)}명
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">가장 인기 프로그램</span>
                <span className="font-medium text-yellow-600">
                  {popularPrograms[0] ? popularPrograms[0][0].substring(0, 10) + (popularPrograms[0][0].length > 10 ? '...' : '') : '없음'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">평균 이용률</span>
                <span className="font-medium">
                  {Math.round((reservations.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + r.participants, 0) / 
                    (Object.values(programCapacity).reduce((sum, capacity) => sum + capacity, 0) * 30)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">예약 취소율</span>
                <span className="font-medium text-red-600">
                  {Math.round((reservations.filter(r => r.status === 'cancelled').length / reservations.length) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 공지사항 */}
        <Card>
          <CardHeader>
            <CardTitle>공지사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2 last:border-0">
                <p className="font-medium text-sm">🎉 웰니스 디톡스 프로그램 인기!</p>
                <p className="text-xs text-muted-foreground">
                  2024.04.28 - 현재 가장 높은 단가의 인기 프로그램입니다.
                </p>
              </div>
              <div className="border-b pb-2 last:border-0">
                <p className="font-medium text-sm">📊 실시간 점유율 {occupancyRate}%</p>
                <p className="text-xs text-muted-foreground">
                  2024.04.{new Date().getDate()} - 오늘 점유율이 {occupancyRate > 50 ? '높습니다' : '적정 수준입니다'}.
                </p>
              </div>
              <div className="border-b pb-2 last:border-0">
                <p className="font-medium text-sm">👥 단체 예약 증가 추세</p>
                <p className="text-xs text-muted-foreground">
                  2024.04.25 - 펜션기본15인 등 단체 프로그램 예약이 증가하고 있습니다.
                </p>
              </div>
              <div className="border-b pb-2 last:border-0">
                <p className="font-medium text-sm">⏰ 평균 리드타임 {averageLeadTime.average}일</p>
                <p className="text-xs text-muted-foreground">
                  2024.04.20 - 고객들의 계획적 예약 패턴을 보이고 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 