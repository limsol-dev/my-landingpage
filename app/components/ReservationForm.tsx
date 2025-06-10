"use client"

import { useState } from 'react'
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
import { InfoIcon } from 'lucide-react'

export default function ReservationForm() {
  const [reservation, setReservation] = useState<ReservationInfo>({
    checkIn: new Date(),
    checkOut: new Date(),
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
    }
  })

  const [basePrice, setBasePrice] = useState(150000) // 기본 객실 가격
  const [grillPrice, setGrillPrice] = useState(30000) // BBQ 그릴 대여 가격

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>예약하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>체크인</Label>
                <Calendar
                  mode="single"
                  selected={reservation.checkIn}
                  onSelect={(date) => date && setReservation(prev => ({ ...prev, checkIn: date }))}
                  locale={ko}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label>체크아웃</Label>
                <Calendar
                  mode="single"
                  selected={reservation.checkOut}
                  onSelect={(date) => date && setReservation(prev => ({ ...prev, checkOut: date }))}
                  locale={ko}
                  className="rounded-md border"
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
          </div>

          <Separator />

          {/* BBQ 서비스 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">BBQ 서비스</h3>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>BBQ 서비스 안내</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  <li>그릴 대여: 숯 + 토치 + 그릴 제공 (8인 1세트 추천, 최대 {PRICE_CONFIG.BBQ.MAX_GRILLS}개)</li>
                  <li>고기 세트: 국내산 한돈 냉장 (1인 {PRICE_CONFIG.BBQ.MEAT_SET.toLocaleString()}원)</li>
                  <li>목살 + 식사 세트: 1인 {PRICE_CONFIG.BBQ.FULL_SET.toLocaleString()}원</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>그릴 대여 수량</Label>
                <Input
                  type="number"
                  min={0}
                  max={PRICE_CONFIG.BBQ.MAX_GRILLS}
                  value={reservation.bbq.grillCount}
                  onChange={(e) => handleBBQChange('grillCount', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>고기 세트 (인원)</Label>
                <Input
                  type="number"
                  min={0}
                  value={reservation.bbq.meatSetCount}
                  onChange={(e) => handleBBQChange('meatSetCount', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>목살+식사 세트 (인원)</Label>
                <Input
                  type="number"
                  min={0}
                  value={reservation.bbq.fullSetCount}
                  onChange={(e) => handleBBQChange('fullSetCount', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 조식 서비스 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">조식 서비스</h3>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>조식 서비스 안내</AlertTitle>
              <AlertDescription>
                보리밥 조식 제공 (1인 {PRICE_CONFIG.BREAKFAST.toLocaleString()}원)
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>조식 신청 인원</Label>
              <Input
                type="number"
                min={0}
                value={reservation.meal.breakfastCount}
                onChange={(e) => handleMealChange(parseInt(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          {/* 교통 서비스 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">교통 서비스</h3>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>버스 렌트 안내</AlertTitle>
              <AlertDescription>
                버스 렌트는 예약 후 협의를 통해 진행됩니다.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>버스 렌트 필요 여부</Label>
              <Select
                value={reservation.transport.needsBus ? "yes" : "no"}
                onValueChange={(value) => handleTransportChange(value === "yes")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">불필요</SelectItem>
                  <SelectItem value="yes">필요 (협의 후 안내)</SelectItem>
                </SelectContent>
              </Select>
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
                  <span>고기 세트 ({reservation.bbq.meatSetCount}인)</span>
                  <span>
                    {(reservation.bbq.meatSetCount * PRICE_CONFIG.BBQ.MEAT_SET).toLocaleString()}원
                  </span>
                </div>
              )}
              {reservation.bbq.fullSetCount > 0 && (
                <div className="flex justify-between">
                  <span>목살+식사 세트 ({reservation.bbq.fullSetCount}인)</span>
                  <span>
                    {(reservation.bbq.fullSetCount * PRICE_CONFIG.BBQ.FULL_SET).toLocaleString()}원
                  </span>
                </div>
              )}
              {reservation.meal.breakfastCount > 0 && (
                <div className="flex justify-between">
                  <span>조식 ({reservation.meal.breakfastCount}인)</span>
                  <span>
                    {(reservation.meal.breakfastCount * PRICE_CONFIG.BREAKFAST).toLocaleString()}원
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>총 금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
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
            disabled={errors.length > 0}
            onClick={() => {
              // TODO: 예약 처리 로직
              console.log('Reservation:', reservation)
            }}
          >
            예약하기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 