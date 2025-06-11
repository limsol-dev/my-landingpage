"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  ArrowRight, 
  CalendarCheck, 
  CalendarIcon,
  Clock, 
  CheckCircle2,
  AlertCircle,
  Info,
  CreditCard,
  User,
  Phone,
  Minus,
  Plus
} from "lucide-react"
import { useState, useEffect } from "react"
import { useBookingStore } from '@/store/useBookingStore'
import { useReservationStore } from '@/store/useReservationStore'
import { programs } from '@/data/programs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type BookingInfo = {
  checkIn: Date | undefined
  checkOut: Date | undefined
  program: string
  totalPrice: number
  addons: {
    [key: string]: number
  }
}

export default function BookingGuide() {
  const selectedProgram = useBookingStore((state) => state.selectedProgram)
  const programId = useReservationStore((state) => state.programId)
  
  // 선택된 프로그램 정보 가져오기
  const currentProgram = programId ? programs.find(p => p.id === programId) : null
  
  // 달력 선택 상태 관리
  const [isSelectingCheckIn, setIsSelectingCheckIn] = useState(true)
  
  const [bookingInfo, setBookingInfo] = useState<BookingInfo>({
    checkIn: undefined, // 기본값을 undefined로 설정
    checkOut: undefined, // 기본값을 undefined로 설정
    program: currentProgram?.id || selectedProgram?.id || "",
    totalPrice: currentProgram?.price || selectedProgram?.price || 700000,
    addons: {
      "추가 인원": 0,
      "그릴 대여": 0,
      "고기만 셋트 (5인 기준)": 0,
      "고기+식사 셋트 (5인 기준)": 0
    }
  })

  const addons = {
    personnel: {
      id: "추가 인원",
      price: 10000,
      description: "1인당 10,000원",
      maxQuantity: Infinity
    },
    grill: {
      id: "그릴 대여",
      price: 30000,
      description: "그릴당 30,000원",
      maxQuantity: 6
    },
    meatOnly: {
      id: "고기만 셋트 (5인 기준)",
      price: 50000,
      description: "5인 기준 50,000원 (1인 10,000원)",
      maxQuantity: Infinity
    },
    meatMeal: {
      id: "고기+식사 셋트 (5인 기준)",
      price: 75000,
      description: "5인 기준 75,000원 (1인 15,000원)",
      maxQuantity: Infinity
    }
  }

  const bookingSteps = [
    {
      id: 1,
      title: "프로그램 선택",
      description: "원하시는 프로그램을 선택해주세요",
      icon: <CalendarCheck className="h-8 w-8" />
    },
    {
      id: 2,
      title: "날짜 선택",
      description: "희망하시는 날짜를 선택해주세요",
      icon: <CalendarIcon className="h-8 w-8" />
    },
    {
      id: 3,
      title: "예약정보 입력",
      description: "필요한 정보를 입력해주세요",
      icon: <Clock className="h-8 w-8" />
    },
    {
      id: 4,
      title: "결제 및 확정",
      description: "결제 후 예약이 확정됩니다",
      icon: <CreditCard className="h-8 w-8" />
    }
  ]

  const faqs = [
    {
      id: "check-in",
      question: "체크인/체크아웃 시간은 언제인가요?",
      answer: "체크인은 오후 3시부터, 체크아웃은 오전 11시까지입니다."
    },
    {
      id: "cancellation",
      question: "예약 취소는 언제까지 가능한가요?",
      answer: "체크인 14일 전까지 100% 환불이 가능합니다!"
    },
    {
      id: "program",
      question: "프로그램은 어떻게 신청하나요?",
      answer: "예약 시 원하시는 프로그램을 선택하실 수 있습니다!"
    },
    {
      id: "parking",
      question: "주차는 가능한가요?",
      answer: "네, 무료 주차가 가능합니다. 주차는 100m위에 파란 창고 앞쪽에 넗은 공터에도 주차가능합니다."
    }
  ]

  // 1인당 요금 계산 함수 추가
  const calculatePerPersonPrice = (totalPrice: number, baseParticipants: number, additionalParticipants: number) => {
    const totalParticipants = baseParticipants + additionalParticipants;
    return Math.floor(totalPrice / totalParticipants);
  };

  // 총 금액 계산 함수 수정
  const calculateTotalPrice = (addonQuantities: Record<string, number>) => {
    const basePrice = currentProgram?.price || selectedProgram?.price || 700000
    
    // 모든 옵션 비용 계산
    const optionsCost = Object.entries(addonQuantities).reduce((total, [id, quantity]) => {
      const addon = 
        id === "추가 인원" ? addons.personnel :
        id === "그릴 대여" ? addons.grill :
        id === "고기만 셋트 (5인 기준)" ? addons.meatOnly :
        id === "고기+식사 셋트 (5인 기준)" ? addons.meatMeal : null

      if (!addon) return total
      return total + (addon.price * quantity)
    }, 0)

    return basePrice + optionsCost
  };

  // handleQuantityChange 함수 수정
  const handleQuantityChange = (id: string, change: number) => {
    const newQuantities = { ...bookingInfo.addons }
    let newQuantity = (newQuantities[id] || 0) + change

    if (newQuantity < 0) {
      newQuantity = 0
    } else {
      const addon = 
        id === "추가 인원" ? addons.personnel :
        id === "그릴 대여" ? addons.grill :
        id === "고기만 셋트 (5인 기준)" ? addons.meatOnly :
        id === "고기+식사 셋트 (5인 기준)" ? addons.meatMeal : null

      if (addon && newQuantity > addon.maxQuantity) {
        newQuantity = addon.maxQuantity
      }
    }

    newQuantities[id] = newQuantity
    setBookingInfo({
      ...bookingInfo,
      addons: newQuantities,
      totalPrice: calculateTotalPrice(newQuantities)
    })
  };

  // 직접 수량 설정 함수 추가
  const handleQuantitySet = (id: string, value: number) => {
    const newQuantities = { ...bookingInfo.addons }
    let newQuantity = value

    if (newQuantity < 0) {
      newQuantity = 0
    } else {
      const addon = 
        id === "추가 인원" ? addons.personnel :
        id === "그릴 대여" ? addons.grill :
        id === "고기만 셋트 (5인 기준)" ? addons.meatOnly :
        id === "고기+식사 셋트 (5인 기준)" ? addons.meatMeal : null

      if (addon && newQuantity > addon.maxQuantity) {
        newQuantity = addon.maxQuantity
      }
    }

    newQuantities[id] = newQuantity
    setBookingInfo({
      ...bookingInfo,
      addons: newQuantities,
      totalPrice: calculateTotalPrice(newQuantities)
    })
  };

  // 달력 날짜 선택 핸들러 - 체크인 날짜 재클릭 불가
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    
    if (!bookingInfo.checkIn) {
      // 첫 번째 클릭: 체크인 날짜 선택 -> 기본 1박2일 설정
      const checkOutDate = new Date(date.getTime() + 24 * 60 * 60 * 1000) // 1박2일 (다음날)
      setBookingInfo(prev => ({
        ...prev,
        checkIn: date,
        checkOut: checkOutDate
      }))
      setIsSelectingCheckIn(false) // 다음은 체크아웃 선택
    } else if (date.getTime() === bookingInfo.checkIn.getTime()) {
      // 체크인 날짜를 다시 클릭한 경우: 아무것도 하지 않음
      return
    } else {
      // 다른 날짜 클릭: 체크아웃 날짜 변경 또는 새로운 체크인으로 리셋
      if (date > bookingInfo.checkIn) {
        // 체크인 이후 날짜: 체크아웃으로 설정
        setBookingInfo(prev => ({
          ...prev,
          checkOut: date
        }))
      } else {
        // 체크인 이전 날짜: 새로운 체크인으로 리셋 -> 기본 1박2일
        const checkOutDate = new Date(date.getTime() + 24 * 60 * 60 * 1000) // 1박2일 (다음날)
        setBookingInfo(prev => ({
          ...prev,
          checkIn: date,
          checkOut: checkOutDate
        }))
        setIsSelectingCheckIn(false)
      }
    }
  }
  
  // 숙박 일수 계산
  const calculateNights = () => {
    if (!bookingInfo.checkIn || !bookingInfo.checkOut) return 1 // 기본 1박으로 설정
    const timeDiff = bookingInfo.checkOut.getTime() - bookingInfo.checkIn.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }
  
  // 날짜 비활성화 로직
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 오늘 이전 날짜는 모두 비활성화
    if (date < today) return true
    
    // 체크아웃 선택 중일 때는 체크인 날짜 이전은 비활성화
    if (!isSelectingCheckIn && bookingInfo.checkIn) {
      return date <= bookingInfo.checkIn
    }
    
    return false
  }

  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookerInfo, setBookerInfo] = useState({
    name: '',
    contact: ''
  })
  const [showAccountInfo, setShowAccountInfo] = useState(false)

  const handleBooking = () => {
    setShowBookingModal(true)
  }

  const handleFinalBooking = () => {
    if (!bookerInfo.name || !bookerInfo.contact) {
      alert("예약자 정보를 모두 입력해주세요.")
      return
    }
    
    alert("예약이 성공적으로 완료되었습니다!")
    setShowBookingModal(false)
    setBookerInfo({ name: '', contact: '' })
  }

  // 현재 총 인원 계산 (기본 15인 + 추가 인원)
  const totalParticipants = 15 + (bookingInfo.addons["추가 인원"] || 0);
  
  // 현재 총 금액
  const currentTotalPrice = calculateTotalPrice(bookingInfo.addons);
  
  // 1인당 금액 (숙박일수 반영)
  const totalPriceWithNights = currentTotalPrice * calculateNights()
  const perPersonPrice = calculatePerPersonPrice(
    totalPriceWithNights,
    15,
    bookingInfo.addons["추가 인원"] || 0
  );

  return (
    <>
      {/* 예약 단계 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {bookingSteps.map(step => (
          <div key={step.id} className="flex items-center gap-2 p-3">
            <div className="shrink-0">
              {step.icon}
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-sm md:text-base truncate">{step.title}</h4>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 실시간 예약 현황 섹션 */}
      <section id="booking-section" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">프로그램 예약하기</h2>
            <p className="text-muted-foreground">
              원하시는 날짜와 프로그램을 선택하여 예약해주세요
            </p>
          </div>

          {/* 선택된 프로그램 표시 */}
          {(selectedProgram || currentProgram) && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="border-[#2F513F] bg-gradient-to-r from-[#2F513F]/5 to-[#3d6b4f]/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-[#2F513F] rounded-full"></div>
                    <h3 className="text-lg font-bold text-[#2F513F]">선택된 프로그램</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2">
                      <h4 className="text-xl font-bold mb-2">
                        {selectedProgram?.title || currentProgram?.title}
                      </h4>
                      <p className="text-muted-foreground mb-3">
                        {selectedProgram?.description || currentProgram?.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedProgram?.tags || currentProgram?.tags || []).map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-[#2F513F]/10 text-[#2F513F]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#2F513F] mb-1">
                        {(selectedProgram?.price || currentProgram?.price || 700000).toLocaleString()}원
                      </div>
                      <div className="text-sm text-muted-foreground">
                        기본 15인 기준
                      </div>
                      <div className="text-sm text-muted-foreground">
                        소요시간: {selectedProgram?.duration || currentProgram?.duration || "1박 2일"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 프로그램 미선택 시 안내 */}
          {!selectedProgram && !currentProgram && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Info className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      프로그램을 선택해주세요
                    </h3>
                    <p className="text-orange-600 mb-4">
                      먼저 상단의 프로그램 소개에서 원하시는 프로그램을 선택해주세요.
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      onClick={() => {
                        const programsSection = document.getElementById('programs-section')
                        if (programsSection) {
                          programsSection.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                    >
                      프로그램 선택하러 가기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 달력 */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">날짜 선택</h3>
                <div className="space-y-6">
                  {/* 날짜 선택 헤더 */}
                  <div className="flex items-center justify-center gap-8 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <label className="text-sm text-gray-600 font-medium">체크인</label>
                      <div className="mt-1 px-4 py-2 bg-white rounded-lg border border-gray-200 min-w-[120px]">
                        <span className="text-lg font-semibold">
                          {bookingInfo.checkIn ? 
                            bookingInfo.checkIn.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) 
                            : '날짜 선택'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                      {bookingInfo.checkIn && bookingInfo.checkOut && (
                        <span className="text-sm font-medium text-[#2F513F] mt-1">
                          {calculateNights()}박 {calculateNights() + 1}일
                        </span>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <label className="text-sm text-gray-600 font-medium">체크아웃</label>
                      <div className="mt-1 px-4 py-2 bg-white rounded-lg border border-gray-200 min-w-[120px]">
                        <span className="text-lg font-semibold">
                          {bookingInfo.checkOut ? 
                            bookingInfo.checkOut.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) 
                            : '날짜 선택'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 선택 모드 안내 - 강조된 스타일 */}
                  {!bookingInfo.checkIn ? (
                    // 기본 상태: 체크인 날짜 선택 강조
                    <div className="text-center p-4 bg-gradient-to-r from-[#2F513F] to-[#3d6b4f] rounded-lg shadow-lg animate-pulse">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CalendarIcon className="h-6 w-6 text-white" />
                        <span className="text-lg font-bold text-white">
                          체크인 날짜를 선택해주세요!!
                        </span>
                      </div>
                      <p className="text-sm text-green-100">
                        원하시는 체크인 날짜를 달력에서 클릭해주세요
                      </p>
                    </div>
                  ) : !bookingInfo.checkOut ? (
                    // 체크인 선택됨: 체크아웃 날짜 선택 안내
                    <div className="text-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        <span className="text-base font-semibold text-blue-800">
                          체크아웃 날짜를 선택해주세요
                        </span>
                      </div>
                      <p className="text-sm text-blue-600">
                        체크인 날짜 이후의 날짜를 선택해주세요
                      </p>
                    </div>
                  ) : (
                    // 모두 선택됨: 완료 상태
                    <div className="text-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-base font-semibold text-green-800">
                          날짜 선택 완료!
                        </span>
                      </div>
                      <p className="text-sm text-green-600">
                        날짜를 다시 선택하려면 아래 날짜 선택 초기화 클릭
                      </p>
                    </div>
                  )}
                  
                  {/* 개선된 달력 */}
                  <div className="calendar-container">
                    <CalendarComponent
                      mode="range"
                      selected={{
                        from: bookingInfo.checkIn,
                        to: bookingInfo.checkOut
                      }}
                      key={`${bookingInfo.checkIn?.getTime()}-${bookingInfo.checkOut?.getTime()}`}
                      onSelect={(range) => {
                        if (range?.from && !range?.to) {
                          handleDateSelect(range.from)
                        }
                        if (range?.to && range.from && bookingInfo.checkIn) {
                          setBookingInfo(prev => ({
                            ...prev,
                            checkOut: range.to!
                          }))
                        }
                      }}
                      disabled={isDateDisabled}
                      numberOfMonths={1}
                      className="rounded-lg border border-gray-200 p-4"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-lg font-semibold",
                        nav: "space-x-1 flex items-center",
                        nav_button: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        day_selected: "bg-[#2F513F] text-white hover:bg-[#2F513F] hover:text-white focus:bg-[#2F513F] focus:text-white font-bold",
                        day_range_start: "bg-[#2F513F] text-white hover:bg-[#2F513F] hover:text-white focus:bg-[#2F513F] focus:text-white font-bold",
                        day_range_end: "bg-[#2F513F] text-white hover:bg-[#2F513F] hover:text-white focus:bg-[#2F513F] focus:text-white font-bold",
                        day_range_middle: "aria-selected:bg-[#2F513F]/10 aria-selected:text-[#2F513F]",
                        day_today: "bg-accent text-accent-foreground font-semibold relative before:absolute before:top-0 before:right-0 before:w-2 before:h-2 before:bg-red-500 before:rounded-full before:border before:border-white",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                  
                  {/* 빠른 선택 버튼들 - 체크인 날짜 기준 */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="text-sm text-gray-600 font-medium mr-2">빠른 선택:</span>
                    {[1, 2, 3, 7].map((days) => (
                      <button
                        key={days}
                        onClick={() => {
                          // 체크인 날짜가 있으면 그 날짜를 기준으로, 없으면 오늘 날짜를 기준으로
                          let baseDate
                          if (bookingInfo.checkIn) {
                            baseDate = new Date(bookingInfo.checkIn.getTime()) // 기존 체크인 날짜 복사
                          } else {
                            baseDate = new Date() // 오늘 날짜
                            baseDate.setHours(0, 0, 0, 0) // 시간을 0으로 설정
                          }
                          
                          const checkOutDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)
                          
                          setBookingInfo(prev => ({
                            ...prev,
                            checkIn: baseDate,
                            checkOut: checkOutDate
                          }))
                          setIsSelectingCheckIn(false)
                        }}
                        className={`px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-[#2F513F] hover:text-white hover:border-[#2F513F] transition-colors ${
                          days === 1 ? 'bg-[#2F513F] text-white border-[#2F513F] font-semibold' : ''
                        }`}
                      >
                        {days}박{days + 1}일
                      </button>
                    ))}
                  </div>
                  
                  {/* 날짜 초기화 버튼 */}
                  {bookingInfo.checkIn && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setBookingInfo(prev => ({
                            ...prev,
                            checkIn: undefined,
                            checkOut: undefined
                          }))
                          setIsSelectingCheckIn(true)
                        }}
                        className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors"
                      >
                        날짜 선택 초기화
                      </button>
                    </div>
                  )}

                </div>
                
                {/* 선택된 프로그램 표시 */}
                {currentProgram && (
                  <div className="mt-6 p-4 bg-[#2F513F]/10 border border-[#2F513F]/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-[#2F513F]" />
                      <span className="text-sm font-medium text-[#2F513F]">선택된 프로그램</span>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{currentProgram.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{currentProgram.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">기본 가격</span>
                      <span className="font-bold text-lg">{currentProgram.price.toLocaleString()}원</span>
                    </div>
                  </div>
                )}

                {/* 기본 선택 - 스타일 수정 */}
                <div className="mt-6">
                  <h4 className="font-medium mb-4">숙박 및 추가 옵션</h4>
                  <div className="p-4 bg-[#2F513F]/5 rounded-lg">
                    {/* 총 예약인원과 1인당 요금을 같은 줄에 표시 */}
                    <div className="mb-3 pb-3 border-b border-[#2F513F]/10 flex justify-between items-center">
                      <span className="text-sm font-medium">
                        총 예약인원 {totalParticipants}인
                      </span>
                      <span className="text-sm text-muted-foreground">
                        1인당 {perPersonPrice.toLocaleString()}원
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">
                        {currentProgram ? `${currentProgram.title} (${calculateNights()}박)` : `펜션기본15인 (${calculateNights()}박)`}
                        {bookingInfo.addons["추가 인원"] > 0 && ` + 추가 ${bookingInfo.addons["추가 인원"]}인`}
                      </span>
                      <span className="font-bold text-lg">{(currentTotalPrice * calculateNights()).toLocaleString()}원</span>
                    </div>
                    <div className="h-2 bg-[#2F513F]/10 rounded-full mt-2">
                      <div 
                        className="h-full bg-[#2F513F] rounded-full" 
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 추가 옵션 - 인원 및 저녁서비스 */}
                <div className="mt-6 space-y-6">
                  {/* 추가 인원 섹션 */}
                  <div>
                    <h4 className="font-medium mb-3">추가 인원</h4>
                    <div className="p-3 md:p-4 border rounded-lg bg-background">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">{addons.personnel.id}</p>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {addons.personnel.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 md:h-8 md:w-8"
                            onClick={() => handleQuantityChange("추가 인원", -1)}
                          >
                            -
                          </Button>
                          <input
                            type="number"
                            min="0"
                            value={bookingInfo.addons["추가 인원"] || 0}
                            onChange={(e) => handleQuantitySet("추가 인원", parseInt(e.target.value) || 0)}
                            className="w-10 md:w-12 h-7 md:h-8 text-center text-sm border rounded-md"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 md:h-8 md:w-8"
                            onClick={() => handleQuantityChange("추가 인원", 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 저녁 제공 서비스 섹션 */}
                  <div>
                    <h4 className="font-medium mb-3">저녁 제공 서비스</h4>
                    <div className="space-y-3">
                      {/* 그릴 대여 */}
                      <div className="p-3 md:p-4 border rounded-lg bg-background">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm md:text-base truncate">{addons.grill.id}</p>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">
                              {addons.grill.description}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">최대 {addons.grill.maxQuantity}개</p>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => handleQuantityChange("그릴 대여", -1)}
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              min="0"
                              max={addons.grill.maxQuantity}
                              value={bookingInfo.addons["그릴 대여"] || 0}
                              onChange={(e) => handleQuantitySet("그릴 대여", parseInt(e.target.value) || 0)}
                              className="w-10 md:w-12 h-7 md:h-8 text-center text-sm border rounded-md"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => handleQuantityChange("그릴 대여", 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* 고기만 셋트 (5인 기준) */}
                      <div className="p-3 md:p-4 border rounded-lg bg-background">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm md:text-base truncate">{addons.meatOnly.id}</p>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">
                              {addons.meatOnly.description}
                            </p>
                            {bookingInfo.addons["고기만 셋트 (5인 기준)"] > 0 && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">
                                총 {bookingInfo.addons["고기만 셋트 (5인 기준)"] * 5}인분
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => handleQuantityChange("고기만 셋트 (5인 기준)", -1)}
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              min="0"
                              value={bookingInfo.addons["고기만 셋트 (5인 기준)"] || 0}
                              onChange={(e) => handleQuantitySet("고기만 셋트 (5인 기준)", parseInt(e.target.value) || 0)}
                              className="w-10 md:w-12 h-7 md:h-8 text-center text-sm border rounded-md"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => handleQuantityChange("고기만 셋트 (5인 기준)", 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* 고기+식사 셋트 (5인 기준) */}
                      <div className="p-3 md:p-4 border rounded-lg bg-background">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm md:text-base truncate">{addons.meatMeal.id}</p>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">
                              {addons.meatMeal.description}
                            </p>
                            {bookingInfo.addons["고기+식사 셋트 (5인 기준)"] > 0 && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">
                                총 {bookingInfo.addons["고기+식사 셋트 (5인 기준)"] * 5}인분
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => handleQuantityChange("고기+식사 셋트 (5인 기준)", -1)}
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              min="0"
                              value={bookingInfo.addons["고기+식사 셋트 (5인 기준)"] || 0}
                              onChange={(e) => handleQuantitySet("고기+식사 셋트 (5인 기준)", parseInt(e.target.value) || 0)}
                              className="w-10 md:w-12 h-7 md:h-8 text-center text-sm border rounded-md"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8"
                              onClick={() => handleQuantityChange("고기+식사 셋트 (5인 기준)", 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 예약 정보 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* 요금 안내 버튼 */}
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 text-[#2F513F] border-[#2F513F] hover:bg-[#2F513F]/5"
                    onClick={() => document.getElementById('price-info-dialog')?.click()}
                  >
                    <Info className="h-4 w-4" />
                    요금 안내 자세히 보기
                  </Button>

                  <h3 className="font-semibold">예약 정보</h3>
                  
                  {/* 기본 요금 */}
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      펜션기본15인
                    </p>
                    <p className="text-lg font-bold mt-1">
                      700,000원
                    </p>
                  </div>

                  {/* 선택된 추가 옵션 표시 */}
                  {Object.entries(bookingInfo.addons).map(([id, quantity]) => {
                    if (quantity > 0) {
                      const addon = 
                        id === "추가 인원" ? addons.personnel :
                        id === "그릴 대여" ? addons.grill :
                        id === "고기만 셋트 (5인 기준)" ? addons.meatOnly :
                        id === "고기+식사 셋트 (5인 기준)" ? addons.meatMeal : null

                      if (addon) {
                        return (
                          <div key={id} className="p-3 md:p-4 bg-muted rounded-lg">
                            <div className="flex justify-between items-center gap-2">
                              <div className="min-w-0">
                                <p className="text-xs md:text-sm text-muted-foreground truncate">{id}</p>
                                <p className="text-xs md:text-sm truncate">수량: {quantity}개</p>
                              </div>
                              <p className="font-medium text-sm md:text-base shrink-0">
                                {(addon.price * quantity).toLocaleString()}원
                              </p>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })}

                  {/* 총 결제 금액 */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span>총 결제 금액</span>
                      <span className="text-xl font-bold">
                        {currentTotalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-[#2F513F] hover:bg-[#2F513F]/90"
                    onClick={handleBooking}
                  >
                    예약 확정하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 섹션 */}
      <section className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">자주 묻는 질문</h2>
            <p className="text-muted-foreground">
              고객님들이 자주 문의하시는 내용을 모았습니다
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 문의하기 섹션 */}
      <section className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">문의하기</h2>
            <p className="text-muted-foreground">
              궁금하신 점이 있으시다면 언제든 문의해주세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-6">상담 채널</h3>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    카카오톡 채널
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    실시간 채팅
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">전화 문의</p>
                    <p className="text-2xl font-bold mt-1">1544-0000</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      평일 09:00 - 18:00<br />
                      주말 및 공휴일 10:00 - 17:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-6">예약 관련 안내</h3>
                <Tabs defaultValue="checkin" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="checkin">체크인/아웃</TabsTrigger>
                    <TabsTrigger value="refund">환불정책</TabsTrigger>
                    <TabsTrigger value="etc">기타안내</TabsTrigger>
                  </TabsList>
                  <TabsContent value="checkin" className="space-y-4">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      체크인: 오후 3시 이후
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      체크아웃: 오전 11시까지
                    </p>
                  </TabsContent>
                  <TabsContent value="refund" className="space-y-4">
                    <p className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      체크인 3일 전까지: 100% 환불
                    </p>
                    <p className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      체크인 1일 전까지: 50% 환불
                    </p>
                  </TabsContent>
                  <TabsContent value="etc" className="space-y-4">
                    <p className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      반려동물 동반 불가
                    </p>
                    <p className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      전 객실 금연
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 예약 확정 Dialog */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#2F513F]">
              예약 정보 확인
            </DialogTitle>
            <DialogDescription className="text-center">
              예약 정보를 확인하고 예약자 정보를 입력해주세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* 예약 정보 요약 */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                예약 정보 요약
              </h3>
              <div className="space-y-3 text-sm">
                {/* 기본 정보 */}
                <div className="space-y-2 pb-3 border-b">
                  <div className="flex justify-between">
                    <span>프로그램:</span>
                    <span className="font-medium">
                      {currentProgram?.title || selectedProgram?.title || "기본 프로그램"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>체크인:</span>
                    <span className="font-medium">
                      {bookingInfo.checkIn?.toLocaleDateString('ko-KR') || "미선택"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>체크아웃:</span>
                    <span className="font-medium">
                      {bookingInfo.checkOut?.toLocaleDateString('ko-KR') || "미선택"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>총 예약인원:</span>
                    <span className="font-medium text-[#2F513F]">{totalParticipants}명</span>
                  </div>
                </div>

                {/* 숙박 비용 */}
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">📍 숙박 비용</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>펜션기본15인 ({calculateNights()}박):</span>
                      <span className="font-medium">{((currentProgram?.price || selectedProgram?.price || 700000) * calculateNights()).toLocaleString()}원</span>
                    </div>
                    {bookingInfo.addons["추가 인원"] > 0 && (
                      <div className="flex justify-between">
                        <span>추가 인원 {bookingInfo.addons["추가 인원"]}명 ({calculateNights()}박):</span>
                        <span className="font-medium">{(bookingInfo.addons["추가 인원"] * addons.personnel.price * calculateNights()).toLocaleString()}원</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-blue-800">
                        <span>숙박 합계:</span>
                        <span>{(((currentProgram?.price || selectedProgram?.price || 700000) + (bookingInfo.addons["추가 인원"] || 0) * addons.personnel.price) * calculateNights()).toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 추가 옵션 비용 */}
                {Object.entries(bookingInfo.addons).some(([id, quantity]) => quantity > 0 && id !== "추가 인원") && (
                  <div className="bg-orange-50 p-3 rounded">
                    <h4 className="font-semibold text-orange-800 mb-2">🔥 추가 옵션</h4>
                    <div className="space-y-1">
                      {Object.entries(bookingInfo.addons).map(([id, quantity]) => {
                        if (quantity > 0 && id !== "추가 인원") {
                          const addon = 
                            id === "그릴 대여" ? addons.grill :
                            id === "고기만 셋트 (5인 기준)" ? addons.meatOnly :
                            id === "고기+식사 셋트 (5인 기준)" ? addons.meatMeal : null
                          
                          if (addon) {
                            return (
                              <div key={id} className="flex justify-between">
                                <span>{id} {quantity}개:</span>
                                <span className="font-medium">{(addon.price * quantity).toLocaleString()}원</span>
                              </div>
                            )
                          }
                        }
                        return null
                      })}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-orange-800">
                          <span>옵션 합계:</span>
                          <span>
                            {Object.entries(bookingInfo.addons).reduce((total, [id, quantity]) => {
                              if (id !== "추가 인원" && quantity > 0) {
                                const addon = 
                                  id === "그릴 대여" ? addons.grill :
                                  id === "고기만 셋트 (5인 기준)" ? addons.meatOnly :
                                  id === "고기+식사 셋트 (5인 기준)" ? addons.meatMeal : null
                                return total + (addon ? addon.price * quantity : 0)
                              }
                              return total
                            }, 0).toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 최종 금액 */}
                <div className="border-t pt-3 mt-4 bg-green-50 p-3 rounded">
                  <div className="flex justify-between text-xl font-bold text-[#2F513F] mb-2">
                    <span>총 결제 금액:</span>
                    <span>{totalPriceWithNights.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-green-700">
                    <span>1인당 금액:</span>
                    <span>{perPersonPrice.toLocaleString()}원</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 text-center">
                    * {calculateNights()}박 {calculateNights() + 1}일 기준 (총 {totalParticipants}명)
                  </div>
                </div>
              </div>
            </div>

            {/* 예약자 정보 입력 */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-[#2F513F]" />
                예약자 정보
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="booker-name">예약자 이름 *</Label>
                  <Input
                    id="booker-name"
                    placeholder="예약자 이름을 입력해주세요"
                    value={bookerInfo.name}
                    onChange={(e) => setBookerInfo({...bookerInfo, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="booker-contact">연락처 *</Label>
                  <Input
                    id="booker-contact"
                    placeholder="연락처를 입력해주세요 (010-0000-0000)"
                    value={bookerInfo.contact}
                    onChange={(e) => setBookerInfo({...bookerInfo, contact: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 결제 안내 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">결제 안내</span>
              </div>
              <p className="text-sm text-blue-700">
                예약 확정 후 계좌 정보를 확인하시고 입금해주세요.<br/>
                입금 확인 후 예약이 최종 완료됩니다.
              </p>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAccountInfo(true)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                입금계좌보기
              </Button>
              <Button
                className="flex-1 bg-[#2F513F] hover:bg-[#2F513F]/90"
                onClick={handleFinalBooking}
              >
                예약 완료
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 입금계좌 정보 Dialog */}
      <Dialog open={showAccountInfo} onOpenChange={setShowAccountInfo}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-[#2F513F]">
              입금계좌 정보
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/30 p-4 rounded-lg text-center">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">입금 은행</p>
                <p className="text-lg font-bold">농협</p>
                
                <p className="text-sm text-muted-foreground mt-4">계좌번호</p>
                <p className="text-xl font-bold">351-0322-8946-53</p>
                
                <p className="text-sm text-muted-foreground mt-4">예금주</p>
                <p className="text-lg font-bold">임솔</p>
                
                <div className="mt-6 p-3 bg-yellow-50 rounded border">
                  <p className="text-sm font-medium text-yellow-800">입금 금액</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {totalPriceWithNights.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 입금자명은 예약자명과 동일하게 해주세요</p>
              <p>• 예약 확정하기 눌러주시면 예약 확인 문자가 발송됩니다</p>
              <p>• 문의: 010-8531-9531</p>
            </div>
            
            <Button 
              className="w-full bg-[#2F513F] hover:bg-[#2F513F]/90"
              onClick={() => setShowAccountInfo(false)}
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog 컴포넌트 추가 */}
      <Dialog>
        <DialogTrigger asChild>
          <button id="price-info-dialog" className="hidden">
            요금 안내
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              달팽이 아지트 펜션
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* 1. 펜션 요금 */}
            <div className="space-y-2">
              <h3 className="font-semibold">1. 펜션 요금</h3>
              <div className="pl-4 space-y-1 text-sm">
                <p>• 기준 15인: 700,000원</p>
                <p>• 추가 인원: 1인당 10,000원</p>
                <p className="text-muted-foreground text-xs">
                  (입실 전 인원 변동 시 차액 환불 처리)
                </p>
              </div>
            </div>

            {/* 2. 바베큐 */}
            <div className="space-y-2">
              <h3 className="font-semibold">2. 바베큐 (최대 6개)</h3>
              <div className="pl-4 space-y-1 text-sm">
                <p>• 그릴당 30,000원</p>
                <p>• 제공: 숯 + 그릴 + 토치</p>
                <p>• 장소: 펜션 앞 공간</p>
                <p className="text-muted-foreground text-xs mt-2">
                  * 우천 시 가스버너 + 불판 + 부탄가스로 대체됩니다
                </p>
              </div>
            </div>

            {/* 3. 가스버너 */}
            <div className="space-y-2">
              <h3 className="font-semibold">3. 가스버너 대여 (최대 5개)</h3>
              <div className="pl-4 space-y-1 text-sm">
                <p>• 개당 10,000원</p>
                <p>• 제공: 가스버너 + 가스 1개</p>
              </div>
            </div>

            {/* 4. 예약 안내 */}
            <div className="space-y-2">
              <h3 className="font-semibold">4. 예약 안내</h3>
              <p className="text-sm">
                예약은 구글 설문지 작성 후 계좌 입금 시 예약 확인 문자가 발송됩니다.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 