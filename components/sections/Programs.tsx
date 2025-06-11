"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ArrowRight, CheckCircle2, Info, CalendarCheck, Star, Crown } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { useReservationStore } from '@/store/useReservationStore'
import { useBookingStore } from '@/store/useBookingStore'
import { Program } from '@/types/program'
import { programs } from '@/data/programs'

interface ProgramsProps {
  onBookingClick: () => void
}

export default function Programs({ onBookingClick }: ProgramsProps) {
  const setProgramId = useReservationStore((state) => state.setProgramId)
  const setSelectedProgram = useBookingStore((state) => state.setSelectedProgram)
  
  // 초기 선택 프로그램 제거
  const [selectedProgramModal, setSelectedProgramModal] = useState<Program | null>(null)

  const categories = [
    { id: "all", name: "전체" },
    { id: "pension", name: "펜션" },
    { id: "healing", name: "힐링" },
    { id: "education", name: "교육" },
    { id: "family", name: "가족" },
    { id: "health", name: "건강" }
  ]

  // 추천 프로그램 목록
  const recommendedPrograms = ["pension", "healing-camp", "prototype-workshop"]
  
  // 추천 프로그램인지 확인하는 함수
  const isRecommended = (programId: string) => {
    return recommendedPrograms.includes(programId)
  }

  const handleBooking = () => {
    if (selectedProgramModal) {
      // 프로그램 정보를 BookingStore와 ReservationStore에 저장
      setSelectedProgram(selectedProgramModal)
      setProgramId(selectedProgramModal.id)
      setSelectedProgramModal(null) // 모달 닫기
      
      // 예약 섹션으로 스크롤
      const bookingSection = document.getElementById('booking-section')
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section id="programs-section" className="py-12 sm:py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-12 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold">주요 프로그램 소개</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            깊은 산속에서 온전히 나를 위한 특별한 프로그램을 만나보세요
          </p>
        </div>

        <Tabs defaultValue="pension" className="space-y-8">
          <div className="flex justify-center mb-8 px-4">
            <TabsList className="bg-transparent border-0 p-0 flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={cn(
                    "px-4 py-2 sm:px-6 sm:py-2 rounded-full border border-muted-foreground/20 bg-background text-xs sm:text-sm",
                    "data-[state=active]:bg-[#2F513F] data-[state=active]:text-white",
                    "hover:bg-muted transition-colors"
                  )}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
                {programs
                  .filter(program => category.id === "all" || program.category === category.id)
                  .map((program) => (
                    <Card 
                      key={program.id} 
                      className={cn(
                        "group overflow-hidden border-none shadow-lg relative",
                        (program.id === "pension-stay" || program.id === selectedProgramModal?.id) && "ring-2 ring-[#2F513F]",
                        isRecommended(program.id) && "ring-4 ring-[#2F513F] shadow-xl"
                      )}
                    >
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={program.image}
                          alt={program.title}
                          fill
                          className="object-cover"
                        />
                        {/* 추천 배지 */}
                        {isRecommended(program.id) && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-[#2F513F] to-[#3d6b4f] text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Crown className="h-3 w-3" />
                            <span className="text-xs font-bold">추천</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {program.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-sm sm:text-base">{program.title}</h3>
                              {isRecommended(program.id) && (
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-[#2F513F] fill-[#2F513F]" />
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">{program.description}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                              <span>{program.duration}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm sm:text-base">{program.price.toLocaleString()}원</div>
                              <div className="text-xs text-muted-foreground">1인 {(program.price / program.minParticipants).toLocaleString()}원</div>
                            </div>
                          </div>
                          <Button 
                            className={cn(
                              "w-full text-xs sm:text-sm h-9 sm:h-10",
                              isRecommended(program.id) 
                                ? "bg-gradient-to-r from-[#2F513F] to-[#3d6b4f] hover:from-[#3d6b4f] hover:to-[#4a7b5c] text-white shadow-lg"
                                : "bg-[#2F513F] hover:bg-[#2F513F]/90"
                            )}
                            onClick={() => setSelectedProgramModal(program)}
                          >
                            {isRecommended(program.id) ? "추천 프로그램 보기" : "자세히 보기"}
                            <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* 프로그램 상세 정보 다이얼로그 */}
      <Dialog open={!!selectedProgramModal} onOpenChange={() => setSelectedProgramModal(null)}>
        <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedProgramModal && (
            <>
              {/* 헤더 영역 개선 */}
              <DialogHeader className="pb-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-bold text-[#2F513F]">
                      {selectedProgramModal.title}
                    </DialogTitle>
                    <DialogDescription className="text-base leading-relaxed">
                      {selectedProgramModal.description}
                    </DialogDescription>
                  </div>
                  {isRecommended(selectedProgramModal.id) && (
                    <div className="bg-gradient-to-r from-[#2F513F] to-[#3d6b4f] text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Crown className="h-3 w-3" />
                      <span className="text-xs font-bold">추천</span>
                    </div>
                  )}
                </div>
                
                {/* 기본 정보 카드 */}
                <div className="mt-4 p-4 bg-[#2F513F]/5 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#2F513F]" />
                      <div>
                        <p className="text-sm text-muted-foreground">소요시간</p>
                        <p className="font-semibold">{selectedProgramModal.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-[#2F513F]" />
                      <div>
                        <p className="text-sm text-muted-foreground">가격</p>
                        <p className="font-semibold">{selectedProgramModal.price.toLocaleString()}원</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 py-6">
                {/* 프로그램 일정 */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold flex items-center gap-2 text-[#2F513F]">
                    <CheckCircle2 className="h-5 w-5" />
                    프로그램 일정
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedProgramModal.details.schedule.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#2F513F] mt-2 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 포함 사항 */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold flex items-center gap-2 text-[#2F513F]">
                    <CheckCircle2 className="h-5 w-5" />
                    포함 사항
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedProgramModal.details.includes.map((item: string, index: number) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 안내 사항 */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold flex items-center gap-2 text-[#2F513F]">
                    <Info className="h-5 w-5" />
                    안내 사항
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedProgramModal.details.notice.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 하단 버튼 영역 개선 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1 h-11 text-sm font-medium"
                  onClick={() => setSelectedProgramModal(null)}
                >
                  닫기
                </Button>
                <Button 
                  className={cn(
                    "flex-1 h-11 text-sm font-medium",
                    isRecommended(selectedProgramModal.id)
                      ? "bg-gradient-to-r from-[#2F513F] to-[#3d6b4f] hover:from-[#3d6b4f] hover:to-[#4a7b5c] shadow-lg"
                      : "bg-[#2F513F] hover:bg-[#2F513F]/90"
                  )}
                  onClick={handleBooking}
                >
                  {isRecommended(selectedProgramModal.id) ? "추천 프로그램 예약하기" : "예약하기"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
} 