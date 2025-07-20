"use client"

import { useReservationStore } from "@/store/useReservationStore"
import { useReservationAnalytics } from "@/hooks/use-reservation-analytics"
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
  const { trackEvent, isInitialized } = useReservationAnalytics()

  const handleRoomClick = (room: typeof rooms[number], index: number) => {
    // 기본 상태 업데이트 (store에서 자동 추적됨)
    setRoomType(room.type)

    // 추가 상세 추적 (클릭 위치, 이미지 등)
    if (isInitialized) {
      trackEvent({
        event_type: 'room_view',
        room_id: `room-${room.type}`,
        conversion_funnel_step: 2,
        metadata: {
          room_name: room.name,
          room_price: room.price,
          room_capacity: room.capacity,
          room_size: room.size,
          room_view: room.view,
          click_position: index + 1,
          interaction_type: 'card_click',
          selection_method: 'room_grid'
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">객실 선택</h2>
        <p className="text-muted-foreground">
          원하시는 객실 타입을 선택해주세요
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {rooms.map((room, index) => (
          <Card
            key={room.type}
            className={`cursor-pointer transition-all ${
              roomType === room.type
                ? "ring-2 ring-primary"
                : "hover:border-primary"
            }`}
            onClick={() => handleRoomClick(room, index)}
          >
            <div className="relative aspect-video">
              <Image
                src={room.image}
                alt={room.name}
                fill
                className="object-cover rounded-t-lg"
              />
              {roomType === room.type && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary">선택됨</Badge>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{room.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {room.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{room.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize className="w-4 h-4" />
                    <span>{room.size}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mountain className="w-4 h-4" />
                    <span>{room.view}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {room.price.toLocaleString()}원
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /박
                  </span>
                </div>

                <Button
                  variant={roomType === room.type ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRoomClick(room, index)
                  }}
                >
                  {roomType === room.type ? "선택됨" : "선택하기"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 