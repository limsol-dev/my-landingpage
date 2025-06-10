"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BedDouble, Sofa, UtensilsCrossed, DoorOpen } from "lucide-react"
import Image from "next/image"

type Room = {
  id: string
  title: string
  subTitle: string
  capacity: string
  image: string
  icon: React.ReactNode
}

interface HealingSpacesProps {
  onBookingClick: () => void
}

export default function HealingSpaces({ onBookingClick }: HealingSpacesProps) {
  const rooms: Room[] = [
    {
      id: "room1",
      title: "방 1",
      subTitle: "아늑한 휴식 공간",
      capacity: "2-3인",
      image: "/images/room1.jpg",
      icon: <BedDouble className="h-5 w-5" />
    },
    {
      id: "room2",
      title: "방 2",
      subTitle: "편안한 휴식 공간",
      capacity: "2-3인",
      image: "/images/room2.jpg",
      icon: <BedDouble className="h-5 w-5" />
    },
    {
      id: "living",
      title: "거실",
      subTitle: "편안한 휴식과 대화의 공간",
      capacity: "전체 이용",
      image: "/images/living.jpg",
      icon: <Sofa className="h-5 w-5" />
    },
    {
      id: "kitchen",
      title: "부엌",
      subTitle: "요리와 식사를 위한 공간",
      capacity: "전체 이용",
      image: "/images/kitchen.jpg",
      icon: <UtensilsCrossed className="h-5 w-5" />
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">달팽이아지트펜션 공간 구성</h2>
          <p className="text-muted-foreground">
            작은방 2개 또는 큰방 1개로 선택하여 사용 가능한 프라이빗한 공간
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* VR 투어 섹션 */}
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src="/images/vr-tour.jpg"
              alt="360도 VR 투어"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-white text-xl font-semibold mb-2">360° VR 투어로 미리 체험하기</h3>
              <p className="text-white/80 mb-4">작은방 2개 또는 큰방 1개로 선택 가능</p>
              <Button variant="outline" className="text-white border-white hover:bg-white/20">
                VR 투어 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* 객실 소개 섹션 */}
          <div className="grid grid-cols-2 gap-4">
            {rooms.map((room) => (
              <Card 
                key={room.id} 
                className="group relative overflow-hidden"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={room.image}
                    alt={room.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      {room.icon}
                      <h3 className="font-semibold">{room.title}</h3>
                    </div>
                    <p className="text-sm text-white/90 mb-1">{room.subTitle}</p>
                    <Badge variant="secondary" className="bg-white/20">
                      {room.capacity}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              작은방 2개 또는 큰방 1개 선택 가능
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              전 객실 자연 조망
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              프라이빗 공간
            </Badge>
          </div>
          <Button size="lg" variant="outline" className="mt-6" onClick={onBookingClick}>
            예약하기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
} 