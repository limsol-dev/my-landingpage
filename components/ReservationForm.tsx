"use client"

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  ReservationInfo,
  PRICE_CONFIG,
  validateReservation,
  calculateTotalPrice
} from '@/types/reservation'
import { Separator } from '@/components/ui/separator'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InfoIcon } from 'lucide-react'

interface ReservationFormProps {
  onBookingClick?: () => void
}

export default function ReservationForm({ onBookingClick }: ReservationFormProps) {
  const searchParams = useSearchParams()
  const dateSelectionRef = useRef<HTMLDivElement>(null)
  const [selectedProgram, setSelectedProgram] = useState<{id: string, name: string} | null>(null)
  const [showDateError, setShowDateError] = useState(false)
  const [hasUserSelectedDates, setHasUserSelectedDates] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [reservation, setReservation] = useState<ReservationInfo>({
    checkIn: undefined,
    checkOut: undefined,
    adults: 2,
    children: 0,
    totalGuests: 2,
    bbq: {
      grillCount: 0,
      meatSetCount: 0,
      fullSetCount: 0
    },
    meal: {
      breakfastCount: 0
    },
    transport: {
      needsBus: false
    },
    experience: {
      farmExperienceCount: 0
    },
    extra: {
      laundryCount: 0
    }
  })

  const [basePrice, setBasePrice] = useState(150000) // 기본 객실 가격
  const [grillPrice, setGrillPrice] = useState(30000) // BBQ 그릴 대여 가격

  // URL 파라미터에서 프로그램 정보 읽기
  useEffect(() => {
    if (!searchParams) return
    
    const programId = searchParams.get('programId')
    const programName = searchParams.get('programName')
    
    if (programId && programName) {
      setSelectedProgram({
        id: programId,
        name: decodeURIComponent(programName)
      })
    }
  }, [searchParams])

  const handleGuestChange = (adults: number, children: number) => {
    setReservation(prev => ({
      ...prev,
      adults,
      children,
      totalGuests: adults + children
    }))
  }

  const handleBBQChange = (field: keyof typeof reservation.bbq, value: number) => {
    setReservation(prev => ({
      ...prev,
      bbq: {
        ...prev.bbq,
        [field]: value
      }
    }))
  }

  const handleMealChange = (breakfastCount: number) => {
    setReservation(prev => ({
      ...prev,
      meal: {
        ...prev.meal,
        breakfastCount
      }
    }))
  }

  const handleTransportChange = (needsBus: boolean) => {
    setReservation(prev => ({
      ...prev,
      transport: {
        ...prev.transport,
        needsBus
      }
    }))
  }

  const errors = validateReservation(reservation)
  const totalPrice = calculateTotalPrice(reservation, basePrice, grillPrice)

  const handleReservationSubmit = () => {
    // 이름과 연락처 검증
    if (!customerName.trim()) {
      alert('❌ 예약자 이름을 입력해주세요!')
      return
    }
    
    if (!customerPhone.trim()) {
      alert('❌ 연락처를 입력해주세요!')
      return
    }
    
    // 전화번호 형식 검증
    const phoneRegex = /^[0-9-+\s()]+$/
    if (!phoneRegex.test(customerPhone)) {
      alert('❌ 올바른 연락처 형식으로 입력해주세요!')
      return
    }
    
    // 예약 완료 처리
    setShowBookingModal(false)
    
    // 예약 완료 메시지
    alert(`✅ 예약이 완료되었습니다!

예약자: ${customerName}
연락처: ${customerPhone}
체크인: ${reservation.checkIn?.toLocaleDateString('ko-KR')}
체크아웃: ${reservation.checkOut?.toLocaleDateString('ko-KR')}
총 금액: ${totalPrice.toLocaleString()}원

확인 후 연락드리겠습니다.`)
    
    // 폼 초기화
    setCustomerName('')
    setCustomerPhone('')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 선택된 프로그램 정보 표시 */}
      {selectedProgram && (
        <Card className="mb-6 bg-[#2F513F]/5 border-[#2F513F]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2F513F] rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">선택된 프로그램</p>
                <h3 className="text-lg font-semibold text-[#2F513F]">{selectedProgram.name}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>예약하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 정보 */}
          <div ref={dateSelectionRef} className="space-y-4">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            {showDateError && (
              <Alert variant="destructive">
                <AlertTitle>⚠️ 날짜 선택 필수</AlertTitle>
                <AlertDescription>
                  예약을 진행하려면 체크인과 체크아웃 날짜를 모두 선택해주세요.
                </AlertDescription>
              </Alert>
            )}
            <div className={`grid grid-cols-2 gap-4 ${showDateError ? 'ring-2 ring-red-500 ring-opacity-50 rounded-lg p-4' : ''}`}>
              <div>
                <Label className="flex items-center gap-1">
                  체크인 <span className="text-red-500">*</span>
                </Label>
                <Calendar
                  mode="single"
                  selected={reservation.checkIn}
                  onSelect={(date) => {
                    setReservation(prev => ({ ...prev, checkIn: date }))
                    if (date) setHasUserSelectedDates(true)
                    if (showDateError) setShowDateError(false)
                  }}
                  locale={ko}
                  className="rounded-md border"
                  disabled={false}
                />
              </div>
              <div>
                <Label className="flex items-center gap-1">
                  체크아웃 <span className="text-red-500">*</span>
                </Label>
                <Calendar
                  mode="single"
                  selected={reservation.checkOut}
                  onSelect={(date) => {
                    setReservation(prev => ({ ...prev, checkOut: date }))
                    if (date) setHasUserSelectedDates(true)
                    if (showDateError) setShowDateError(false)
                  }}
                  locale={ko}
                  className="rounded-md border"
                  disabled={false}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 인원 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">인원 선택</h3>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>기본 인원 안내</AlertTitle>
              <AlertDescription>
                기본 {PRICE_CONFIG.BASE_CAPACITY}인 기준이며, 추가 인원당 {PRICE_CONFIG.EXTRA_PERSON_FEE.toLocaleString()}원의 추가 요금이 발생합니다.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>성인</Label>
                <Input
                  type="number"
                  min={1}
                  value={reservation.adults}
                  onChange={(e) => handleGuestChange(parseInt(e.target.value), reservation.children)}
                />
              </div>
              <div className="space-y-2">
                <Label>아동</Label>
                <Input
                  type="number"
                  min={0}
                  value={reservation.children}
                  onChange={(e) => handleGuestChange(reservation.adults, parseInt(e.target.value))}
                />
              </div>
            </div>
            {reservation.totalGuests > PRICE_CONFIG.BASE_CAPACITY && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-700">
                  추가 인원 {reservation.totalGuests - PRICE_CONFIG.BASE_CAPACITY}명 × {PRICE_CONFIG.EXTRA_PERSON_FEE.toLocaleString()}원 = {((reservation.totalGuests - PRICE_CONFIG.BASE_CAPACITY) * PRICE_CONFIG.EXTRA_PERSON_FEE).toLocaleString()}원
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* 저녁 제공 서비스 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">저녁 제공 서비스</h3>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>저녁 제공 서비스 안내</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  <li>그릴 대여: 숯 + 토치 + 그릴 제공 (8인 1세트 추천, 최대 {PRICE_CONFIG.BBQ.MAX_GRILLS}개)</li>
                  <li>고기만 세트: 국내산 한돈 냉장 (5인 기준 50,000원)</li>
                  <li>고기+식사 세트: 고기+밥+채소 (5인 기준 70,000원)</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>그릴 대여 수량</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleBBQChange('grillCount', Math.max(0, reservation.bbq.grillCount - 1))}
                      disabled={reservation.bbq.grillCount <= 0}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      max={PRICE_CONFIG.BBQ.MAX_GRILLS}
                      value={reservation.bbq.grillCount}
                      onChange={(e) => handleBBQChange('grillCount', parseInt(e.target.value) || 0)}
                      className="border-0 text-center w-16 h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleBBQChange('grillCount', Math.min(PRICE_CONFIG.BBQ.MAX_GRILLS, reservation.bbq.grillCount + 1))}
                      disabled={reservation.bbq.grillCount >= PRICE_CONFIG.BBQ.MAX_GRILLS}
                    >
                      +
                    </Button>
                  </div>
                  {reservation.bbq.grillCount > 0 && (
                    <div className="font-semibold text-blue-600">
                      💰 {(reservation.bbq.grillCount * grillPrice).toLocaleString()}원
                    </div>
                  )}
                </div>
                {reservation.bbq.grillCount > 0 && (
                  <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-semibold text-blue-700">
                      💰 합계: {(reservation.bbq.grillCount * grillPrice).toLocaleString()}원
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>고기만 세트 (5인 기준)</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleBBQChange('meatSetCount', Math.max(0, reservation.bbq.meatSetCount - 1))}
                      disabled={reservation.bbq.meatSetCount <= 0}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      value={reservation.bbq.meatSetCount}
                      onChange={(e) => handleBBQChange('meatSetCount', parseInt(e.target.value) || 0)}
                      className="border-0 text-center w-16 h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleBBQChange('meatSetCount', reservation.bbq.meatSetCount + 1)}
                    >
                      +
                    </Button>
                  </div>
                  {reservation.bbq.meatSetCount > 0 && (
                    <div className="font-semibold text-green-600">
                      💰 {(reservation.bbq.meatSetCount * 50000).toLocaleString()}원
                    </div>
                  )}
                </div>
                {reservation.bbq.meatSetCount > 0 && (
                  <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-semibold text-green-700">
                      💰 합계: {(reservation.bbq.meatSetCount * 50000).toLocaleString()}원
                    </p>
                    <p className="text-xs text-green-600">
                      {reservation.bbq.meatSetCount}세트 × 50,000원 (5인 기준)
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>고기+식사 세트 (5인 기준)</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleBBQChange('fullSetCount', Math.max(0, reservation.bbq.fullSetCount - 1))}
                      disabled={reservation.bbq.fullSetCount <= 0}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      value={reservation.bbq.fullSetCount}
                      onChange={(e) => handleBBQChange('fullSetCount', parseInt(e.target.value) || 0)}
                      className="border-0 text-center w-16 h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleBBQChange('fullSetCount', reservation.bbq.fullSetCount + 1)}
                    >
                      +
                    </Button>
                  </div>
                  {reservation.bbq.fullSetCount > 0 && (
                    <div className="font-semibold text-orange-600">
                      💰 {(reservation.bbq.fullSetCount * 70000).toLocaleString()}원
                    </div>
                  )}
                </div>
                {reservation.bbq.fullSetCount > 0 && (
                  <div className="mt-1 p-2 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm font-semibold text-orange-700">
                      💰 합계: {(reservation.bbq.fullSetCount * 70000).toLocaleString()}원
                    </p>
                    <p className="text-xs text-orange-600">
                      {reservation.bbq.fullSetCount}세트 × 70,000원 (5인 기준)
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          <Separator />

          {/* 조식 제공 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">조식 제공</h3>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>조식 제공 안내</AlertTitle>
              <AlertDescription>
                보리밥 정식 (5인 기준 50,000원)
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>보리밥 정식 (5인 기준)</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMealChange(Math.max(0, reservation.meal.breakfastCount - 1))}
                    disabled={reservation.meal.breakfastCount <= 0}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={reservation.meal.breakfastCount}
                    onChange={(e) => handleMealChange(parseInt(e.target.value) || 0)}
                    className="border-0 text-center w-16 h-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMealChange(reservation.meal.breakfastCount + 1)}
                  >
                    +
                  </Button>
                </div>
                {reservation.meal.breakfastCount > 0 && (
                  <div className="font-semibold text-purple-600">
                    💰 {(reservation.meal.breakfastCount * 50000).toLocaleString()}원
                  </div>
                )}
              </div>
              {reservation.meal.breakfastCount > 0 && (
                <div className="mt-1 p-2 bg-purple-50 border border-purple-200 rounded-md">
                  <p className="text-sm font-semibold text-purple-700">
                    💰 합계: {(reservation.meal.breakfastCount * 50000).toLocaleString()}원
                  </p>
                  <p className="text-xs text-purple-600">
                    {reservation.meal.breakfastCount}세트 × 50,000원 (5인 기준)
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 체험 프로그램 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">체험 프로그램</h3>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>체험 프로그램 안내</AlertTitle>
              <AlertDescription>
                다양한 체험 프로그램을 통해 특별한 추억을 만들어보세요
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>목공 체험</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setReservation(prev => ({
                      ...prev,
                      experience: {
                        ...prev.experience,
                        farmExperienceCount: Math.max(0, prev.experience.farmExperienceCount - 1)
                      }
                    }))}
                    disabled={reservation.experience.farmExperienceCount <= 0}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={reservation.experience.farmExperienceCount}
                    onChange={(e) => setReservation(prev => ({
                      ...prev,
                      experience: {
                        ...prev.experience,
                        farmExperienceCount: parseInt(e.target.value) || 0
                      }
                    }))}
                    className="border-0 text-center w-16 h-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setReservation(prev => ({
                      ...prev,
                      experience: {
                        ...prev.experience,
                        farmExperienceCount: prev.experience.farmExperienceCount + 1
                      }
                    }))}
                  >
                    +
                  </Button>
                </div>
                {reservation.experience.farmExperienceCount > 0 && (
                  <div className="font-semibold text-green-600">
                    💰 {(reservation.experience.farmExperienceCount * 30000).toLocaleString()}원
                  </div>
                )}
              </div>
              {reservation.experience.farmExperienceCount > 0 && (
                <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-semibold text-green-700">
                    💰 합계: {(reservation.experience.farmExperienceCount * 30000).toLocaleString()}원
                  </p>
                  <p className="text-xs text-green-600">
                    {reservation.experience.farmExperienceCount}명 × 30,000원
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 그외 항목 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">그외 항목</h3>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>그외 항목 안내</AlertTitle>
              <AlertDescription>
                편의를 위한 추가 서비스입니다
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>버스 대절</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setReservation(prev => ({
                      ...prev,
                      extra: {
                        ...prev.extra,
                        laundryCount: Math.max(0, prev.extra.laundryCount - 1)
                      }
                    }))}
                    disabled={reservation.extra.laundryCount <= 0}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={reservation.extra.laundryCount}
                    onChange={(e) => setReservation(prev => ({
                      ...prev,
                      extra: {
                        ...prev.extra,
                        laundryCount: parseInt(e.target.value) || 0
                      }
                    }))}
                    className="border-0 text-center w-16 h-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setReservation(prev => ({
                      ...prev,
                      extra: {
                        ...prev.extra,
                        laundryCount: prev.extra.laundryCount + 1
                      }
                    }))}
                  >
                    +
                  </Button>
                </div>
                {reservation.extra.laundryCount > 0 && (
                  <div className="font-semibold text-yellow-600">
                    💰 {(reservation.extra.laundryCount * 100000).toLocaleString()}원
                  </div>
                )}
              </div>
              {reservation.extra.laundryCount > 0 && (
                <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm font-semibold text-yellow-700">
                    💰 합계: {(reservation.extra.laundryCount * 100000).toLocaleString()}원
                  </p>
                  <p className="text-xs text-yellow-600">
                    {reservation.extra.laundryCount}대 × 100,000원
                  </p>
                </div>
              )}
            </div>
          </div>



          <Separator />

          {/* 가격 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">가격 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>기본 객실 요금</span>
                <span>{basePrice.toLocaleString()}원</span>
              </div>
              {reservation.totalGuests > PRICE_CONFIG.BASE_CAPACITY && (
                <div className="flex justify-between text-orange-600">
                  <span>추가 인원 요금 ({reservation.totalGuests - PRICE_CONFIG.BASE_CAPACITY}명)</span>
                  <span>
                    {((reservation.totalGuests - PRICE_CONFIG.BASE_CAPACITY) * PRICE_CONFIG.EXTRA_PERSON_FEE).toLocaleString()}원
                  </span>
                </div>
              )}
              {reservation.bbq.grillCount > 0 && (
                <div className="flex justify-between">
                  <span>BBQ 그릴 대여 ({reservation.bbq.grillCount}개)</span>
                  <span>{(reservation.bbq.grillCount * grillPrice).toLocaleString()}원</span>
                </div>
              )}
              {reservation.bbq.meatSetCount > 0 && (
                <div className="flex justify-between">
                  <span>고기만 세트 ({reservation.bbq.meatSetCount}세트)</span>
                  <span>
                    {(reservation.bbq.meatSetCount * 50000).toLocaleString()}원
                  </span>
                </div>
              )}
              {reservation.bbq.fullSetCount > 0 && (
                <div className="flex justify-between">
                  <span>고기+식사 세트 ({reservation.bbq.fullSetCount}세트)</span>
                  <span>
                    {(reservation.bbq.fullSetCount * 70000).toLocaleString()}원
                  </span>
                </div>
              )}
              {reservation.meal.breakfastCount > 0 && (
                <div className="flex justify-between">
                  <span>조식 서비스 ({reservation.meal.breakfastCount}세트)</span>
                  <span>
                    {(reservation.meal.breakfastCount * 50000).toLocaleString()}원
                  </span>
                </div>
              )}
              {reservation.experience.farmExperienceCount > 0 && (
                <div className="flex justify-between">
                  <span>목공 체험 ({reservation.experience.farmExperienceCount}명)</span>
                  <span>
                    {(reservation.experience.farmExperienceCount * 30000).toLocaleString()}원
                  </span>
                </div>
              )}
              {reservation.extra.laundryCount > 0 && (
                <div className="flex justify-between">
                  <span>버스 대절 ({reservation.extra.laundryCount}대)</span>
                  <span>
                    {(reservation.extra.laundryCount * 100000).toLocaleString()}원
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>총 금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
              
              {/* 총 금액 바로 밑에 예약하기 버튼 추가 */}
              <Button
                className="w-full mt-4"
                size="lg"
                onClick={() => {
                  // 사용자가 실제로 날짜를 선택했는지 확인
                  const hasCheckIn = reservation.checkIn !== undefined && reservation.checkIn !== null
                  const hasCheckOut = reservation.checkOut !== undefined && reservation.checkOut !== null
                  
                  if (!hasUserSelectedDates || !hasCheckIn || !hasCheckOut) {
                    // 날짜 선택 부분 강조 표시
                    setShowDateError(true)
                    
                    // 날짜 선택 부분으로 스크롤
                    dateSelectionRef.current?.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center' 
                    })
                    
                    // 구체적인 메시지 표시
                    if (!hasCheckIn && !hasCheckOut) {
                      alert('❌ 체크인과 체크아웃 날짜를 모두 선택해주세요!')
                    } else if (!hasCheckIn) {
                      alert('❌ 체크인 날짜를 선택해주세요!')
                    } else {
                      alert('❌ 체크아웃 날짜를 선택해주세요!')
                    }
                    
                    // 3초 후 강조 표시 제거
                    setTimeout(() => {
                      setShowDateError(false)
                    }, 3000)
                    
                    return // 예약 진행 중단
                  }
                  
                  // 날짜 순서 검증
                  if (reservation.checkIn && reservation.checkOut && reservation.checkIn >= reservation.checkOut) {
                    alert('❌ 체크아웃 날짜는 체크인 날짜 이후여야 합니다!')
                    return
                  }
                  
                  // 그 외 검증 오류 확인
                  const validationErrors = validateReservation(reservation)
                  
                  if (validationErrors.length > 0) {
                    alert('❌ ' + validationErrors[0])
                    return // 예약 진행 중단
                  }
                  
                  // 모든 검증 통과 시 예약자 정보 입력 팝업 호출
                  setShowBookingModal(true)
                }}
              >
                예약하기
              </Button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTitle>다음 항목을 확인해주세요:</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* 예약 버튼 */}
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              // 사용자가 실제로 날짜를 선택했는지 확인
              const hasCheckIn = reservation.checkIn !== undefined && reservation.checkIn !== null
              const hasCheckOut = reservation.checkOut !== undefined && reservation.checkOut !== null
              
              if (!hasUserSelectedDates || !hasCheckIn || !hasCheckOut) {
                // 날짜 선택 부분 강조 표시
                setShowDateError(true)
                
                // 날짜 선택 부분으로 스크롤
                dateSelectionRef.current?.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                })
                
                // 구체적인 메시지 표시
                if (!hasCheckIn && !hasCheckOut) {
                  alert('❌ 체크인과 체크아웃 날짜를 모두 선택해주세요!')
                } else if (!hasCheckIn) {
                  alert('❌ 체크인 날짜를 선택해주세요!')
                } else {
                  alert('❌ 체크아웃 날짜를 선택해주세요!')
                }
                
                // 3초 후 강조 표시 제거
                setTimeout(() => {
                  setShowDateError(false)
                }, 3000)
                
                return // 예약 진행 중단
              }
              
              // 날짜 순서 검증
              if (reservation.checkIn && reservation.checkOut && reservation.checkIn >= reservation.checkOut) {
                alert('❌ 체크아웃 날짜는 체크인 날짜 이후여야 합니다!')
                return
              }
              
              // 그 외 검증 오류 확인
              const validationErrors = validateReservation(reservation)
              
              if (validationErrors.length > 0) {
                alert('❌ ' + validationErrors[0])
                return // 예약 진행 중단
              }
              
              // 모든 검증 통과 시 예약자 정보 입력 팝업 호출
              setShowBookingModal(true)
            }}
          >
            예약하기
          </Button>
        </CardContent>
      </Card>

      {/* 예약자 정보 입력 모달 */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>예약자 정보 입력</DialogTitle>
            <DialogDescription>
              예약 완료를 위해 추가 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="col-span-3"
                placeholder="예약자 이름"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                연락처 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="col-span-3"
                placeholder="010-0000-0000"
              />
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">예약 요약</h4>
              <div className="text-sm space-y-1">
                <p>체크인: {reservation.checkIn?.toLocaleDateString('ko-KR')}</p>
                <p>체크아웃: {reservation.checkOut?.toLocaleDateString('ko-KR')}</p>
                <p>총 인원: {reservation.totalGuests}명</p>
                <p className="font-semibold text-lg pt-2">
                  총 금액: {totalPrice.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowBookingModal(false)}>
              취소
            </Button>
            <Button type="button" onClick={handleReservationSubmit}>
              예약 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 