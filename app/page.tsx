"use client"

import { useState, useEffect } from "react"
import Hero from "@/components/sections/Hero"
import ProgramMatcher from "@/components/sections/ProgramMatcher"
import Programs from "@/components/sections/Programs"
import HealingSpaces from "@/components/sections/HealingSpaces"
import Stories from "@/components/sections/Stories"
import Footer from "@/components/sections/Footer"
import BookingGuide from "@/components/sections/BookingGuide"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings } from './admin/types'
import { supabase } from '@/lib/supabase'
import { useSettingsStore } from '@/store/settingsStore'
import { ReservationProvider } from "@/app/admin/context/ReservationContext"

export default function Page() {
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    message: ''
  })
  const { settings } = useSettingsStore()

  const handleBookingSubmit = () => {
    // 필수 필드 검증
    if (!bookingData.name.trim()) {
      alert('❌ 이름을 입력해주세요!')
      return
    }
    if (!bookingData.phone.trim()) {
      alert('❌ 연락처를 입력해주세요!')
      return
    }
    if (!bookingData.checkIn.trim()) {
      alert('❌ 체크인 날짜를 입력해주세요!')
      return
    }
    if (!bookingData.checkOut.trim()) {
      alert('❌ 체크아웃 날짜를 입력해주세요!')
      return
    }
    if (!bookingData.guests.trim()) {
      alert('❌ 인원수를 입력해주세요!')
      return
    }

    // 예약 완료 처리
    setShowBookingModal(false)
    alert(`✅ 예약 문의가 접수되었습니다!

예약자: ${bookingData.name}
연락처: ${bookingData.phone}
체크인: ${bookingData.checkIn}
체크아웃: ${bookingData.checkOut}
인원: ${bookingData.guests}명

빠른 시일 내에 연락드리겠습니다.`)
    
    // 폼 초기화
    setBookingData({
      name: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      guests: '',
      message: ''
    })
  }

  if (!settings) {
    return <div>로딩 중...</div>
  }

  return (
    <main className="min-h-screen bg-background">
      {/* 1. 히어로 섹션 */}
      <Hero onBookingClick={() => setShowBookingModal(true)} />

      {/* 2. 프로그램 퀵 매칭 */}
      <ProgramMatcher />

      {/* 3. 주요 프로그램 소개 */}
      <Programs onBookingClick={() => setShowBookingModal(true)} />

      {/* 4. 힐링 스페이스 - ReservationProvider로 감싸기 */}
      <ReservationProvider>
        <HealingSpaces onBookingClick={() => setShowBookingModal(true)} />
      </ReservationProvider>

      {/* 5. 실제 참여자 스토리 */}
      <Stories />

      <BookingGuide />

      {/* 푸터 */}
      <Footer />

      {/* 예약 문의 모달 */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>예약 문의</DialogTitle>
            <DialogDescription>
              달팽이 아지트 펜션 예약을 위한 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={bookingData.name}
                onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="예약자 이름"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                연락처 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={bookingData.phone}
                onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                className="col-span-3"
                placeholder="010-0000-0000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checkIn" className="text-right">
                체크인 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={bookingData.checkIn}
                onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checkOut" className="text-right">
                체크아웃 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={bookingData.checkOut}
                onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guests" className="text-right">
                인원수 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="15"
                value={bookingData.guests}
                onChange={(e) => setBookingData(prev => ({ ...prev, guests: e.target.value }))}
                className="col-span-3"
                placeholder="예: 4"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                요청사항
              </Label>
              <Textarea
                id="message"
                value={bookingData.message}
                onChange={(e) => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                className="col-span-3"
                placeholder="특별한 요청사항이 있으시면 입력해주세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowBookingModal(false)}>
              취소
            </Button>
            <Button type="button" onClick={handleBookingSubmit}>
              예약 문의하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
} 