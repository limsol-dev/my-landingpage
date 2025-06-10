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
import { Program } from '@/types/program'
import { programs } from '@/data/programs'

export default function Programs() {
  const setProgramId = useReservationStore((state) => state.setProgramId)
  
  // 초기 선택 프로그램 제거
  const [selectedProgram, setSelectedProgramState] = useState<Program | null>(null)

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
    if (selectedProgram) {
      setProgramId(selectedProgram.id)
      setSelectedProgramState(null) // 모달 닫기
      
      // BookingGuide 섹션으로 스크롤
      const bookingSection = document.getElementById('booking-section')
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section id="programs-section" className="py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">주요 프로그램 소개</h2>
          <p className="text-muted-foreground">
            깊은 산속에서 온전히 나를 위한 특별한 프로그램을 만나보세요
          </p>
        </div>

        <Tabs defaultValue="pension" className="space-y-8">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-transparent border-0 p-0 flex gap-2">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={cn(
                    "px-6 py-2 rounded-full border border-muted-foreground/20 bg-background",
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs
                  .filter(program => category.id === "all" || program.category === category.id)
                  .map((program) => (
                    <Card 
                      key={program.id} 
                      className={cn(
                        "group overflow-hidden border-none shadow-lg relative",
                        (program.id === "pension-stay" || program.id === selectedProgram?.id) && "ring-2 ring-[#2F513F]",
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
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {program.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold">{program.title}</h3>
                              {isRecommended(program.id) && (
                                <Star className="h-4 w-4 text-[#2F513F] fill-[#2F513F]" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{program.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{program.duration}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{program.price.toLocaleString()}원</div>
                              <div className="text-xs text-muted-foreground">1인 {(program.price / program.minParticipants).toLocaleString()}원</div>
                            </div>
                          </div>
                          <Button 
                            className={cn(
                              "w-full",
                              isRecommended(program.id) 
                                ? "bg-gradient-to-r from-[#2F513F] to-[#3d6b4f] hover:from-[#3d6b4f] hover:to-[#4a7b5c] text-white shadow-lg"
                                : "bg-[#2F513F] hover:bg-[#2F513F]/90"
                            )}
                            onClick={() => setSelectedProgramState(program)}
                          >
                            {isRecommended(program.id) ? "추천 프로그램 보기" : "자세히 보기"}
                            <ArrowRight className="ml-2 h-4 w-4" />
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
      <Dialog open={!!selectedProgram} onOpenChange={() => setSelectedProgramState(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedProgram && (
            <>
              {/* 헤더 영역 개선 */}
              <DialogHeader className="pb-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-bold text-[#2F513F]">
                      {selectedProgram.title}
                    </DialogTitle>
                    <DialogDescription className="text-base leading-relaxed">
                      {selectedProgram.description}
                    </DialogDescription>
                  </div>
                  {isRecommended(selectedProgram.id) && (
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
                        <p className="font-semibold">{selectedProgram.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-[#2F513F]" />
                      <div>
                        <p className="text-sm text-muted-foreground">가격</p>
                        <p className="font-semibold">{selectedProgram.price.toLocaleString()}원</p>
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
                      {selectedProgram.details.schedule.map((item, index) => (
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
                      {selectedProgram.details.includes.map((item, index) => (
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
                      {selectedProgram.details.notice.map((item, index) => (
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
                  onClick={() => setSelectedProgramState(null)}
                >
                  닫기
                </Button>
                <Button 
                  className={cn(
                    "flex-1 h-11 text-sm font-medium",
                    isRecommended(selectedProgram.id)
                      ? "bg-gradient-to-r from-[#2F513F] to-[#3d6b4f] hover:from-[#3d6b4f] hover:to-[#4a7b5c] shadow-lg"
                      : "bg-[#2F513F] hover:bg-[#2F513F]/90"
                  )}
                  onClick={handleBooking}
                >
                  {isRecommended(selectedProgram.id) ? "추천 프로그램 예약하기" : "예약하기"}
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