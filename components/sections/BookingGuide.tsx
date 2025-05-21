"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  CreditCard
} from "lucide-react"
import { useState } from "react"
import { useBookingStore } from '@/store/useBookingStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type BookingInfo = {
  date: Date | undefined
  program: string
  totalPrice: number
  addons: {
    [key: string]: number
  }
}

export default function BookingGuide() {
  const selectedProgram = useBookingStore((state) => state.selectedProgram)
  
  const [bookingInfo, setBookingInfo] = useState<BookingInfo>({
    date: new Date(),
    program: selectedProgram?.id || "",
    totalPrice: selectedProgram?.price || 700000,
    addons: {
      "추가 인원": 0,
      "바베큐 세트": 0,
      "조식 추가": 0,
      "가스렌지": 0
    }
  })

  const addons = {
    personnel: {
      id: "추가 인원",
      price: 10000,
      description: "추가 참여자당 10,000원",
      maxQuantity: Infinity
    },
    bbq: {
      id: "바베큐 세트",
      price: 50000,
      description: "기본 세팅 포함",
      maxQuantity: 1
    },
    breakfast: {
      id: "조식 추가",
      price: 15000,
      description: "1인당 15,000원",
      maxQuantity: Infinity
    },
    gasRange: {
      id: "가스렌지",
      price: 10000,
      description: "1개당 10,000원",
      maxQuantity: 2
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
      answer: "체크인 3일 전까지 100% 환불이 가능합니다. 이후 취소 시 수수료가 발생할 수 있습니다."
    },
    {
      id: "program",
      question: "프로그램은 어떻게 신청하나요?",
      answer: "예약 시 원하시는 프로그램을 선택하실 수 있으며, 체크인 후 프론트에서도 신청 가능합니다."
    },
    {
      id: "parking",
      question: "주차는 가능한가요?",
      answer: "네, 무료 주차가 가능합니다. 전기차 충전소도 구비되어 있습니다."
    }
  ]

  // 1인당 요금 계산 함수 추가
  const calculatePerPersonPrice = (totalPrice: number, baseParticipants: number, additionalParticipants: number) => {
    const totalParticipants = baseParticipants + additionalParticipants;
    return Math.floor(totalPrice / totalParticipants);
  };

  // 총 금액 계산 함수 수정
  const calculateTotalPrice = (addonQuantities: Record<string, number>) => {
    const basePrice = selectedProgram?.price || 700000
    
    // 추가 인원 비용
    const personnelCost = addonQuantities["추가 인원"] * addons.personnel.price

    // 기타 옵션 비용
    const optionsCost = Object.entries(addonQuantities).reduce((total, [id, quantity]) => {
      if (id === "추가 인원") return total
      
      const addon = 
        id === "바베큐 세트" ? addons.bbq :
        id === "조식 추가" ? addons.breakfast :
        id === "가스렌지" ? addons.gasRange : null

      if (!addon) return total
      return total + (addon.price * quantity)
    }, 0)

    return basePrice + personnelCost + optionsCost
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
        id === "바베큐 세트" ? addons.bbq :
        id === "조식 추가" ? addons.breakfast :
        id === "가스렌지" ? addons.gasRange : null

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

  const handleBooking = () => {
    alert("예약이 성공적으로 완료되었습니다!")
  }

  // 현재 총 인원 계산 (기본 15인 + 추가 인원)
  const totalParticipants = 15 + (bookingInfo.addons["추가 인원"] || 0);
  
  // 현재 총 금액
  const currentTotalPrice = calculateTotalPrice(bookingInfo.addons);
  
  // 1인당 금액
  const perPersonPrice = calculatePerPersonPrice(
    currentTotalPrice,
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

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 달력 */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">날짜 선택</h3>
                <CalendarComponent
                  mode="single"
                  selected={bookingInfo.date}
                  onSelect={(date) => setBookingInfo({ ...bookingInfo, date })}
                  className="rounded-md border"
                />
                
                {/* 기본 선택 - 스타일 수정 */}
                <div className="mt-6">
                  <h4 className="font-medium mb-4">기본 프로그램</h4>
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
                        펜션 기본인원 15인
                        {bookingInfo.addons["추가 인원"] > 0 && ` + 추가 ${bookingInfo.addons["추가 인원"]}인`}
                      </span>
                      <span className="font-bold text-lg">{currentTotalPrice.toLocaleString()}원</span>
                    </div>
                    <div className="h-2 bg-[#2F513F]/10 rounded-full mt-2">
                      <div 
                        className="h-full bg-[#2F513F] rounded-full" 
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 추가 옵션 - 스타일 수정 */}
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
                            onChange={(e) => handleQuantityChange("추가 인원", parseInt(e.target.value) || 0)}
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

                  {/* 음식 옵션 섹션 */}
                  <div>
                    <h4 className="font-medium mb-3">바베큐 제공 내역</h4>
                    <div className="space-y-3">
                      {Object.entries(bookingInfo.addons).map(([id, quantity]) => {
                        if (id !== "추가 인원") {
                          const addon = 
                            id === "바베큐 세트" ? addons.bbq :
                            id === "조식 추가" ? addons.breakfast :
                            id === "가스렌지" ? addons.gasRange : null

                          if (addon) {
                            return (
                              <div key={id} className="p-3 md:p-4 border rounded-lg bg-background">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm md:text-base truncate">{id}</p>
                                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                                      {addon.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 md:h-8 md:w-8"
                                      onClick={() => handleQuantityChange(id, -1)}
                                    >
                                      -
                                    </Button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={quantity || 0}
                                      onChange={(e) => handleQuantityChange(id, parseInt(e.target.value) || 0)}
                                      className="w-10 md:w-12 h-7 md:h-8 text-center text-sm border rounded-md"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 md:h-8 md:w-8"
                                      onClick={() => handleQuantityChange(id, 1)}
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        }
                        return null;
                      })}
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
                      기본 패키지 (15인)
                    </p>
                    <p className="text-lg font-bold mt-1">
                      700,000원
                    </p>
                  </div>

                  {/* 선택된 추가 옵션 표시 */}
                  {Object.entries(bookingInfo.addons).map(([id, quantity]) => {
                    if (quantity > 0) {
                      const addon = 
                        id === "바베큐 세트" ? addons.bbq :
                        id === "조식 추가" ? addons.breakfast :
                        id === "가스렌지" ? addons.gasRange : null

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
                    예약하기
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