"use client"

import { Metadata } from 'next'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useReservationStore } from '@/store/useReservationStore'
import { programs } from '@/data/programs'
import { useEffect } from 'react'

export const metadata: Metadata = {
  title: '예약하기 | 펜션',
  description: '편안한 휴식을 위한 최적의 선택',
}

export default function ReservationPage({
  searchParams,
}: {
  searchParams: { program?: string }
}) {
  const {
    roomType,
    adults,
    children,
    options,
    totalPrice,
    setRoomType,
    setAdults,
    setChildren,
    setBbqOption,
    toggleOption,
    setProgramId
  } = useReservationStore()

  const program = programs.find((p) => p.id === searchParams.program)

  useEffect(() => {
    if (program) {
      setProgramId(program.id)
    }
  }, [program, setProgramId])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">예약하기</h1>
      
      {program && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>선택하신 프로그램</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{program.title}</h3>
                <p className="text-gray-600">{program.description}</p>
              </div>
              <p className="text-lg font-semibold">
                {program.price.toLocaleString()}원
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>날짜 선택</CardTitle>
            </CardHeader>
            <CardContent>
              <DateRangePicker />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>객실 타입</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={roomType || "standard"} 
                onValueChange={(value) => setRoomType(value as 'standard' | 'deluxe' | 'suite')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard">스탠다드 (150,000원)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deluxe" id="deluxe" />
                  <Label htmlFor="deluxe">디럭스 (200,000원)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suite" id="suite" />
                  <Label htmlFor="suite">스위트 (300,000원)</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>인원 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adults">성인</Label>
                <Select value={adults.toString()} onValueChange={(value) => setAdults(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="성인 인원 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}명
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="children">아동</Label>
                <Select value={children.toString()} onValueChange={(value) => setChildren(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="아동 인원 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}명
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>추가 옵션</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="breakfast" 
                    checked={options.breakfast}
                    onCheckedChange={() => toggleOption('breakfast')}
                  />
                  <Label htmlFor="breakfast">조식 추가 (1인 10,000원)</Label>
                </div>
                
                <div>
                  <Label>BBQ 세트</Label>
                  <Select 
                    value={options.bbq.type || ""} 
                    onValueChange={(value) => setBbqOption(value as any || null, options.bbq.quantity)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="BBQ 옵션 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">선택 안함</SelectItem>
                      <SelectItem value="basic">기본 (50,000원)</SelectItem>
                      <SelectItem value="standard">스탠다드 (60,000원)</SelectItem>
                      <SelectItem value="premium">프리미엄 (80,000원)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="bus" 
                    checked={options.bus}
                    onCheckedChange={() => toggleOption('bus')}
                  />
                  <Label htmlFor="bus">셔틀버스 이용 (20,000원)</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>결제 금액</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>객실 요금</span>
                  <span>{roomType ? {
                    standard: '150,000',
                    deluxe: '200,000',
                    suite: '300,000'
                  }[roomType] : '0'}원</span>
                </div>
                <div className="flex justify-between">
                  <span>추가 인원</span>
                  <span>{((Math.max(0, adults - 2) * 30000) + (Math.max(0, children - 1) * 20000)).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>추가 옵션</span>
                  <span>{(
                    (options.breakfast ? (adults + children) * 10000 : 0) +
                    (options.bbq.type ? {
                      basic: 50000,
                      standard: 60000,
                      premium: 80000
                    }[options.bbq.type] : 0) +
                    (options.bus ? 20000 : 0)
                  ).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>총 결제 금액</span>
                  <span>{totalPrice.toLocaleString()}원</span>
                </div>
              </div>

              <Button className="w-full mt-6">예약하기</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 