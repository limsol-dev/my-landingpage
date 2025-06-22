'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarDays, Users, CreditCard, Clock, Eye, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  createdAt?: string
  adults?: number
  children?: number
}

// 예약 데이터 (예약 관리 페이지와 완전 동일한 모든 데이터)
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
  },
  // 2025년 6월 숙박 프로그램 데이터
  {
    id: 'R019',
    customerName: '김태우',
    programType: '힐링 캠프',
    startDate: '2025-06-03',
    endDate: '2025-06-05',
    status: 'confirmed',
    totalPrice: 380000,
    participants: 2,
    phone: '010-1111-2222',
    email: 'taewoo@example.com',
    specialRequests: '커플 힐링 프로그램 희망',
    paymentStatus: 'completed',
    referrer: '네이버 블로그',
    confirmedDate: '2025-05-25',
    adults: 2,
    children: 0
  },
  {
    id: 'R020',
    customerName: '박서연',
    programType: '디지털 디톡스 캠프',
    startDate: '2025-06-08',
    endDate: '2025-06-11',
    status: 'confirmed',
    totalPrice: 675000,
    participants: 3,
    phone: '010-3333-4444',
    email: 'seoyeon@example.com',
    specialRequests: '직장인 그룹 디톡스',
    paymentStatus: 'partial',
    referrer: '김태우',
    confirmedDate: '2025-05-30',
    adults: 3,
    children: 0
  },  
  {
    id: 'R021',
    customerName: '이준혁',
    programType: '가족 힐링 캠프',
    startDate: '2025-06-14',
    endDate: '2025-06-16',
    status: 'pending',
    totalPrice: 720000,
    participants: 6,
    phone: '010-5555-6666',
    email: 'junhyuk@example.com',
    specialRequests: '아이 4명 포함 (5세, 8세, 10세, 12세)',
    paymentStatus: 'pending',
    referrer: '인스타그램',
    adults: 2,
    children: 4
  },
  {
    id: 'R022',
    customerName: '최민정',
    programType: '웰니스 디톡스',
    startDate: '2025-06-20',
    endDate: '2025-06-24',
    status: 'confirmed',
    totalPrice: 1180000,
    participants: 2,
    phone: '010-7777-8888',
    email: 'minjeong@example.com',
    specialRequests: '부부 웰니스 프로그램',
    paymentStatus: 'completed',
    referrer: '유튜브',
    confirmedDate: '2025-06-10',
    adults: 2,
    children: 0
  },
  {
    id: 'R023',
    customerName: '한지훈',
    programType: '펜션기본15인',
    startDate: '2025-06-27',
    endDate: '2025-06-29',
    status: 'confirmed',
    totalPrice: 1050000,
    participants: 15,
    phone: '010-9999-0000',
    email: 'jihoon@example.com',
    specialRequests: '회사 워크샵 및 팀빌딩',
    paymentStatus: 'partial',
    referrer: '회사 추천',
    confirmedDate: '2025-06-15',
    adults: 15,
    children: 0
  },
  // 2025년 7월 숙박 프로그램 데이터
  {
    id: 'R024',
    customerName: '윤하늘',
    programType: '교원 힐링 연수',
    startDate: '2025-07-05',
    endDate: '2025-07-09',
    status: 'confirmed',
    totalPrice: 1160000,
    participants: 20,
    phone: '010-1234-5678',
    email: 'haneul@school.edu',
    specialRequests: '여름 교원 힐링 연수 프로그램',
    paymentStatus: 'completed',
    referrer: '교육청 공문',
    confirmedDate: '2025-06-20',
    adults: 20,
    children: 0
  },
  {
    id: 'R025',
    customerName: '강도현',
    programType: '주/야간 패키지',
    startDate: '2025-07-12',
    endDate: '2025-07-14',
    status: 'pending',
    totalPrice: 560000,
    participants: 4,
    phone: '010-2468-1357',
    email: 'dohyun@example.com',
    specialRequests: '여름휴가 가족여행',
    paymentStatus: 'pending',
    referrer: '박서연',
    adults: 2,
    children: 2
  },
  {
    id: 'R026',
    customerName: '조은빈',
    programType: '힐링 캠프',
    startDate: '2025-07-18',
    endDate: '2025-07-20',
    status: 'completed',
    totalPrice: 570000,
    participants: 3,
    phone: '010-9876-5432',
    email: 'eunbin@example.com',
    specialRequests: '친구들과 여름휴가',
    paymentStatus: 'completed',
    referrer: '최민정',
    confirmedDate: '2025-07-05',
    adults: 3,
    children: 0
  },
  {
    id: 'R027',
    customerName: '신우진',
    programType: '디지털 디톡스 캠프',
    startDate: '2025-07-23',
    endDate: '2025-07-26',
    status: 'confirmed',
    totalPrice: 900000,
    participants: 4,
    phone: '010-1357-2468',
    email: 'woojin@example.com',
    specialRequests: '대학생 그룹 디톡스',
    paymentStatus: 'partial',
    referrer: '한지훈',
    confirmedDate: '2025-07-10',
    adults: 4,
    children: 0
  },
  {
    id: 'R028',
    customerName: '오채린',
    programType: '가족 힐링 캠프',
    startDate: '2025-07-29',
    endDate: '2025-07-31',
    status: 'cancelled',
    totalPrice: 540000,
    participants: 3,
    phone: '010-5678-9012',
    email: 'chaerin@example.com',
    specialRequests: '휴가 일정 변경으로 취소',
    paymentStatus: 'pending',
    referrer: '조은빈',
    adults: 2,
    children: 1
  }
]

