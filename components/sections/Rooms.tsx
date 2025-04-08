"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BedDouble, Users, Maximize, Bath, Kitchen } from "lucide-react"
import Image from "next/image"

type Room = {
  id: string
  name: string
  size: string
  price: string
  capacity: string
  description: string
  amenities: string[]
  images: string[]
  isAvailable: boolean
}

export default function Rooms() {
  const [selectedImage, setSelectedImage] = useState<string>("")
  
  const rooms: Room[] = [
    {
      id: "deluxe",
      name: "디럭스룸",
      size: "26㎡",
      price: "180,000원~",
      capacity: "2-3인",
      description: "아늑하고 편안한 공간에서 특별한 휴식을 경험하세요",
      amenities: ["퀸베드", "욕조", "미니주방", "무료 WiFi"],
      images: ["/rooms/deluxe-1.jpg", "/rooms/deluxe-2.jpg"],
      isAvailable: true
    },
    {
      id: "suite",
      name: "스위트룸",
      size: "46㎡",
      price: "250,000원~",
      capacity: "4-5인",
      description: "넓은 공간에서 가족과 함께하는 특별한 시간",
      amenities: ["킹베드", "거실", "주방", "테라스"],
      images: ["/rooms/suite-1.jpg", "/rooms/suite-2.jpg"],
      isAvailable: true
    },
    {
      id: "premium",
      name: "프리미엄룸",
      size: "66㎡",
      price: "320,000원~",
      capacity: "4-6인",
      description: "프라이빗한 공간에서 럭셔리한 휴식",
      amenities: ["복층", "테라스", "BBQ", "프라이빗 스파"],
      images: ["/rooms/premium-1.jpg", "/rooms/premium-2.jpg"],
      isAvailable: false
    }
  ]

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">객실 안내</h2>
          <p className="text-muted-foreground">
            고객님의 니즈에 맞는 최적의 객실을 선택하세요
          </p>
        </div>

        <Tabs defaultValue="deluxe" className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full max-w-[600px] mx-auto">
            {rooms.map((room) => (
              <TabsTrigger key={room.id} value={room.id}>
                {room.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {rooms.map((room) => (
            <TabsContent key={room.id} value={room.id}>
              <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
                {/* 이미지 갤러리 */}
                <div className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={selectedImage || room.images[0]}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {room.images.map((image) => (
                      <div
                        key={image}
                        className="relative aspect-video cursor-pointer rounded-lg overflow-hidden"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Image
                          src={image}
                          alt={room.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 객실 정보 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{room.name}</CardTitle>
                        <p className="text-muted-foreground mt-2">{room.description}</p>
                      </div>
                      <Badge variant={room.isAvailable ? "default" : "secondary"}>
                        {room.isAvailable ? "예약가능" : "예약마감"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{room.capacity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Maximize className="h-4 w-4" />
                        <span>{room.size}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">구비시설</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {room.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground">기본 요금</span>
                        <span className="text-2xl font-bold">{room.price}</span>
                      </div>
                      <Button className="w-full" disabled={!room.isAvailable}>
                        {room.isAvailable ? "예약하기" : "예약마감"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
} 