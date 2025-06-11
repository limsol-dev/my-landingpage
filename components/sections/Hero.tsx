"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, CalendarDays, Users, Phone, User } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface HeroProps {
  onBookingClick: () => void
}

export default function Hero({ onBookingClick }: HeroProps) {
  const [isVisible] = useState(true)
  const [showQuickBookingModal, setShowQuickBookingModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    checkIn: "",
    checkOut: "",
    guests: ""
  })

  // 가장 빠른 금요일과 토요일 계산
  const getNextFriday = () => {
    const today = new Date()
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7 // 0이면 다음주 금요일
    const nextFriday = new Date(today)
    nextFriday.setDate(today.getDate() + daysUntilFriday)
    return nextFriday.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  }

  const getNextSaturday = () => {
    const today = new Date()
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7 // 0이면 다음주 토요일
    const nextSaturday = new Date(today)
    nextSaturday.setDate(today.getDate() + daysUntilSaturday)
    return nextSaturday.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  }

  // 실시간 예약 현황
  const bookingStatus = {
    availableRooms: 3,
    todayBookings: 12,
    nextFriday: getNextFriday(),
    nextSaturday: getNextSaturday(),
    isHighSeason: true
  }

  const handleScrollToPrograms = () => {
    const programsSection = document.getElementById('programs-section')
    if (programsSection) {
      programsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleQuickBooking = async () => {
    if (!formData.name || !formData.contact || !formData.checkIn || !formData.checkOut || !formData.guests) {
      alert("모든 항목을 입력해주세요.")
      return
    }

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // 폼 초기화
        setFormData({
          name: "",
          contact: "",
          checkIn: "",
          checkOut: "",
          guests: ""
        })
        
        setShowQuickBookingModal(false)
        setShowSuccessMessage(true)
        
        // 3초 후 성공 메시지 숨기기
        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 3000)
      } else {
        throw new Error('전송 실패')
      }
    } catch (error) {
      console.error('SMS 전송 오류:', error)
      alert('예약 문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <section className="relative min-h-screen flex items-center py-4 sm:py-0">
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
      <div className="container relative z-10 px-4">
        <div className="max-w-[800px] mx-auto text-center text-white space-y-6 sm:space-y-8">
          <div className={cn(
            "space-y-4 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-medium leading-tight px-4">
              서로다른 우리의 이야기가<br />
              피어나는 공간<br />
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-5xl">달팽이 아지트 펜션</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 px-4">
              특별한 추억을 만들 수 있는 프라이빗한 공간
            </p>
          </div>

          {/* CTA 버튼 */}
          <div className="flex flex-col gap-3 justify-center px-4 max-w-sm mx-auto sm:max-w-none sm:flex-row sm:gap-4">
            <Button 
              size="lg" 
              className="bg-[#2F513F] hover:bg-[#2F513F]/90 text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
              onClick={() => setShowQuickBookingModal(true)}
            >
              빠른 예약 문의
              <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
              onClick={handleScrollToPrograms}
            >
              프로그램 둘러보기
            </Button>
          </div>

          {/* 실시간 예약 현황 */}
          <Card className="w-full max-w-sm mx-auto sm:w-fit bg-black/30 backdrop-blur border-white/20">
            <div className="px-4 py-3 sm:px-8 sm:py-4 flex flex-col gap-4 sm:flex-row sm:gap-8">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-300">가장빠른 금요일 가능</p>
                <p className="text-lg sm:text-xl font-bold">{bookingStatus.nextFriday}</p>
              </div>
              <div className="text-center border-t sm:border-l sm:border-t-0 border-white/20 pt-4 sm:pt-0 sm:pl-8">
                <p className="text-xs sm:text-sm text-gray-300">가장 빠른 예약가능 토요일</p>
                <p className="text-lg sm:text-xl font-bold">{bookingStatus.nextSaturday}</p>
              </div>
              {bookingStatus.isHighSeason && (
                <div className="text-center border-t sm:border-l sm:border-t-0 border-white/20 pt-4 sm:pt-0 sm:pl-8">
                  <p className="text-xs sm:text-sm text-white">성수기 안내</p>
                  <p className="text-xs sm:text-sm text-black bg-white/90 px-2 py-1 rounded">예약을 서두르세요!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 빠른 예약 문의 모달 */}
      <Dialog open={showQuickBookingModal} onOpenChange={setShowQuickBookingModal}>
        <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#2F513F]">
              빠른 예약 문의
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                이름 *
              </Label>
              <Input
                id="name"
                placeholder="이름을 입력해주세요"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                연락처 *
              </Label>
              <Input
                id="contact"
                placeholder="010-0000-0000"
                value={formData.contact}
                onChange={(e) => handleInputChange("contact", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn" className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  체크인 *
                </Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => handleInputChange("checkIn", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut" className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  체크아웃 *
                </Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => handleInputChange("checkOut", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                인원수 *
              </Label>
              <Input
                id="guests"
                type="number"
                placeholder="인원수를 입력해주세요"
                min="1"
                max="20"
                value={formData.guests}
                onChange={(e) => handleInputChange("guests", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setShowQuickBookingModal(false)}
              >
                취소
              </Button>
              <Button
                className="flex-1 h-11 bg-[#2F513F] hover:bg-[#2F513F]/90"
                onClick={handleQuickBooking}
              >
                빠른 예약 문의
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="bg-green-50 border-green-200 px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="font-medium">빠른 시일 내로 연락드리겠습니다!</p>
            </div>
          </Card>
        </div>
      )}
    </section>
  )
} 