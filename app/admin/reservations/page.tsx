"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// 예약 타입 정의
interface Reservation {
  id: string
  customerName: string
  programType: string
  startDate: string
  endDate: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalPrice: number
  participants: number
  phone: string
  email: string
  specialRequests?: string
  paymentStatus: 'pending' | 'partial' | 'completed'
  referrer?: string
  confirmedDate?: string
}

// 랜딩페이지 기반 예약 샘플 데이터 10개
const reservations: Reservation[] = [
  {
    id: 'R001',
    customerName: '김민지',
    programType: '힐링 캠프',
    startDate: '2024-04-15',
    endDate: '2024-04-15',
    status: 'confirmed',
    totalPrice: 190000,
    participants: 4,
    phone: '010-1234-5678',
    email: 'minji@example.com',
    specialRequests: '요가매트 추가 요청',
    paymentStatus: 'completed',
    referrer: '이수진',
    confirmedDate: '2024-04-10'
  },
  {
    id: 'R002',
    customerName: '박준호',
    programType: '디지털 디톡스 캠프',
    startDate: '2024-04-18',
    endDate: '2024-04-20',
    status: 'confirmed',
    totalPrice: 450000,
    participants: 2,
    phone: '010-9876-5432',
    email: 'junho@example.com',
    paymentStatus: 'completed',
    referrer: '네이버 블로그',
    confirmedDate: '2024-04-12'
  },
  {
    id: 'R003',
    customerName: '이수연',
    programType: '교원 힐링 연수',
    startDate: '2024-04-22',
    endDate: '2024-04-25',
    status: 'pending',
    totalPrice: 580000,
    participants: 12,
    phone: '010-5555-7777',
    email: 'suyeon@school.edu',
    specialRequests: '교직원 증명서 첨부 예정',
    paymentStatus: 'pending',
    referrer: '교육청 공문'
  },
  {
    id: 'R004',
    customerName: '최가족',
    programType: '가족 힐링 캠프',
    startDate: '2024-04-26',
    endDate: '2024-04-27',
    status: 'confirmed',
    totalPrice: 360000,
    participants: 4,
    phone: '010-3333-4444',
    email: 'family@example.com',
    specialRequests: '아이 2명 (7세, 10세)',
    paymentStatus: 'partial',
    referrer: '김민지',
    confirmedDate: '2024-04-20'
  },
  {
    id: 'R005',
    customerName: '정건우',
    programType: '웰니스 디톡스',
    startDate: '2024-04-28',
    endDate: '2024-05-02',
    status: 'confirmed',
    totalPrice: 890000,
    participants: 1,
    phone: '010-7777-8888',
    email: 'gunwoo@example.com',
    specialRequests: '개인 운동 프로그램 희망',
    paymentStatus: 'completed',
    referrer: '인스타그램',
    confirmedDate: '2024-04-22'
  },
  {
    id: 'R006',
    customerName: '한소영',
    programType: '펜션기본15인',
    startDate: '2024-05-03',
    endDate: '2024-05-04',
    status: 'confirmed',
    totalPrice: 700000,
    participants: 15,
    phone: '010-2222-3333',
    email: 'soyoung@example.com',
    specialRequests: '단체 조식 준비',
    paymentStatus: 'partial',
    referrer: '회사 동료',
    confirmedDate: '2024-04-28'
  },
  {
    id: 'R007',
    customerName: '윤태현',
    programType: '명상 프로그램',
    startDate: '2024-05-05',
    endDate: '2024-05-05',
    status: 'completed',
    totalPrice: 80000,
    participants: 1,
    phone: '010-6666-7777',
    email: 'taehyun@example.com',
    paymentStatus: 'completed',
    referrer: '유튜브',
    confirmedDate: '2024-05-01'
  },
  {
    id: 'R008',
    customerName: '강은지',
    programType: '싱잉볼 테라피',
    startDate: '2024-05-07',
    endDate: '2024-05-07',
    status: 'confirmed',
    totalPrice: 120000,
    participants: 1,
    phone: '010-4444-5555',
    email: 'eunji@example.com',
    specialRequests: '금속 알레르기 있음',
    paymentStatus: 'completed',
    referrer: '정건우',
    confirmedDate: '2024-05-03'
  },
  {
    id: 'R009',
    customerName: '임동혁',
    programType: '자연 요가 클래스',
    startDate: '2024-05-10',
    endDate: '2024-05-10',
    status: 'pending',
    totalPrice: 70000,
    participants: 1,
    phone: '010-8888-9999',
    email: 'donghyuk@example.com',
    paymentStatus: 'pending'
  },
  {
    id: 'R010',
    customerName: '송민아',
    programType: '주/야간 패키지',
    startDate: '2024-05-12',
    endDate: '2024-05-12',
    status: 'cancelled',
    totalPrice: 400000,
    participants: 6,
    phone: '010-1111-2222',
    email: 'mina@example.com',
    specialRequests: '야간권 희망했으나 취소',
    paymentStatus: 'pending'
  },
  // 6월 데이터 추가
  {
    id: 'R011',
    customerName: '김서현',
    programType: '웰니스 디톡스',
    startDate: '2024-06-02',
    endDate: '2024-06-06',
    status: 'confirmed',
    totalPrice: 890000,
    participants: 2,
    phone: '010-5678-1234',
    email: 'seohyun@example.com',
    specialRequests: '커플 프로그램 희망',
    paymentStatus: 'completed'
  },
  {
    id: 'R012',
    customerName: '박민수',
    programType: '힐링 캠프',
    startDate: '2024-06-05',
    endDate: '2024-06-05',
    status: 'confirmed',
    totalPrice: 190000,
    participants: 3,
    phone: '010-9012-3456',
    email: 'minsu@example.com',
    specialRequests: '친구들과 함께',
    paymentStatus: 'partial'
  },
  {
    id: 'R013',
    customerName: '이지영',
    programType: '디지털 디톡스 캠프',
    startDate: '2024-06-08',
    endDate: '2024-06-10',
    status: 'pending',
    totalPrice: 450000,
    participants: 1,
    phone: '010-3456-7890',
    email: 'jiyoung@example.com',
    specialRequests: '스마트폰 보관함 요청',
    paymentStatus: 'pending'
  },
  {
    id: 'R014',
    customerName: '최현우',
    programType: '펜션기본15인',
    startDate: '2024-06-12',
    endDate: '2024-06-13',
    status: 'confirmed',
    totalPrice: 700000,
    participants: 12,
    phone: '010-7890-1234',
    email: 'hyunwoo@example.com',
    specialRequests: '회사 워크샵',
    paymentStatus: 'completed'
  },
  {
    id: 'R015',
    customerName: '정수민',
    programType: '가족 힐링 캠프',
    startDate: '2024-06-15',
    endDate: '2024-06-16',
    status: 'confirmed',
    totalPrice: 360000,
    participants: 5,
    phone: '010-2345-6789',
    email: 'sumin@example.com',
    specialRequests: '3세대 가족 여행',
    paymentStatus: 'partial'
  },
  {
    id: 'R016',
    customerName: '한지원',
    programType: '교원 힐링 연수',
    startDate: '2024-06-18',
    endDate: '2024-06-21',
    status: 'completed',
    totalPrice: 580000,
    participants: 8,
    phone: '010-6789-0123',
    email: 'jiwon@school.edu',
    specialRequests: '교원 연수 수료증 발급',
    paymentStatus: 'completed'
  },
  {
    id: 'R017',
    customerName: '윤성호',
    programType: '명상 프로그램',
    startDate: '2024-06-22',
    endDate: '2024-06-22',
    status: 'confirmed',
    totalPrice: 80000,
    participants: 2,
    phone: '010-0123-4567',
    email: 'sungho@example.com',
    specialRequests: '부부 명상 프로그램',
    paymentStatus: 'completed'
  },
  {
    id: 'R018',
    customerName: '강미래',
    programType: '싱잉볼 테라피',
    startDate: '2024-06-25',
    endDate: '2024-06-25',
    status: 'cancelled',
    totalPrice: 120000,
    participants: 1,
    phone: '010-4567-8901',
    email: 'mirae@example.com',
    specialRequests: '개인 사정으로 취소',
    paymentStatus: 'pending'
  }
]

