"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { 
  Utensils, 
  Coffee, 
  Flame, 
  TreePine,  // Pool 대신 TreePine으로 변경
  Clock 
} from "lucide-react"
import Image from "next/image"

type Facility = {
  id: string
  name: string
  description: string
  hours: string
  price: string
  image: string
  icon: React.ReactNode
  isReservationRequired: boolean
}

export default function Facilities() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  
  const facilities: Facility[] = [
    {
      id: "restaurant",
      name: "레스토랑",
      description: "신선한 로컬 식재료로 준비하는 조식과 석식",
      hours: "08:00-22:00",
      price: "조식 20,000원 / 석식 35,000원",
      image: "/facilities/restaurant.jpg",
      icon: <Utensils className="h-6 w-6" />,
      isReservationRequired: true
    },
    {
      id: "cafe",
      name: "카페",
      description: "향긋한 커피와 수제 디저트",
      hours: "10:00-22:00",
      price: "음료 5,000원~",
      image: "/facilities/cafe.jpg",
      icon: <Coffee className="h-6 w-6" />,
      isReservationRequired: false
    },
    {
      id: "bbq",
      name: "바베큐장",
      description: "자연과 함께하는 프라이빗한 바베큐",
      hours: "15:00-22:00",
      price: "30,000원 (기본 세팅 포함)",
      image: "/facilities/bbq.jpg",
      icon: <Flame className="h-6 w-6" />,
      isReservationRequired: true
    },
    {
      id: "trail",
      name: "산책로",
      description: "사계절 아름다운 자연 산책로",
      hours: "24시간",
      price: "무료",
      image: "/facilities/trail.jpg",
      icon: <TreePine className="h-6 w-6" />,
      isReservationRequired: false
    }
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">부대시설</h2>
          <p className="text-muted-foreground">
            편안한 휴식을 위한 다양한 부대시설을 이용해보세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((facility) => (
            <Card key={facility.id}>
              <div className="relative aspect-video">
                <Image
                  src={facility.image}
                  alt={facility.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {facility.icon}
                  {facility.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {facility.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{facility.hours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>이용 요금</span>
                    <span className="font-medium">{facility.price}</span>
                  </div>
                </div>
                {facility.isReservationRequired && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">예약하기</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{facility.name} 예약</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                        />
                        <Button className="w-full">
                          예약 확정
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 