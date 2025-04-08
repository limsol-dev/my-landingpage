"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CalendarCheck, CreditCard, Phone, UserCheck } from "lucide-react"
import { useState } from "react"

type Step = {
  id: number
  title: string
  description: string
  icon: React.ReactNode
}

type BookingStatus = {
  date: Date
  availableRooms: number
  isFullyBooked: boolean
}

export default function BookingProcess() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  const steps: Step[] = [
    {
      id: 1,
      title: "프로그램 선택",
      description: "원하시는 프로그램과 날짜를 선택해주세요",
      icon: <CalendarCheck className="h-8 w-8" />
    },
    {
      id: 2,
      title: "예약 문의",
      description: "전화 또는 카카오톡으로 문의해주세요",
      icon: <Phone className="h-8 w-8" />
    },
    {
      id: 3,
      title: "예약 확정",
      description: "예약 가능 여부를 확인해드립니다",
      icon: <UserCheck className="h-8 w-8" />
    },
    {
      id: 4,
      title: "결제 진행",
      description: "안내된 방법으로 결제를 진행해주세요",
      icon: <CreditCard className="h-8 w-8" />
    }
  ]

  // 예시 예약 현황 데이터
  const bookingStatus: BookingStatus[] = [
    { date: new Date(2024, 2, 20), availableRooms: 2, isFullyBooked: false },
    { date: new Date(2024, 2, 21), availableRooms: 0, isFullyBooked: true },
    { date: new Date(2024, 2, 22), availableRooms: 3, isFullyBooked: false },
    // ... 더 많은 날짜 데이터
  ]

  const getDateStatus = (date: Date) => {
    return bookingStatus.find(status => 
      status.date.getDate() === date.getDate() &&
      status.date.getMonth() === date.getMonth()
    )
  }

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">예약 프로세스 안내</h2>
          <p className="text-muted-foreground">
            간편한 4단계로 힐링 프로그램을 예약하실 수 있습니다
          </p>
        </div>

        {/* 예약 프로세스 단계 */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {steps.map((step) => (
            <Card key={step.id} className="text-center">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 실시간 예약 현황 */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">실시간 예약 현황</h3>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  booked: (date) => {
                    const status = getDateStatus(date)
                    return status?.isFullyBooked || false
                  }
                }}
                modifiersStyles={{
                  booked: { color: 'white', backgroundColor: '#ef4444' }
                }}
                components={{
                  DayContent: (props) => {
                    const status = getDateStatus(props.date)
                    return (
                      <div className="relative">
                        {props.date.getDate()}
                        {status && !status.isFullyBooked && (
                          <Badge 
                            variant="secondary" 
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs"
                          >
                            {status.availableRooms}실
                          </Badge>
                        )}
                      </div>
                    )
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">예약 문의</h3>
                <div className="space-y-4">
                  <p className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    전화 문의: 1544-0000
                  </p>
                  <p>
                    평일 09:00 - 18:00<br />
                    주말 및 공휴일 10:00 - 17:00
                  </p>
                </div>
              </div>
              <Button className="w-full">
                카카오톡 문의하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
} 