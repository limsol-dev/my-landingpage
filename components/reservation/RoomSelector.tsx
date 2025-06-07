"use client"

import { useReservationStore } from "@/store/useReservationStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Users, Maximize, Mountain } from "lucide-react"

const rooms = [
  {
    type: "standard",
    name: "스탠다드룸",
    description: "아늑하고 편안한 공간에서 즐기는 힐링스테이",
    price: 150000,
    capacity: "2인 기준 (최대 3인)",
    size: "26㎡",
    view: "정원 뷰",
    image: "/rooms/standard.jpg"
  },
  {
    type: "deluxe",
    name: "디럭스룸",
    description: "넓은 공간에서 즐기는 프리미엄 스테이",
    price: 250000,
    capacity: "2인 기준 (최대 4인)",
    size: "36㎡",
    view: "산 뷰",
    image: "/rooms/deluxe.jpg"
  },
  {
    type: "suite",
    name: "스위트룸",
    description: "최상의 서비스와 전망을 자랑하는 럭셔리 스테이",
    price: 350000,
    capacity: "2인 기준 (최대 4인)",
    size: "46㎡",
    view: "파노라마 산 뷰",
    image: "/rooms/suite.jpg"
  }
] as const

export default function RoomSelector() {
  const { roomType, setRoomType } = useReservationStore()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">객실 선택</h2>
        <p className="text-muted-foreground">
          원하시는 객실 타입을 선택해주세요
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card
            key={room.type}
            className={`cursor-pointer transition-all ${
              roomType === room.type
                ? "ring-2 ring-primary"
                : "hover:border-primary"
            }`}
            onClick={() => setRoomType(room.type)}
          >
            <div className="relative aspect-video">
              <Image
                src={room.image}
                alt={room.name}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{room.name}</h3>
                  <Badge variant="secondary">
                    {room.price.toLocaleString()}원
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {room.description}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{room.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4" />
                  <span>{room.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4" />
                  <span>{room.view}</span>
                </div>
              </div>

              <Button
                variant={roomType === room.type ? "default" : "outline"}
                className="w-full"
                onClick={() => setRoomType(room.type)}
              >
                {roomType === room.type ? "선택됨" : "선택하기"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 