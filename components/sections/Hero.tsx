"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function Hero() {
  const [isVisible] = useState(true)

  // 실시간 예약 현황
  const bookingStatus = {
    availableRooms: 3,
    todayBookings: 12,
    nextAvailable: "3월 25일",
    isHighSeason: true
  }

  const handleScrollToPrograms = () => {
    const programsSection = document.getElementById('programs-section')
    if (programsSection) {
      programsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/healing-room.jpg"
          alt="힐링 공간"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container relative z-10">
        <div className="max-w-[800px] mx-auto text-center text-white space-y-8">
          <div className={cn(
            "space-y-4 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <h1 className="text-4xl md:text-6xl font-medium leading-tight">
              서로다른 우리의 이야기가<br />
              피어나는 공간<br />
              달팽이 아지트 펜션
            </h1>
            <p className="text-xl md:text-2xl text-gray-200">
              특별한 추억을 만들 수 있는 프라이빗한 공간
            </p>
          </div>

          {/* CTA 버튼 */}
          <Button 
            size="lg" 
            className="bg-[#2F513F] hover:bg-[#2F513F]/90 text-lg px-8"
            onClick={handleScrollToPrograms}
          >
            프로그램 둘러보기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* 실시간 예약 현황 */}
          <Card className="w-fit mx-auto bg-black/30 backdrop-blur border-white/20">
            <div className="px-8 py-4 flex gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-300">오늘 예약 가능</p>
                <p className="text-3xl font-bold">{bookingStatus.availableRooms}실</p>
              </div>
              <div className="text-center border-l border-white/20 pl-8">
                <p className="text-sm text-gray-300">다음 예약 가능일</p>
                <p className="text-3xl font-bold">{bookingStatus.nextAvailable}</p>
              </div>
              {bookingStatus.isHighSeason && (
                <div className="text-center border-l border-white/20 pl-8">
                  <p className="text-sm text-yellow-400">성수기 안내</p>
                  <p className="text-sm">예약을 서두르세요!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
} 