export function DashboardContent() {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [liveReservations, setLiveReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // 실시간 예약 데이터 불러오기
  const fetchLiveReservations = async () => {
    setIsLoading(true)
    try {
      console.log('대시보드: 예약 데이터 요청 시작...')
      const response = await fetch('/api/reservations/create', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('대시보드: 받은 데이터:', data)
      
      if (data.success && Array.isArray(data.reservations)) {
        console.log('대시보드: 실시간 예약 수:', data.reservations.length)
        setLiveReservations(data.reservations)
        setLastUpdated(new Date())
      } else {
        console.error('대시보드: API 응답 형식 오류:', data)
        setLiveReservations([])
      }
    } catch (error) {
      console.error('대시보드: 예약 데이터 불러오기 실패:', error)
      setLiveReservations([])
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchLiveReservations()
    
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchLiveReservations, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // 예약 상세보기 함수
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowDetailModal(true)
  }

  // 상태별 정보 함수
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

  // 결제 상태별 정보 함수
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

  // 기존 샘플 데이터와 실시간 데이터 합치기
  const allReservations = [...reservations, ...liveReservations]

  // 오늘의 예약 수
  const todayReservations = allReservations.filter(reservation => {
    const today = new Date();
    const startDate = new Date(reservation.startDate);
    return startDate.toDateString() === today.toDateString();
  }).length;

  // 이번 주 예약 수
  const thisWeekReservations = allReservations.filter(reservation => {
    const today = new Date();
    const startDate = new Date(reservation.startDate);
    const diffTime = Math.abs(startDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  // 총 예약 금액 (확정/완료된 예약만)
  const totalAmount = allReservations
    .filter(reservation => reservation.status === 'confirmed' || reservation.status === 'completed')
    .reduce((sum, reservation) => sum + reservation.totalPrice, 0);

  // 평균 체류 기간
  const averageStay = allReservations.length > 0
    ? allReservations.reduce((sum, reservation) => {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // 최소 1일
        return sum + diffDays;
      }, 0) / allReservations.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          대시보드 - 전체 예약 {allReservations.length}건
          {liveReservations.length > 0 && (
            <span className="ml-2 text-lg text-green-600 font-normal">
              • 실시간 예약 {liveReservations.length}건 포함
            </span>
          )}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchLiveReservations}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '새로고침 중...' : '실시간 새로고침'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘의 예약</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations}건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 주 예약</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekReservations}건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 예약 금액</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 체류 기간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageStay.toFixed(1)}일</div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 예약 목록 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          최근 예약 목록 ({allReservations.length}건 중 최신 10건)
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약번호</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">프로그램</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시작일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종료일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">인원</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allReservations
                .slice()
                .sort((a, b) => {
                  // 최신순 정렬 (createdAt이 있으면 그것으로, 없으면 예약번호로)
                  if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  }
                  
                  // createdAt이 없는 경우 예약번호로 역순 정렬 (높은 번호가 위에)
                  const aId = a.id.replace(/\D/g, '') // 숫자만 추출
                  const bId = b.id.replace(/\D/g, '') // 숫자만 추출
                  return parseInt(bId) - parseInt(aId)
                })
                .slice(0, 10) // 최신 10건만 표시
                .map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{reservation.id}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                    <div className="text-xs text-gray-500">{reservation.phone}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-32 truncate" title={reservation.programType}>
                      {reservation.programType}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reservation.startDate).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reservation.endDate).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {reservation.participants}명
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₩{reservation.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {reservation.status === 'confirmed' ? '확정' :
                       reservation.status === 'pending' ? '대기' : 
                       reservation.status === 'cancelled' ? '취소' : '완료'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(reservation)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      상세보기
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 예약 상세 정보 모달 */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>예약 상세 정보 - {selectedReservation?.id}</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">예약번호</Label>
                    <p className="text-lg font-semibold">{selectedReservation.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">예약자명</Label>
                    <p className="text-lg">{selectedReservation.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">연락처</Label>
                    <p className="text-lg">{selectedReservation.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">이메일</Label>
                    <p className="text-lg">{selectedReservation.email || '미입력'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">프로그램</Label>
                    <p className="text-lg">{selectedReservation.programType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">예약 경로</Label>
                    <p className="text-lg">{selectedReservation.referrer || '웹사이트'}</p>
                  </div>
                </div>
              </div>

              {/* 숙박 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">숙박 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">체크인</Label>
                    <p className="text-lg">{selectedReservation.startDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">체크아웃</Label>
                    <p className="text-lg">{selectedReservation.endDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">총 인원</Label>
                    <p className="text-lg">{selectedReservation.participants}명</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">인원 구성</Label>
                    <p className="text-lg">
                      성인 {selectedReservation.adults || 0}명, 아동 {selectedReservation.children || 0}명
                    </p>
                  </div>
                </div>
              </div>

              {/* 결제 및 상태 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">결제 및 상태</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">총 금액</Label>
                    <p className="text-xl font-bold text-green-600">{selectedReservation.totalPrice.toLocaleString()}원</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">예약 상태</Label>
                    <Badge variant={getStatusInfo(selectedReservation.status).variant} className="text-sm">
                      {getStatusInfo(selectedReservation.status).text}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">결제 상태</Label>
                    <Badge variant={getPaymentStatusInfo(selectedReservation.paymentStatus).variant} className="text-sm">
                      {getPaymentStatusInfo(selectedReservation.paymentStatus).text}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">예약일시</Label>
                    <p className="text-sm text-gray-600">{selectedReservation.createdAt ? new Date(selectedReservation.createdAt).toLocaleString('ko-KR') : '정보 없음'}</p>
                  </div>
                  {selectedReservation.confirmedDate && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">확정일시</Label>
                      <p className="text-sm text-gray-600">{selectedReservation.confirmedDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 특별 요청사항 */}
              {selectedReservation.specialRequests && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-600">특별 요청사항</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedReservation.specialRequests}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                >
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 