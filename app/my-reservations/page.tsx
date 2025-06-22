"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { Calendar, Clock, MapPin, Users, Phone, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Reservation {
  id: string
  check_in_date: string
  check_out_date: string
  guest_count: number
  room_type: string
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  guest_name: string
  guest_phone: string
  guest_email: string
  special_requests?: string
  bbq_option?: boolean
  meal_option?: string
  transportation_service?: boolean
  experience_programs?: string[]
  additional_services?: string[]
  created_at: string
}

export default function MyReservationsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchReservations()
    }
  }, [user, loading, router])

  const fetchReservations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reservations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('예약 정보를 불러오는데 실패했습니다.')
      }

      const data = await response.json()
      // 사용자 이메일로 필터링
      const userReservations = data.filter((reservation: Reservation) => 
        reservation.guest_email === user?.email
      )
      setReservations(userReservations)
    } catch (error: any) {
      console.error('예약 조회 오류:', error)
      setError('예약 정보를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">대기중</Badge>
      case 'confirmed':
        return <Badge variant="default" className="bg-green-600">확정</Badge>
      case 'cancelled':
        return <Badge variant="destructive">취소됨</Badge>
      case 'completed':
        return <Badge variant="secondary">완료</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    프로필로 돌아가기
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">내 예약</h1>
              <p className="text-gray-600 mt-2">예약 내역을 확인하고 관리하세요</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">총 예약</p>
              <p className="text-2xl font-bold text-blue-600">{reservations.length}건</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {reservations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">예약 내역이 없습니다</h3>
              <p className="text-gray-600 mb-6">아직 예약하신 내역이 없습니다. 지금 예약해보세요!</p>
              <Link href="/">
                <Button>
                  예약하러 가기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        예약 #{reservation.id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        예약일: {formatDate(reservation.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 기본 예약 정보 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 mb-3">예약 정보</h4>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">체크인 - 체크아웃</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(reservation.check_in_date)} - {formatDate(reservation.check_out_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">인원 수</p>
                          <p className="text-sm text-gray-600">{reservation.guest_count}명</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">객실 타입</p>
                          <p className="text-sm text-gray-600">{reservation.room_type}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <span className="text-lg">💰</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">총 금액</p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatPrice(reservation.total_price)}원
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 연락처 및 추가 서비스 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 mb-3">연락처 정보</h4>
                      
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">예약자명</p>
                          <p className="text-sm text-gray-600">{reservation.guest_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">전화번호</p>
                          <p className="text-sm text-gray-600">{reservation.guest_phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">이메일</p>
                          <p className="text-sm text-gray-600">{reservation.guest_email}</p>
                        </div>
                      </div>

                      {/* 추가 서비스 */}
                      {(reservation.bbq_option || reservation.meal_option || reservation.transportation_service || 
                        reservation.experience_programs?.length || reservation.additional_services?.length) && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium text-gray-900 mb-2">추가 서비스</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            {reservation.bbq_option && <p>• BBQ 서비스</p>}
                            {reservation.meal_option && <p>• 식사 옵션: {reservation.meal_option}</p>}
                            {reservation.transportation_service && <p>• 교통 서비스</p>}
                            {reservation.experience_programs?.map((program, index) => (
                              <p key={index}>• 체험 프로그램: {program}</p>
                            ))}
                            {reservation.additional_services?.map((service, index) => (
                              <p key={index}>• 추가 서비스: {service}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {reservation.special_requests && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium text-gray-900 mb-2">특별 요청사항</h5>
                          <p className="text-sm text-gray-600">{reservation.special_requests}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                    {reservation.status === 'pending' && (
                      <Button variant="outline" size="sm">
                        예약 수정
                      </Button>
                    )}
                    {reservation.status === 'confirmed' && (
                      <Button variant="outline" size="sm">
                        예약 상세
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      영수증 다운로드
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 