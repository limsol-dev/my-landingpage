"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CreditCard,
  Clock,
  Home,
  UtensilsCrossed
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface ReservationDetails {
  id: string
  reservation_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  total_guests: number
  room_price: number
  total_price: number
  status: string
  payment_status: string
  special_requests?: string
  created_at: string
  
  // BBQ 옵션
  bbq_grill_count: number
  bbq_meat_set_count: number
  bbq_full_set_count: number
  
  // 식사 옵션
  meal_breakfast_count: number
  
  // 교통 옵션
  transport_needs_bus: boolean
  
  // 프로그램 정보
  reservation_programs?: Array<{
    id: string
    program_id: string
    quantity: number
    unit_price: number
    total_price: number
    scheduled_date: string
    programs: {
      name: string
      description: string
    }
  }>
}

export default function BookingCompletePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reservationId = searchParams?.get('id')
  
  const [reservation, setReservation] = useState<ReservationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reservationId) {
      setError('예약 ID가 없습니다.')
      setLoading(false)
      return
    }

    fetchReservationDetails()
  }, [reservationId])

  const fetchReservationDetails = async () => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`)
      const data = await response.json()
      
      if (data.success) {
        setReservation(data.reservation)
      } else {
        setError(data.error || '예약 정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('예약 정보 조회 오류:', error)
      setError('예약 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">예약 정보를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { variant: 'default' as const, text: '예약 확정', color: 'bg-green-500' }
      case 'pending':
        return { variant: 'secondary' as const, text: '예약 대기', color: 'bg-yellow-500' }
      case 'cancelled':
        return { variant: 'destructive' as const, text: '예약 취소', color: 'bg-red-500' }
      default:
        return { variant: 'outline' as const, text: status, color: 'bg-gray-500' }
    }
  }

  const getPaymentStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'completed':
        return { variant: 'default' as const, text: '결제 완료', color: 'bg-green-500' }
      case 'pending':
        return { variant: 'secondary' as const, text: '결제 대기', color: 'bg-yellow-500' }
      case 'partial':
        return { variant: 'outline' as const, text: '부분 결제', color: 'bg-blue-500' }
      default:
        return { variant: 'destructive' as const, text: '결제 실패', color: 'bg-red-500' }
    }
  }

  const statusBadge = getStatusBadgeProps(reservation.status)
  const paymentBadge = getPaymentStatusBadgeProps(reservation.payment_status)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 성공 헤더 */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="text-green-500 mb-4">
              <CheckCircle className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold mb-2">예약이 완료되었습니다!</h1>
            <p className="text-gray-600 mb-4">
              예약번호: <span className="font-mono font-semibold">{reservation.reservation_number}</span>
            </p>
            <div className="flex justify-center gap-2">
              <Badge {...statusBadge} />
              <Badge {...paymentBadge} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 예약 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                예약 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">체크인</p>
                  <p className="font-semibold">
                    {format(new Date(reservation.check_in_date), 'PPP (eee)', { locale: ko })}
                  </p>
                  <p className="text-sm text-gray-500">15:00 이후</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">체크아웃</p>
                  <p className="font-semibold">
                    {format(new Date(reservation.check_out_date), 'PPP (eee)', { locale: ko })}
                  </p>
                  <p className="text-sm text-gray-500">11:00 이전</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span>성인 {reservation.adults}명</span>
                {reservation.children > 0 && (
                  <span>, 아동 {reservation.children}명</span>
                )}
                <span className="ml-auto text-sm text-gray-500">
                  총 {reservation.total_guests}명
                </span>
              </div>

              {reservation.special_requests && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">특별 요청사항</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">
                      {reservation.special_requests}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 고객 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                예약자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">예약자명</p>
                <p className="font-semibold">{reservation.customer_name}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{reservation.customer_phone}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{reservation.customer_email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  예약일시: {format(new Date(reservation.created_at), 'PPp', { locale: ko })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 선택 옵션 */}
          {(reservation.meal_breakfast_count > 0 || 
            reservation.bbq_grill_count > 0 || 
            reservation.transport_needs_bus ||
            reservation.reservation_programs?.length) && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5" />
                  선택한 옵션
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reservation.meal_breakfast_count > 0 && (
                  <div className="flex justify-between">
                    <span>조식</span>
                    <span>{reservation.meal_breakfast_count}인분</span>
                  </div>
                )}

                {reservation.bbq_grill_count > 0 && (
                  <div className="flex justify-between">
                    <span>BBQ 세트</span>
                    <span>
                      {reservation.bbq_meat_set_count > 0 && '기본형 '}
                      {reservation.bbq_full_set_count > 0 && '프리미엄형 '}
                      {reservation.bbq_grill_count}세트
                    </span>
                  </div>
                )}

                {reservation.transport_needs_bus && (
                  <div className="flex justify-between">
                    <span>셔틀버스 서비스</span>
                    <span>신청</span>
                  </div>
                )}

                {reservation.reservation_programs?.map((program) => (
                  <div key={program.id} className="flex justify-between">
                    <span>{program.programs.name}</span>
                    <span>{program.quantity}개</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 결제 정보 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                결제 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">총 결제 금액</span>
                <span className="font-bold text-primary">
                  {reservation.total_price.toLocaleString()}원
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                VAT 포함
              </p>
              
              {reservation.payment_status === 'pending' && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    💳 결제가 아직 완료되지 않았습니다. 
                    관리자가 확인 후 결제 안내를 드릴 예정입니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 다음 단계 안내 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>다음 단계</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Phone className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">1. 예약 확인</h3>
                <p className="text-sm text-gray-600">
                  24시간 내 관리자가 예약을 확인하고 연락드립니다.
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CreditCard className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">2. 결제 진행</h3>
                <p className="text-sm text-gray-600">
                  예약 확인 후 결제 안내를 받으시고 결제를 진행하세요.
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <MapPin className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">3. 방문 및 체크인</h3>
                <p className="text-sm text-gray-600">
                  체크인 날짜에 펜션을 방문하여 즐거운 시간을 보내세요!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button variant="outline" asChild>
            <Link href="/my-reservations">
              <FileText className="w-4 h-4 mr-2" />
              예약 내역 보기
            </Link>
          </Button>
          
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 