export default function ReservationsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // 필터링된 예약 목록
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.programType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter
    const matchesDate = !selectedDate || 
                       new Date(reservation.startDate).toDateString() === selectedDate.toDateString()
    
    return matchesSearch && matchesStatus && matchesDate
  })

  // 통계 계산 - 선택된 날짜에 따라 동적 계산
  const getStatistics = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // 지난달, 이번달, 다음달 매출 계산
    const lastMonthRevenue = reservations
      .filter(r => {
        const reservationDate = new Date(r.startDate)
        return reservationDate.getMonth() === (currentMonth - 1 + 12) % 12 && 
               reservationDate.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear) &&
               (r.status === 'confirmed' || r.status === 'completed')
      })
      .reduce((sum, r) => sum + r.totalPrice, 0)

    const thisMonthRevenue = reservations
      .filter(r => {
        const reservationDate = new Date(r.startDate)
        return reservationDate.getMonth() === currentMonth && 
               reservationDate.getFullYear() === currentYear &&
               (r.status === 'confirmed' || r.status === 'completed')
      })
      .reduce((sum, r) => sum + r.totalPrice, 0)

    const nextMonthRevenue = reservations
      .filter(r => {
        const reservationDate = new Date(r.startDate)
        return reservationDate.getMonth() === (currentMonth + 1) % 12 && 
               reservationDate.getFullYear() === (currentMonth === 11 ? currentYear + 1 : currentYear) &&
               (r.status === 'confirmed' || r.status === 'completed')
      })
      .reduce((sum, r) => sum + r.totalPrice, 0)

    // 평균 예약 금액 계산
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'completed')
    const averageReservationAmount = confirmedReservations.length > 0 ? 
      Math.round(confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0) / confirmedReservations.length) : 0

    // 인기 프로그램 계산
    const programCounts = reservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((acc, r) => {
        acc[r.programType] = (acc[r.programType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    
    const popularProgram = Object.entries(programCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '데이터 없음'

    if (selectedDate) {
      // 선택된 날짜의 통계
      const selectedDateReservations = reservations.filter(r => 
        new Date(r.startDate).toDateString() === selectedDate.toDateString()
      )
      
      const selectedDateRevenue = selectedDateReservations
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((sum, r) => sum + r.totalPrice, 0)
      
      return {
        todayReservations: selectedDateReservations.length,
        thisMonthReservations: selectedDateReservations.length,
        totalRevenue: selectedDateRevenue,
        totalReservations: selectedDateReservations.length,
        cancelledReservations: selectedDateReservations.filter(r => r.status === 'cancelled').length,
        isDateSelected: true,
        selectedDateString: format(selectedDate, 'MM월 dd일', { locale: ko }),
        lastMonthRevenue,
        thisMonthRevenue,
        nextMonthRevenue,
        averageReservationAmount,
        popularProgram
      }
    } else {
      // 전체 통계
      const todayReservations = reservations.filter(r => 
        new Date(r.startDate).toDateString() === new Date().toDateString()
      ).length

      const thisMonthReservations = reservations.filter(r => {
        const reservationDate = new Date(r.startDate)
        return reservationDate.getMonth() === currentMonth && 
               reservationDate.getFullYear() === currentYear
      }).length

      const totalRevenue = reservations
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((sum, r) => sum + r.totalPrice, 0)

      const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length

      return {
        todayReservations,
        thisMonthReservations,
        totalRevenue,
        totalReservations: reservations.length,
        cancelledReservations,
        isDateSelected: false,
        selectedDateString: '',
        lastMonthRevenue,
        thisMonthRevenue,
        nextMonthRevenue,
        averageReservationAmount,
        popularProgram
      }
    }
  }

  const statistics = getStatistics()
  const cancellationRate = statistics.totalReservations > 0 ? 
    Math.round((statistics.cancelledReservations / statistics.totalReservations) * 100) : 0

  // 상태별 색상 및 텍스트
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

  // 결제 상태별 색상 및 텍스트
  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600', text: '완료', variant: 'default' as const }
      case 'partial':
        return { color: 'text-orange-600', text: '부분결제', variant: 'secondary' as const }
      case 'pending':
        return { color: 'text-red-600', text: '미결제', variant: 'destructive' as const }
      default:
        return { color: 'text-gray-600', text: '알 수 없음', variant: 'secondary' as const }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">예약 관리</h1>
        <Button>새 예약 추가</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>날짜별 조회</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ko}
              className="rounded-md border"
            />
            {selectedDate && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-center">
                  {format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })}
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  해당 날짜 예약: {filteredReservations.length}건
                </div>
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedDate(undefined)}
                  >
                    날짜 필터 해제
                  </Button>
                </div>
              </div>
            )}
            {!selectedDate && (
              <div className="mt-4 text-xs text-center text-muted-foreground">
                날짜를 선택하여 해당 날짜의 예약을 조회하세요
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>검색 필터</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>예약자명/프로그램 검색</Label>
              <Input
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>예약 상태</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="confirmed">확정</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setSelectedDate(undefined)
              }}
            >
              필터 초기화
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {statistics.isDateSelected ? `${statistics.selectedDateString} 예약 통계` : '예약 통계'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>{statistics.isDateSelected ? '선택 날짜 예약' : '오늘 예약'}</span>
                <span className="font-bold">{statistics.todayReservations}건</span>
              </div>
              <div className="flex justify-between">
                <span>{statistics.isDateSelected ? '선택 날짜 예약' : '이번 달 예약'}</span>
                <span className="font-bold">{statistics.thisMonthReservations}건</span>
              </div>
              <div className="flex justify-between">
                <span>취소율</span>
                <span className="font-bold text-red-500">{cancellationRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>{statistics.isDateSelected ? '선택 날짜 총 예약' : '총 예약'}</span>
                <span className="font-bold">{statistics.totalReservations}건</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {statistics.isDateSelected ? `${statistics.selectedDateString} 매출 현황` : '매출 현황'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!statistics.isDateSelected && (
                <>
                  <div className="flex justify-between">
                    <span>지난달 매출</span>
                    <span className="font-bold text-gray-600">
                      {statistics.lastMonthRevenue.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>이번달 매출</span>
                    <span className="font-bold text-blue-600">
                      {statistics.thisMonthRevenue.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>다음달 매출</span>
                    <span className="font-bold text-purple-600">
                      {statistics.nextMonthRevenue.toLocaleString()}원
                    </span>
                  </div>
                </>
              )}
              {statistics.isDateSelected && (
                <div className="flex justify-between">
                  <span>선택 날짜 매출</span>
                  <span className="font-bold text-green-600">
                    {statistics.totalRevenue.toLocaleString()}원
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>평균 예약 금액</span>
                <span className="font-bold text-green-600">
                  {statistics.averageReservationAmount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span>인기 프로그램</span>
                <span className="font-bold text-orange-600">{statistics.popularProgram}</span>
              </div>
              {!statistics.isDateSelected && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">총 누적 매출</span>
                    <span className="font-bold text-lg text-green-700">
                      {statistics.totalRevenue.toLocaleString()}원
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>예약 목록 ({filteredReservations.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>예약번호</TableHead>
                <TableHead>예약자</TableHead>
                <TableHead>프로그램</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>종료일</TableHead>
                <TableHead>인원</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>추천인</TableHead>
                <TableHead>예약확정일</TableHead>
                <TableHead>예약상태</TableHead>
                <TableHead>결제상태</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => {
                const statusInfo = getStatusInfo(reservation.status)
                const paymentInfo = getPaymentStatusInfo(reservation.paymentStatus)
                
                return (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">{reservation.id}</TableCell>
                    <TableCell>{reservation.customerName}</TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate" title={reservation.programType}>
                        {reservation.programType}
                      </div>
                    </TableCell>
                    <TableCell>{reservation.startDate}</TableCell>
                    <TableCell>{reservation.endDate}</TableCell>
                    <TableCell>{reservation.participants}명</TableCell>
                    <TableCell>{reservation.totalPrice.toLocaleString()}원</TableCell>
                    <TableCell>
                      <div className="max-w-24 truncate" title={reservation.referrer}>
                        {reservation.referrer || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {reservation.confirmedDate || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentInfo.variant}>
                        {paymentInfo.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">상세보기</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>예약 상세 정보 - {reservation.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>예약자명</Label>
                                <p className="mt-1 font-medium">{reservation.customerName}</p>
                              </div>
                              <div>
                                <Label>연락처</Label>
                                <p className="mt-1">{reservation.phone}</p>
                              </div>
                              <div>
                                <Label>이메일</Label>
                                <p className="mt-1">{reservation.email}</p>
                              </div>
                              <div>
                                <Label>참가인원</Label>
                                <p className="mt-1">{reservation.participants}명</p>
                              </div>
                              <div>
                                <Label>추천인</Label>
                                <p className="mt-1">{reservation.referrer || '없음'}</p>
                              </div>
                              <div>
                                <Label>예약확정일</Label>
                                <p className="mt-1">{reservation.confirmedDate || '미확정'}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>프로그램</Label>
                                <p className="mt-1 font-medium">{reservation.programType}</p>
                              </div>
                              <div>
                                <Label>총 금액</Label>
                                <p className="mt-1 font-bold text-lg">{reservation.totalPrice.toLocaleString()}원</p>
                              </div>
                              <div>
                                <Label>시작일</Label>
                                <p className="mt-1">{reservation.startDate}</p>
                              </div>
                              <div>
                                <Label>종료일</Label>
                                <p className="mt-1">{reservation.endDate}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>예약 상태</Label>
                                <div className="mt-1">
                                  <Badge variant={statusInfo.variant}>
                                    {statusInfo.text}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label>결제 상태</Label>
                                <div className="mt-1">
                                  <Badge variant={paymentInfo.variant}>
                                    {paymentInfo.text}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {reservation.specialRequests && (
                              <div>
                                <Label>특별 요청사항</Label>
                                <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                                  {reservation.specialRequests}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4 border-t">
                              {reservation.status === 'pending' && (
                                <>
                                  <Button variant="outline" className="text-red-600">
                                    예약 취소
                                  </Button>
                                  <Button>
                                    예약 확정
                                  </Button>
                                </>
                              )}
                              {reservation.status === 'confirmed' && (
                                <>
                                  <Button variant="outline">
                                    예약 수정
                                  </Button>
                                  <Button>
                                    완료 처리
                                  </Button>
                                </>
                              )}
                              {reservation.status === 'completed' && (
                                <Button variant="outline">
                                  영수증 출력
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 