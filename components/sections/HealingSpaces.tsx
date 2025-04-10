"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Eye, Users, BedDouble, UtensilsCrossed, Users2 } from "lucide-react"
import Image from "next/image"

type Room = {
  id: string
  title: string
  subTitle: string
  capacity: string
  image: string
  icon: React.ReactNode
}

export default function HealingSpaces() {
  const rooms: Room[] = [
    {
      id: "meeting",
      title: "회의실",
      subTitle: "소규모 모임과 강의를 위한 공간",
      capacity: "최대 20인",
      image: "/spaces/meeting-room.jpg",
      icon: <Users2 className="h-5 w-5" />
    },
    {
      id: "small-1",
      title: "스탠다드룸",
      subTitle: "아늑한 휴식 공간",
      capacity: "2인실",
      image: "/spaces/standard-room.jpg",
      icon: <BedDouble className="h-5 w-5" />
    },
    {
      id: "small-2",
      title: "디럭스룸",
      subTitle: "편안한 휴식 공간",
      capacity: "2-3인실",
      image: "/spaces/deluxe-room.jpg",
      icon: <BedDouble className="h-5 w-5" />
    },
    {
      id: "dining",
      title: "다이닝룸",
      subTitle: "건강한 식사를 위한 공간",
      capacity: "최대 30인",
      image: "/spaces/dining-room.jpg",
      icon: <UtensilsCrossed className="h-5 w-5" />
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">힐링 스페이스 둘러보기</h2>
          <p className="text-muted-foreground">
            지친 일상에서 하나씩 벗어날 수 있는 특별한 공간
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* VR 투어 섹션 */}
          <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
            <Image
              src="/spaces/vr-preview.jpg"
              alt="VR Tour Preview"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <Eye className="h-16 w-16 mb-4" />
              <h3 className="text-2xl font-bold mb-2">360° VR 투어</h3>
              <p className="text-lg mb-6">실제 공간을 가상으로 체험해보세요</p>
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
              360° VR 투어 제공
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              전 객실 자연 조망
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              프라이빗 공간
            </Badge>
          </div>
          <Button size="lg" variant="outline" className="mt-6">
            전체 시설 둘러보기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
} 