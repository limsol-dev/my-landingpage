"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, BedDouble, Sofa, UtensilsCrossed, DoorOpen, ZoomIn, Play } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

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
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; description: string } | null>(null)
  const [showVRTour, setShowVRTour] = useState(false)

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
    <section className="py-12 sm:py-20 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-12 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold">달팽이아지트펜션 공간 구성</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            작은방 2개 또는 큰방 1개로 선택하여 사용 가능한 프라이빗한 공간
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 px-4">
          {/* VR 투어 섹션 */}
          <div className="relative aspect-video mb-6 lg:mb-8 rounded-lg overflow-hidden">
            <Image
              src="/images/vr-tour.jpg"
              alt="360도 VR 투어"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4 sm:p-6">
              <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">360° VR 투어로 미리 체험하기</h3>
              <p className="text-white/80 mb-4 text-sm sm:text-base">작은방 2개 또는 큰방 1개로 선택 가능</p>
              <Button 
                className="bg-[#2F513F] hover:bg-[#3d6b4f] text-white border-none text-sm sm:text-base"
                onClick={() => setShowVRTour(true)}
              >
                <Play className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                VR 투어 시작하기
              </Button>
            </div>
          </div>

          {/* 객실 소개 섹션 */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {rooms.map((room) => (
              <Card 
                key={room.id} 
                className="group relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage({
                  src: room.image,
                  title: room.title,
                  description: room.subTitle
                })}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={room.image}
                    alt={room.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {/* 확대 아이콘 */}
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <div className="w-4 h-4 sm:w-5 sm:h-5">
                        {room.icon}
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base">{room.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-white/90 mb-1">{room.subTitle}</p>
                    <Badge variant="secondary" className="bg-white/20 text-xs">
                      {room.capacity}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center space-y-4 px-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <Badge variant="outline" className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">
              작은방 2개 또는 큰방 1개 선택 가능
            </Badge>
            <Badge variant="outline" className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">
              전 객실 자연 조망
            </Badge>
            <Badge variant="outline" className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">
              프라이빗 공간
            </Badge>
          </div>
          <Button 
            size="lg" 
            className="mt-6 text-sm sm:text-base bg-[#2F513F] hover:bg-[#3d6b4f] text-white border-none" 
            onClick={() => {
              const programsSection = document.getElementById('programs-section')
              if (programsSection) {
                programsSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            지금 바로 예약하기
            <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* 이미지 확대 모달 */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-full w-[95vw] h-[95vh] p-0 m-2">
          {selectedImage && (
            <div className="relative w-full h-full">
              <Image
                src={selectedImage.src}
                alt={selectedImage.title}
                fill
                className="object-contain"
                sizes="100vw"
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg">
                <h3 className="text-lg font-bold">{selectedImage.title}</h3>
                <p className="text-sm opacity-90">{selectedImage.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* VR 투어 모달 */}
      <Dialog open={showVRTour} onOpenChange={setShowVRTour}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-[#2F513F] flex items-center gap-2">
              <Play className="h-6 w-6" />
              360° VR 투어
            </DialogTitle>
            <p className="text-muted-foreground">
              달팽이아지트펜션의 모든 공간을 360도로 둘러보세요
            </p>
          </DialogHeader>
          <div className="flex-1 mx-6 mb-6">
            <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
              {/* VR 투어 iframe - 실제 VR 투어 URL로 교체 필요 */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!4v1701234567890!6m8!1m7!1sCAoSLEFGMVFpcE9fRjBkZUVqSUNiNFFsNjRCSm9SUWJqWGFYWE1SWWJXRi1QU3c2!2m2!1d37.5665!2d126.9780!3f0!4f0!5f0.7820865974627469"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="달팽이아지트펜션 360° VR 투어"
              />
              
              {/* VR 투어 대체 콘텐츠 */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2F513F] to-[#3d6b4f] text-white">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">VR 투어 준비중</h3>
                  <p className="text-white/80 mb-6">곧 360도 VR 투어를 만나보실 수 있습니다</p>
                  <div className="space-y-2 text-sm text-white/70">
                    <p>📍 모든 객실과 공용공간 360도 뷰</p>
                    <p>🏠 실제 공간감을 미리 체험</p>
                    <p>📱 모바일/PC 모두 지원</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
} 