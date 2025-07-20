"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Users, UtensilsCrossed, CreditCard } from 'lucide-react'
import RoomSelector from '@/components/reservation/RoomSelector'
import OptionsSelector from '@/components/reservation/OptionsSelector'
import ReservationSummary from '@/components/reservation/ReservationSummary'
import { useReservationStore } from '@/store/useReservationStore'
import { useAnalytics } from '@/hooks/use-analytics'
import { useReservationAnalytics } from '@/hooks/use-reservation-analytics'
import AnalyticsDebugPanel from '@/components/analytics/AnalyticsDebugPanel'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function BookingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { 
    roomType, 
    startDate, 
    endDate, 
    adults, 
    children, 
    totalPrice,
    selectedPrograms,
    options
  } = useReservationStore()
  
  const { 
    isInitialized,
    trackPageView,
    trackEvent,
    trackReservationStart,
    trackReservationComplete 
  } = useAnalytics()

  // 예약 스토어와 analytics 연결
  useReservationAnalytics()

  const steps = [
    { id: 1, name: '객실 선택', icon: Calendar },
    { id: 2, name: '인원 & 옵션', icon: Users },
    { id: 3, name: '프로그램 선택', icon: UtensilsCrossed },
    { id: 4, name: '결제 정보', icon: CreditCard }
  ]

  // 페이지 뷰 추적
  useEffect(() => {
    if (isInitialized) {
      trackPageView('/booking', { 
        page_type: 'reservation_flow',
        step: currentStep,
        utm_source: new URLSearchParams(window.location.search).get('utm_source')
      })
    }
  }, [isInitialized, trackPageView])

  // 단계 변경시 추적
  useEffect(() => {
    if (isInitialized && currentStep > 1) {
      trackEvent({
        event_type: 'reservation_start',
        conversion_funnel_step: currentStep + 1, // 단계별 맞춤 조정
        room_id: roomType ? `room-${roomType}` : undefined,
        check_in_date: startDate?.toISOString().split('T')[0],
        check_out_date: endDate?.toISOString().split('T')[0],
        adults_count: adults,
        children_count: children,
        estimated_total_price: totalPrice,
        metadata: {
          step_name: steps[currentStep - 1]?.name,
          options_selected: Object.keys(options).filter(key => options[key as keyof typeof options]),
          programs_count: selectedPrograms.length
        }
      })
    }
  }, [currentStep, isInitialized, trackEvent, roomType, startDate, endDate, adults, children, totalPrice, options, selectedPrograms])

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2: return roomType && startDate && endDate
      case 3: return roomType && startDate && endDate && adults >= 1
      case 4: return roomType && startDate && endDate && adults >= 1
      default: return true
    }
  }

  const handleStepChange = (newStep: number) => {
    if (!canProceedToStep(newStep)) {
      toast.error('이전 단계를 먼저 완료해주세요.')
      return
    }

    // 단계 변경 추적
    if (isInitialized) {
      trackEvent({
        event_type: 'reservation_start',
        conversion_funnel_step: newStep + 1,
        room_id: roomType ? `room-${roomType}` : undefined,
        metadata: {
          step_transition: `${currentStep}_to_${newStep}`,
          step_name: steps[newStep - 1]?.name
        }
      })
    }

    setCurrentStep(newStep)
  }

  const handleReservationSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // 예약 시작 추적
      if (isInitialized) {
        await trackReservationStart(
          roomType ? `room-${roomType}` : 'unknown',
          startDate?.toISOString().split('T')[0] || '',
          endDate?.toISOString().split('T')[0] || '',
          adults,
          children,
          selectedPrograms.map(p => p.id),
          totalPrice
        )
      }

      // 예약 생성 API 호출
      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomType,
          checkInDate: startDate?.toISOString().split('T')[0],
          checkOutDate: endDate?.toISOString().split('T')[0],
          adults,
          children,
          totalPrice,
          selectedPrograms,
          options,
          // 추가 옵션들도 포함
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // 예약 완료 추적
        if (isInitialized) {
          await trackReservationComplete(
            result.reservation.id,
            totalPrice,
            {
              reservation_number: result.reservationNumber,
              room_type: roomType,
              programs_selected: selectedPrograms.length,
              completion_time_minutes: Math.round((Date.now() - performance.timeOrigin) / 60000)
            }
          )
        }
        
        toast.success('예약이 완료되었습니다!')
        router.push(`/booking/complete?id=${result.reservation.id}`)
      } else {
        throw new Error(result.error || '예약 실패')
      }
    } catch (error) {
      console.error('예약 오류:', error)
      
      // 예약 실패 추적
      if (isInitialized) {
        trackEvent({
          event_type: 'booking_abandon',
          conversion_funnel_step: 5,
          attempt_status: 'failed',
          room_id: roomType ? `room-${roomType}` : undefined,
          estimated_total_price: totalPrice,
          metadata: {
            error_message: error instanceof Error ? error.message : 'Unknown error',
            step_failed: 'submission'
          }
        })
      }
      
      toast.error('예약 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-primary' : 'text-gray-600'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {currentStep === 1 && '객실을 선택해주세요'}
                  {currentStep === 2 && '인원과 옵션을 선택해주세요'}
                  {currentStep === 3 && '프로그램을 선택해주세요'}
                  {currentStep === 4 && '예약 정보를 확인해주세요'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={currentStep.toString()} className="w-full">
                  <TabsContent value="1" className="mt-6">
                    <RoomSelector />
                  </TabsContent>
                  
                  <TabsContent value="2" className="mt-6">
                    <OptionsSelector />
                  </TabsContent>
                  
                  <TabsContent value="3" className="mt-6">
                    <ProgramSelector />
                  </TabsContent>
                  
                  <TabsContent value="4" className="mt-6">
                    <ReservationConfirmation />
                  </TabsContent>
                </Tabs>

                {/* 네비게이션 버튼 */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    이전
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button
                      onClick={() => handleStepChange(currentStep + 1)}
                      disabled={!canProceedToStep(currentStep + 1)}
                    >
                      다음
                    </Button>
                  ) : (
                    <Button
                      onClick={handleReservationSubmit}
                      disabled={isSubmitting}
                      className="bg-primary"
                    >
                      {isSubmitting ? '예약 처리중...' : '예약 완료'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 예약 요약 사이드바 */}
          <div className="lg:col-span-1">
            <ReservationSummary />
          </div>
        </div>
      </div>
    </div>
  )
}

// 프로그램 선택 컴포넌트 (별도 구현 필요)
function ProgramSelector() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">부가 프로그램 선택</h3>
        <p className="text-muted-foreground">
          원하시는 부가 프로그램을 선택해주세요 (선택사항)
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* 프로그램 리스트 */}
        <Card className="cursor-pointer hover:border-primary">
          <CardContent className="p-4">
            <h4 className="font-medium">바비큐 프로그램</h4>
            <p className="text-sm text-muted-foreground mt-1">
              야외에서 즐기는 바비큐 체험
            </p>
            <p className="font-semibold mt-2">15,000원/인</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:border-primary">
          <CardContent className="p-4">
            <h4 className="font-medium">농장 체험</h4>
            <p className="text-sm text-muted-foreground mt-1">
              자연과 함께하는 농장 체험
            </p>
            <p className="font-semibold mt-2">20,000원/인</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// 예약 확인 컴포넌트
function ReservationConfirmation() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">예약 정보 확인</h3>
        <p className="text-muted-foreground">
          예약 정보를 확인하고 결제를 진행해주세요
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">예약 정보</h4>
              <div className="text-sm space-y-1">
                <p>체크인: 2024년 1월 15일</p>
                <p>체크아웃: 2024년 1월 16일</p>
                <p>객실: 디럭스 룸</p>
                <p>인원: 성인 2명</p>
              </div>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">선택한 옵션</h4>
              <div className="text-sm space-y-1">
                <p>조식: 2인분</p>
                <p>바비큐 세트: 기본형</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="font-medium">총 결제 금액</span>
                <span className="text-xl font-bold text-primary">
                  320,000원
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Analytics Debug Panel (개발 환경에서만 표시) */}
      <AnalyticsDebugPanel />
    </div>
  )
} 