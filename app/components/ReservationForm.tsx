"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useReservations } from '../admin/context/ReservationContext'
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
import { toast } from 'sonner'

interface ReservationFormProps {
  programId: string
  programName: string
  basePrice: number
}

export function ReservationForm({ programId, programName, basePrice }: ReservationFormProps) {
  const router = useRouter()
  const { addReservation } = useReservations()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ReservationInfo>({
    guestName: '',
    guestPhone: '',
    checkIn: new Date(),
    checkOut: new Date(new Date().setDate(new Date().getDate() + 1)),
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

  const [basePrice, setBasePrice] = useState(basePrice) // 기본 객실 가격
  const [grillPrice, setGrillPrice] = useState(30000) // BBQ 그릴 대여 가격

  const handleGuestChange = (adults: number, children: number) => {
    setFormData(prev => ({
      ...prev,
      adults,
      children,
      totalGuests: adults + children
    }))
  }

  const handleBBQChange = (field: keyof typeof formData.bbq, value: number) => {
    setFormData(prev => ({
      ...prev,
      bbq: {
        ...prev.bbq,
        [field]: value
      }
    }))
  }

  const handleMealChange = (breakfastCount: number) => {
    setFormData(prev => ({
      ...prev,
      meal: {
        ...prev.meal,
        breakfastCount
      }
    }))
  }

  const handleTransportChange = (needsBus: boolean) => {
    setFormData(prev => ({
      ...prev,
      transport: {
        ...prev.transport,
        needsBus
      }
    }))
  }

  const errors = validateReservation(formData)
  const totalPrice = calculateTotalPrice(formData, basePrice, grillPrice)

  const calculateNights = () => {
    const diffTime = Math.abs(formData.checkOut.getTime() - formData.checkIn.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotalAmount = () => {
    const nights = calculateNights()
    const baseAmount = basePrice * nights
    const additionalGuestFee = (formData.totalGuests - PRICE_CONFIG.BASE_CAPACITY) * PRICE_CONFIG.EXTRA_PERSON_FEE * nights
    const bbqFee = formData.bbq.grillCount * PRICE_CONFIG.BBQ.GRILL_FEE + 
                  formData.bbq.meatSetCount * PRICE_CONFIG.BBQ.MEAT_SET + 
                  formData.bbq.fullSetCount * PRICE_CONFIG.BBQ.FULL_SET
    const mealFee = formData.meal.breakfastCount * PRICE_CONFIG.MEAL.BREAKFAST
    const transportFee = formData.transport.needsBus ? PRICE_CONFIG.TRANSPORT.BUS_FEE : 0
    const experienceFee = formData.experience.farmExperienceCount * PRICE_CONFIG.EXPERIENCE.FARM_FEE
    const extraFee = formData.extra.laundryCount * PRICE_CONFIG.EXTRA.LAUNDRY_FEE

    return baseAmount + additionalGuestFee + bbqFee + mealFee + transportFee + experienceFee + extraFee
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const reservation = {
        id: `RES-${Date.now()}`,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        checkIn: formData.checkIn.toISOString(),
        checkOut: formData.checkOut.toISOString(),
        programId,
        adults: formData.adults,
        children: formData.children,
        totalGuests: formData.totalGuests,
        bbq: formData.bbq,
        meal: formData.meal,
        transport: formData.transport,
        experience: formData.experience,
        extra: formData.extra,
        nights: calculateNights(),
        basePrice,
        totalAmount: calculateTotalAmount(),
        status: 'pending' as const,
      }

      console.log('Submitting reservation:', reservation) // 디버깅용 로그
      addReservation(reservation)
      toast.success('예약이 완료되었습니다. 관리자 확인 후 연락드리겠습니다.')
      router.push('/reservation-complete')
    } catch (error) {
      console.error('Error submitting reservation:', error)
      toast.error('예약 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>예약하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="guestName">예약자명</Label>
                <Input
                  id="guestName"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="guestPhone">연락처</Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  required
                  placeholder="010-0000-0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>체크인</Label>
                  <Calendar
                    mode="single"
                    selected={formData.checkIn}
                    onSelect={(date) => date && setFormData({ ...formData, checkIn: date })}
                    disabled={(date) => date < new Date()}
                    locale={ko}
                  />
                </div>

                <div>
                  <Label>체크아웃</Label>
                  <Calendar
                    mode="single"
                    selected={formData.checkOut}
                    onSelect={(date) => date && setFormData({ ...formData, checkOut: date })}
                    disabled={(date) => date <= formData.checkIn}
                    locale={ko}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adults">성인</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    value={formData.adults}
                    onChange={(e) => {
                      const adults = parseInt(e.target.value)
                      setFormData({
                        ...formData,
                        adults,
                        totalGuests: adults + formData.children
                      })
                    }}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="children">아동</Label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={formData.children}
                    onChange={(e) => {
                      const children = parseInt(e.target.value)
                      setFormData({
                        ...formData,
                        children,
                        totalGuests: formData.adults + children
                      })
                    }}
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
                    value={formData.bbq.grillCount}
                    onChange={(e) => handleBBQChange('grillCount', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>고기 세트 (인원)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.bbq.meatSetCount}
                    onChange={(e) => handleBBQChange('meatSetCount', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>목살+식사 세트 (인원)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.bbq.fullSetCount}
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
                  value={formData.meal.breakfastCount}
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
                  value={formData.transport.needsBus ? "yes" : "no"}
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
                {formData.additionalGuests > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>추가 인원 요금 ({formData.additionalGuests}명)</span>
                    <span>
                      {(formData.additionalGuests * 20000).toLocaleString()}원
                    </span>
                  </div>
                )}
                {formData.bbq.grillCount > 0 && (
                  <div className="flex justify-between">
                    <span>BBQ 그릴 대여 ({formData.bbq.grillCount}개)</span>
                    <span>{(formData.bbq.grillCount * grillPrice).toLocaleString()}원</span>
                  </div>
                )}
                {formData.bbq.meatSetCount > 0 && (
                  <div className="flex justify-between">
                    <span>고기 세트 ({formData.bbq.meatSetCount}인)</span>
                    <span>
                      {(formData.bbq.meatSetCount * PRICE_CONFIG.BBQ.MEAT_SET).toLocaleString()}원
                    </span>
                  </div>
                )}
                {formData.bbq.fullSetCount > 0 && (
                  <div className="flex justify-between">
                    <span>목살+식사 세트 ({formData.bbq.fullSetCount}인)</span>
                    <span>
                      {(formData.bbq.fullSetCount * PRICE_CONFIG.BBQ.FULL_SET).toLocaleString()}원
                    </span>
                  </div>
                )}
                {formData.meal.breakfastCount > 0 && (
                  <div className="flex justify-between">
                    <span>조식 ({formData.meal.breakfastCount}인)</span>
                    <span>
                      {(formData.meal.breakfastCount * PRICE_CONFIG.BREAKFAST).toLocaleString()}원
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
              type="submit"
              className="w-full bg-[#2F513F] hover:bg-[#3d6b4f]"
              disabled={isLoading || errors.length > 0}
            >
              {isLoading ? '예약 중...' : '예약하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 