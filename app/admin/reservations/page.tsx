"use client"

import { useState, useEffect } from 'react'
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
  createdAt?: string
  adults?: number
  children?: number
  bbq?: {
    grillCount?: number
    meatSetCount?: number
    fullSetCount?: number
  }
  meal?: {
    breakfastCount?: number
  }
  transport?: {
    needsBus?: boolean
  }
  experience?: {
    farmExperienceCount?: number
  }
  extra?: {
    laundryCount?: number
  }
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

export default function ReservationsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [liveReservations, setLiveReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')

  // 실시간 예약 데이터 불러오기
  const fetchLiveReservations = async () => {
    setIsLoading(true)
    try {
      console.log('예약 데이터 요청 시작...')
      const response = await fetch('/api/reservations/create', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('응답 상태:', response.status)
      console.log('응답 헤더:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 오류 응답:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('받은 데이터:', data)
      console.log('데이터 타입:', typeof data)
      console.log('success 필드:', data.success)
      console.log('reservations 배열:', data.reservations)
      
      if (data.success && Array.isArray(data.reservations)) {
        console.log('실시간 예약 수:', data.reservations.length)
        console.log('첫 번째 예약 데이터:', data.reservations[0])
        setLiveReservations(data.reservations)
      } else {
        console.error('API 응답 형식 오류:', data)
        console.error('success:', data.success)
        console.error('reservations 타입:', typeof data.reservations)
        // 빈 배열로 설정
        setLiveReservations([])
      }
    } catch (error) {
      console.error('예약 데이터 불러오기 실패:', error)
      console.error('오류 상세:', error instanceof Error ? error.message : String(error))
      // 오류 발생 시 빈 배열로 설정
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

  // 예약 상태 변경 함수
  const handleStatusChange = async (reservationId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    setSaveStatus('saving')
    setSaveMessage('예약 상태를 업데이트 중입니다...')
    
    try {
      // 현재 예약 정보 가져오기
      const currentReservation = [...reservations, ...liveReservations].find(r => r.id === reservationId)
      
      // 예약 상태에 따른 결제 상태 자동 설정
      let autoPaymentStatus: 'pending' | 'partial' | 'completed'
      
      switch (newStatus) {
        case 'confirmed':
          // 확정 시: 기존 결제 상태가 'pending'이면 'partial'로, 나머지는 유지
          autoPaymentStatus = currentReservation?.paymentStatus === 'pending' ? 'partial' : (currentReservation?.paymentStatus || 'partial')
          break
        case 'completed':
          // 완료 시: 무조건 결제 완료로 설정
          autoPaymentStatus = 'completed'
          break
        case 'cancelled':
          // 취소 시: 무조건 미결제로 설정
          autoPaymentStatus = 'pending'
          break
        default:
          // 대기중으로 변경 시: 기존 결제 상태 유지
          autoPaymentStatus = currentReservation?.paymentStatus || 'pending'
      }

      // API 호출로 서버에 저장
      const response = await fetch('/api/reservations/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          status: newStatus,
          paymentStatus: autoPaymentStatus,
          confirmedDate: newStatus === 'confirmed' ? new Date().toISOString().split('T')[0] : undefined
        })
      })

      if (response.ok) {
        // 실시간 예약 데이터 업데이트
        setLiveReservations(prev => 
          prev.map(reservation => 
            reservation.id === reservationId 
              ? { 
                  ...reservation, 
                  status: newStatus,
                  paymentStatus: autoPaymentStatus,
                  confirmedDate: newStatus === 'confirmed' ? new Date().toISOString().split('T')[0] : reservation.confirmedDate
                }
              : reservation
          )
        )
        
        // 성공 메시지
        const statusText = {
          'pending': '대기중',
          'confirmed': '확정',
          'cancelled': '취소',
          'completed': '완료'
        }[newStatus]
        
        const paymentText = {
          'pending': '미결제',
          'partial': '부분결제',
          'completed': '결제완료'
        }[autoPaymentStatus]
        
        // 상태 변경 알림 (더 상세한 정보 포함)
        const changeMessage = newStatus === currentReservation?.status 
          ? `예약 상태는 동일하게 유지되었습니다.`
          : `예약 상태가 '${statusText}'로 변경되었습니다.`
        
        const paymentMessage = autoPaymentStatus === currentReservation?.paymentStatus
          ? `결제 상태는 '${paymentText}'로 유지되었습니다.`
          : `결제 상태도 '${paymentText}'로 자동 업데이트되었습니다.`
        
        setSaveStatus('success')
        setSaveMessage(`${changeMessage} ${paymentMessage}`)
        
        // 3초 후 상태 초기화
        setTimeout(() => {
          setSaveStatus('idle')
          setSaveMessage('')
        }, 3000)
        
        alert(`✅ ${changeMessage}\n💳 ${paymentMessage}\n📝 서버에 성공적으로 저장되었습니다.`)
      } else {
        throw new Error('서버 저장 실패')
      }
      
    } catch (error) {
      console.error('상태 변경 오류:', error)
      setSaveStatus('error')
      setSaveMessage('서버 저장 실패 - 로컬에서만 변경됨')
      
      // 3초 후 상태 초기화
      setTimeout(() => {
        setSaveStatus('idle')
        setSaveMessage('')
      }, 3000)
      
      alert('❌ 상태 변경 중 오류가 발생했습니다.\n로컬에서만 변경되었으며 서버 저장이 실패했습니다.')
      
      // 로컬 상태만 업데이트 (백업용)
      setLiveReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { 
                ...reservation, 
                status: newStatus,
                confirmedDate: newStatus === 'confirmed' ? new Date().toISOString().split('T')[0] : reservation.confirmedDate
              }
            : reservation
        )
      )
    }
  }

  // 결제 상태 변경 함수
  const handlePaymentStatusChange = async (reservationId: string, newPaymentStatus: 'pending' | 'partial' | 'completed') => {
    try {
      // API 호출로 서버에 저장
      const response = await fetch('/api/reservations/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          paymentStatus: newPaymentStatus
        })
      })

      if (response.ok) {
        // 실시간 예약 데이터 업데이트
        setLiveReservations(prev => 
          prev.map(reservation => 
            reservation.id === reservationId 
              ? { ...reservation, paymentStatus: newPaymentStatus }
              : reservation
          )
        )
        
        // 성공 메시지
        const paymentText = {
          'pending': '미결제',
          'partial': '부분결제',
          'completed': '완료'
        }[newPaymentStatus]
        
        alert(`✅ 결제 상태가 '${paymentText}'로 변경되고 서버에 저장되었습니다.`)
      } else {
        throw new Error('서버 저장 실패')
      }
      
    } catch (error) {
      console.error('결제 상태 변경 오류:', error)
      alert('❌ 결제 상태 변경 중 오류가 발생했습니다.\n로컬에서만 변경되었으며 서버 저장이 실패했습니다.')
      
      // 로컬 상태만 업데이트 (백업용)
      setLiveReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, paymentStatus: newPaymentStatus }
            : reservation
        )
      )
    }
  }

  // 예약 수정 함수
  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation({ ...reservation })
    setShowEditModal(true)
  }

  // 예약 수정 저장 함수
  const handleSaveEdit = async () => {
    if (!editingReservation) return
    
    try {
      // API 호출로 서버에 저장
      const response = await fetch('/api/reservations/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: editingReservation.id,
          ...editingReservation,
          updatedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        // 실시간 예약 데이터 업데이트
        setLiveReservations(prev => 
          prev.map(reservation => 
            reservation.id === editingReservation.id 
              ? editingReservation
              : reservation
          )
        )
        
        setShowEditModal(false)
        setEditingReservation(null)
        alert('✅ 예약 정보가 수정되고 서버에 저장되었습니다.')
      } else {
        throw new Error('서버 저장 실패')
      }
      
    } catch (error) {
      console.error('예약 수정 오류:', error)
      alert('❌ 예약 수정 중 오류가 발생했습니다.\n로컬에서만 변경되었으며 서버 저장이 실패했습니다.')
      
      // 로컬 상태만 업데이트 (백업용)
      setLiveReservations(prev => 
        prev.map(reservation => 
          reservation.id === editingReservation.id 
            ? editingReservation
            : reservation
        )
      )
      
      setShowEditModal(false)
      setEditingReservation(null)
    }
  }

  // 숙박 일수 계산 함수
  const calculateStayDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '-'
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // 날짜 차이 계산 (밀리초 단위)
    const timeDiff = end.getTime() - start.getTime()
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (dayDiff <= 0) return '당일'
    if (dayDiff === 1) return '1박 2일'
    
    return `${dayDiff}박 ${dayDiff + 1}일`
  }

  // 기존 샘플 데이터와 실시간 데이터 합치기
  const allReservations = [...reservations, ...liveReservations]

  // 필터링된 예약 목록 (최신순 정렬)
  const filteredReservations = allReservations.filter(reservation => {
    const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.programType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter
    
    // 날짜 필터링 (특정 날짜 선택 시)
    const matchesDate = !selectedDate || 
                       new Date(reservation.startDate).toDateString() === selectedDate.toDateString()
    
    // 년도/월 필터링 (시작일 기준)
    const reservationDate = new Date(reservation.startDate)
    const matchesYear = selectedYear === 'all' || reservationDate.getFullYear().toString() === selectedYear
    const matchesMonth = selectedMonth === 'all' || (reservationDate.getMonth() + 1).toString().padStart(2, '0') === selectedMonth
    
    return matchesSearch && matchesStatus && matchesDate && matchesYear && matchesMonth
  }).sort((a, b) => {
    // 최신순 정렬 (createdAt이 있으면 그것으로, 없으면 예약번호로)
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    
    // createdAt이 없는 경우 예약번호로 역순 정렬 (높은 번호가 위에)
    const aId = a.id.replace(/\D/g, '') // 숫자만 추출
    const bId = b.id.replace(/\D/g, '') // 숫자만 추출
    return parseInt(bId) - parseInt(aId)
  })

  // 통계 계산 - 선택된 날짜에 따라 동적 계산
  const getStatistics = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // 지난달, 이번달, 다음달 매출 계산
    const lastMonthRevenue = allReservations
      .filter(r => {
        const reservationDate = new Date(r.startDate)
        return reservationDate.getMonth() === (currentMonth - 1 + 12) % 12 && 
               reservationDate.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear) &&
               (r.status === 'confirmed' || r.status === 'completed')
      })
      .reduce((sum, r) => sum + r.totalPrice, 0)

    const thisMonthRevenue = allReservations
      .filter(r => {
        const reservationDate = new Date(r.startDate)
        return reservationDate.getMonth() === currentMonth && 
               reservationDate.getFullYear() === currentYear &&
               (r.status === 'confirmed' || r.status === 'completed')
      })
      .reduce((sum, r) => sum + r.totalPrice, 0)

    const nextMonthRevenue = allReservations
      .filter(r => {
        const reservationDate = new Date(r.startDate)
        return reservationDate.getMonth() === (currentMonth + 1) % 12 && 
               reservationDate.getFullYear() === (currentMonth === 11 ? currentYear + 1 : currentYear) &&
               (r.status === 'confirmed' || r.status === 'completed')
      })
      .reduce((sum, r) => sum + r.totalPrice, 0)

    // 평균 예약 금액 계산
    const confirmedReservations = allReservations.filter(r => r.status === 'confirmed' || r.status === 'completed')
    const averageReservationAmount = confirmedReservations.length > 0 ? 
      Math.round(confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0) / confirmedReservations.length) : 0

    // 인기 프로그램 계산
    const programCounts = allReservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((acc, r) => {
        acc[r.programType] = (acc[r.programType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    
    const popularProgram = Object.entries(programCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '데이터 없음'

    if (selectedDate || selectedYear !== 'all' || selectedMonth !== 'all') {
      // 필터된 예약들의 통계
      const filteredStats = filteredReservations
      
      const filteredRevenue = filteredStats
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((sum, r) => sum + r.totalPrice, 0)
      
      let filterDescription = ''
      if (selectedDate) {
        filterDescription = format(selectedDate, 'MM월 dd일', { locale: ko })
      } else if (selectedYear !== 'all' && selectedMonth !== 'all') {
        filterDescription = `${selectedYear}년 ${parseInt(selectedMonth)}월`
      } else if (selectedYear !== 'all') {
        filterDescription = `${selectedYear}년`
      } else if (selectedMonth !== 'all') {
        filterDescription = `${parseInt(selectedMonth)}월`
      }
      
      return {
        todayReservations: filteredStats.length,
        thisMonthReservations: filteredStats.length,
        totalRevenue: filteredRevenue,
        totalReservations: filteredStats.length,
        cancelledReservations: filteredStats.filter(r => r.status === 'cancelled').length,
        isDateSelected: true,
        selectedDateString: filterDescription,
        lastMonthRevenue,
        thisMonthRevenue,
        nextMonthRevenue,
        averageReservationAmount,
        popularProgram
      }
    } else {
      // 전체 통계
      const todayReservations = allReservations.filter(r => 
        new Date(r.startDate).toDateString() === new Date().toDateString()
      ).length

      const thisMonthReservations = allReservations.filter(r => {
        const reservationDate = new Date(r.startDate)
        return reservationDate.getMonth() === currentMonth && 
               reservationDate.getFullYear() === currentYear
      }).length

      const totalRevenue = allReservations
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((sum, r) => sum + r.totalPrice, 0)

      const cancelledReservations = allReservations.filter(r => r.status === 'cancelled').length

      return {
        todayReservations,
        thisMonthReservations,
        totalRevenue,
        totalReservations: allReservations.length,
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchLiveReservations}
            disabled={isLoading}
          >
            {isLoading ? '새로고침 중...' : '실시간 새로고침'}
          </Button>
          <Button>새 예약 추가</Button>
        </div>
      </div>

      {/* 저장 상태 알림 바 */}
      {saveStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border ${
          saveStatus === 'saving' ? 'bg-blue-50 border-blue-200 text-blue-800' :
          saveStatus === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800"></div>
            )}
            {saveStatus === 'success' && <span>✅</span>}
            {saveStatus === 'error' && <span>❌</span>}
            <span className="font-medium">{saveMessage}</span>
          </div>
        </div>
      )}

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
            
            <div className="space-y-2">
              <Label>년도별 검색 (시작일 기준)</Label>
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="년도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="2024">2024년</SelectItem>
                  <SelectItem value="2025">2025년</SelectItem>
                  <SelectItem value="2026">2026년</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>월별 검색 (시작일 기준)</Label>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger>
                  <SelectValue placeholder="월 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="01">1월</SelectItem>
                  <SelectItem value="02">2월</SelectItem>
                  <SelectItem value="03">3월</SelectItem>
                  <SelectItem value="04">4월</SelectItem>
                  <SelectItem value="05">5월</SelectItem>
                  <SelectItem value="06">6월</SelectItem>
                  <SelectItem value="07">7월</SelectItem>
                  <SelectItem value="08">8월</SelectItem>
                  <SelectItem value="09">9월</SelectItem>
                  <SelectItem value="10">10월</SelectItem>
                  <SelectItem value="11">11월</SelectItem>
                  <SelectItem value="12">12월</SelectItem>
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
                setSelectedYear('all')
                setSelectedMonth('all')
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
          <CardTitle>
            예약 목록 ({filteredReservations.length}건)
            {liveReservations.length > 0 && (
              <span className="ml-2 text-sm text-green-600 font-normal">
                • 실시간 예약 {liveReservations.length}건 포함
              </span>
            )}
          </CardTitle>
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
                      <Select
                        value={reservation.status}
                        onValueChange={(value: 'pending' | 'confirmed' | 'cancelled' | 'completed') => 
                          handleStatusChange(reservation.id, value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <Badge variant={statusInfo.variant} className="border-0">
                            {statusInfo.text}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기중</SelectItem>
                          <SelectItem value="confirmed">확정</SelectItem>
                          <SelectItem value="cancelled">취소</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={reservation.paymentStatus}
                        onValueChange={(value: 'pending' | 'partial' | 'completed') => 
                          handlePaymentStatusChange(reservation.id, value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <Badge variant={paymentInfo.variant} className="border-0">
                            {paymentInfo.text}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">미결제</SelectItem>
                          <SelectItem value="partial">부분결제</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">상세보기</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>예약 상세 정보 - {reservation.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* 기본 정보 */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3 text-blue-600">기본 정보</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">예약번호</Label>
                                  <p className="text-lg font-semibold">{reservation.id}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">예약자명</Label>
                                  <p className="text-lg">{reservation.customerName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">연락처</Label>
                                  <p className="text-lg">{reservation.phone}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">이메일</Label>
                                  <p className="text-lg">{reservation.email || '미입력'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">프로그램</Label>
                                  <p className="text-lg">{reservation.programType}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">예약 경로</Label>
                                  <p className="text-lg">{reservation.referrer || '웹사이트'}</p>
                                </div>
                              </div>
                            </div>

                            {/* 숙박 정보 */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3 text-green-600">숙박 정보</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">체크인</Label>
                                  <p className="text-lg">{reservation.startDate}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">체크아웃</Label>
                                  <p className="text-lg">{reservation.endDate}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">총 인원</Label>
                                  <p className="text-lg">{reservation.participants}명</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">인원 구성</Label>
                                  <p className="text-lg">
                                    성인 {reservation.adults || 0}명, 아동 {reservation.children || 0}명
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* 추가 서비스 */}
                            {(reservation.bbq || reservation.meal || reservation.transport || reservation.experience || reservation.extra) && (
                              <div>
                                <h3 className="text-lg font-semibold mb-3 text-purple-600">추가 서비스</h3>
                                <div className="grid grid-cols-1 gap-3">
                                  {/* BBQ 서비스 */}
                                  {reservation.bbq && ((reservation.bbq.grillCount || 0) > 0 || (reservation.bbq.meatSetCount || 0) > 0 || (reservation.bbq.fullSetCount || 0) > 0) && (
                                    <div className="bg-orange-50 p-3 rounded-md">
                                      <Label className="text-sm font-medium text-orange-700">BBQ 서비스</Label>
                                      <div className="mt-1 space-y-1">
                                        {(reservation.bbq.grillCount || 0) > 0 && (
                                          <p className="text-sm">• 그릴 대여: {reservation.bbq.grillCount}개</p>
                                        )}
                                        {(reservation.bbq.meatSetCount || 0) > 0 && (
                                          <p className="text-sm">• 고기세트: {reservation.bbq.meatSetCount}인분</p>
                                        )}
                                        {(reservation.bbq.fullSetCount || 0) > 0 && (
                                          <p className="text-sm">• 풀세트: {reservation.bbq.fullSetCount}인분</p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* 식사 서비스 */}
                                  {reservation.meal && (reservation.meal.breakfastCount || 0) > 0 && (
                                    <div className="bg-green-50 p-3 rounded-md">
                                      <Label className="text-sm font-medium text-green-700">식사 서비스</Label>
                                      <p className="text-sm mt-1">• 조식: {reservation.meal.breakfastCount}인분</p>
                                    </div>
                                  )}

                                  {/* 교통 서비스 */}
                                  {reservation.transport && reservation.transport.needsBus && (
                                    <div className="bg-blue-50 p-3 rounded-md">
                                      <Label className="text-sm font-medium text-blue-700">교통 서비스</Label>
                                      <p className="text-sm mt-1">• 버스 렌트 신청</p>
                                    </div>
                                  )}

                                  {/* 체험 서비스 */}
                                  {reservation.experience && (reservation.experience.farmExperienceCount || 0) > 0 && (
                                    <div className="bg-yellow-50 p-3 rounded-md">
                                      <Label className="text-sm font-medium text-yellow-700">체험 서비스</Label>
                                      <p className="text-sm mt-1">• 목공체험: {reservation.experience.farmExperienceCount}명</p>
                                    </div>
                                  )}

                                  {/* 기타 서비스 */}
                                  {reservation.extra && (reservation.extra.laundryCount || 0) > 0 && (
                                    <div className="bg-gray-50 p-3 rounded-md">
                                      <Label className="text-sm font-medium text-gray-700">기타 서비스</Label>
                                      <p className="text-sm mt-1">• 버스대절: {reservation.extra.laundryCount}대</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 결제 및 상태 정보 */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3 text-red-600">결제 및 상태</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">총 금액</Label>
                                  <p className="text-xl font-bold text-green-600">{reservation.totalPrice.toLocaleString()}원</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">예약 상태</Label>
                                  <Badge variant={statusInfo.variant} className="text-sm">
                                    {statusInfo.text}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">결제 상태</Label>
                                  <Badge variant={paymentInfo.variant} className="text-sm">
                                    {paymentInfo.text}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">예약일시</Label>
                                  <p className="text-sm text-gray-600">{reservation.createdAt ? new Date(reservation.createdAt).toLocaleString('ko-KR') : '정보 없음'}</p>
                                </div>
                                {reservation.confirmedDate && (
                                  <div>
                                    <Label className="text-sm font-medium text-gray-500">확정일시</Label>
                                    <p className="text-sm text-gray-600">{reservation.confirmedDate}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 특별 요청사항 */}
                            {reservation.specialRequests && (
                              <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-600">특별 요청사항</h3>
                                <div className="bg-gray-50 p-4 rounded-md">
                                  <p className="text-sm whitespace-pre-wrap">{reservation.specialRequests}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4 border-t">
                              <Button 
                                variant="outline"
                                onClick={() => handleEditReservation(reservation)}
                              >
                                예약 수정
                              </Button>
                              
                              {reservation.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    className="text-red-600"
                                    onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                                  >
                                    예약 취소
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                                  >
                                    예약 확정
                                  </Button>
                                </>
                              )}
                              {reservation.status === 'confirmed' && (
                                <Button
                                  onClick={() => handleStatusChange(reservation.id, 'completed')}
                                >
                                  완료 처리
                                </Button>
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

      {/* 예약 수정 모달 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>예약 수정 - {editingReservation?.id}</DialogTitle>
          </DialogHeader>
          {editingReservation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">예약자명</Label>
                  <Input
                    id="edit-name"
                    value={editingReservation.customerName}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      customerName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">연락처</Label>
                  <Input
                    id="edit-phone"
                    value={editingReservation.phone}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      phone: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">이메일</Label>
                  <Input
                    id="edit-email"
                    value={editingReservation.email}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      email: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-participants">참가인원</Label>
                  <Input
                    id="edit-participants"
                    type="number"
                    value={editingReservation.participants}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      participants: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-program">프로그램</Label>
                  <Input
                    id="edit-program"
                    value={editingReservation.programType}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      programType: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">총 금액</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingReservation.totalPrice}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      totalPrice: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-start">시작일</Label>
                  <Input
                    id="edit-start"
                    type="date"
                    value={editingReservation.startDate}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      startDate: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end">종료일</Label>
                  <Input
                    id="edit-end"
                    type="date"
                    value={editingReservation.endDate}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      endDate: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-referrer">추천인</Label>
                  <Input
                    id="edit-referrer"
                    value={editingReservation.referrer || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      referrer: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">예약 상태</Label>
                  <Select
                    value={editingReservation.status}
                    onValueChange={(value: 'pending' | 'confirmed' | 'cancelled' | 'completed') => 
                      setEditingReservation({
                        ...editingReservation,
                        status: value,
                        confirmedDate: value === 'confirmed' ? new Date().toISOString().split('T')[0] : editingReservation.confirmedDate
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">대기중</SelectItem>
                      <SelectItem value="confirmed">확정</SelectItem>
                      <SelectItem value="cancelled">취소</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-payment">결제 상태</Label>
                  <Select
                    value={editingReservation.paymentStatus}
                    onValueChange={(value: 'pending' | 'partial' | 'completed') => 
                      setEditingReservation({
                        ...editingReservation,
                        paymentStatus: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">미결제</SelectItem>
                      <SelectItem value="partial">부분결제</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editingReservation.confirmedDate && (
                  <div>
                    <Label htmlFor="edit-confirmed">예약확정일</Label>
                    <Input
                      id="edit-confirmed"
                      type="date"
                      value={editingReservation.confirmedDate}
                      onChange={(e) => setEditingReservation({
                        ...editingReservation,
                        confirmedDate: e.target.value
                      })}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="edit-requests">특별 요청사항</Label>
                <textarea
                  id="edit-requests"
                  className="w-full p-3 border rounded-md resize-none"
                  rows={3}
                  value={editingReservation.specialRequests || ''}
                  onChange={(e) => setEditingReservation({
                    ...editingReservation,
                    specialRequests: e.target.value
                  })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingReservation(null)
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleSaveEdit}>
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 