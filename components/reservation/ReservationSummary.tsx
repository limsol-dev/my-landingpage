"use client"

import { useReservationStore } from "@/store/useReservationStore"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarDays, Users, UtensilsCrossed, Bus } from "lucide-react"

const ROOM_NAMES = {
  standard: "스탠다드룸",
  deluxe: "디럭스룸",
  suite: "스위트룸"
} as const

const OPTION_NAMES = {
  breakfast: "조식",
  dinner: "석식",
  bbq: "BBQ 세트",
  spa: "스파 이용권"
} as const

const BBQ_NAMES = {
  basic: "실속형 BBQ",
  standard: "기본형 BBQ",
  premium: "프리미엄 BBQ"
} as const

const BBQ_PRICES = {
  basic: 50000,
  standard: 60000,
  premium: 80000
} as const

export default function ReservationSummary() {
  const {
    selectedDate,
    roomType,
    adults,
    children,
    options,
    totalPrice
  } = useReservationStore()

  const selectedOptions = Object.entries(options)
    .filter(([_, isSelected]) => isSelected)
    .map(([key]) => OPTION_NAMES[key as keyof typeof OPTION_NAMES])

  if (!selectedDate || !roomType) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            날짜와 객실을 선택해주세요
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">예약 정보</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">체크인</p>
                <p className="text-muted-foreground">
                  {format(selectedDate, "PPP (eee)", { locale: ko })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">객실 및 인원</p>
                <p className="text-muted-foreground">
                  {ROOM_NAMES[roomType]} · 성인 {adults}명
                  {children > 0 && `, 소아 ${children}명`}
                </p>
              </div>
            </div>

            {(options.breakfast || options.bbq.type || options.bus) && (
              <div className="space-y-3">
                <p className="font-medium">추가 옵션</p>
                
                {options.breakfast && (
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="w-4 h-4" />
                    <p className="text-muted-foreground">
                      조식 {adults + children}인
                      <span className="ml-2 text-sm">
                        ({(adults + children) * 10000}원)
                      </span>
                    </p>
                  </div>
                )}

                {options.bbq.type && (
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="w-4 h-4" />
                    <div className="text-muted-foreground">
                      <p>
                        {BBQ_NAMES[options.bbq.type]} {options.bbq.quantity}kg
                        <span className="ml-2 text-sm">
                          ({BBQ_PRICES[options.bbq.type] * Math.ceil((adults + children) / 5) * options.bbq.quantity}원)
                        </span>
                      </p>
                      <p className="text-sm">
                        {Math.ceil((adults + children) / 5)}세트
                      </p>
                    </div>
                  </div>
                )}

                {options.bus && (
                  <div className="flex items-center gap-3">
                    <Bus className="w-4 h-4" />
                    <p className="text-muted-foreground">
                      버스 서비스 (가격 협의)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">총 결제 금액</span>
            <span className="text-xl font-bold text-primary">
              {totalPrice.toLocaleString()}원
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            부가세 포함 금액입니다
            {options.bus && " (버스 서비스 요금 별도)"}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button className="w-full" size="lg">
          예약하기
        </Button>
      </CardFooter>
    </Card>
  )
} 