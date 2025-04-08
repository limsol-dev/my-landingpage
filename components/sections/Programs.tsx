"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, GraduationCap, Users, Leaf, Clock, ArrowRight, CheckCircle2, Info, CreditCard, UtensilsCrossed, CalendarCheck } from "lucide-react"
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
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/store/useBookingStore'
import { Program } from '@/types/program'
import { programs } from '@/data/programs'

// 포인트 컬러 상수 추가
const PRIMARY_COLOR = "#2F513F"

export default function Programs() {
  const router = useRouter()
  const setSelectedProgram = useBookingStore((state) => state.setSelectedProgram)
  
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

  const handleBooking = () => {
    setSelectedProgram(selectedProgram)
    setSelectedProgramState(null) // 모달 닫기
    
    // 프로그램 예약하기 섹션으로 스크롤
    const bookingSection = document.getElementById('booking-section')
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' })
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
                        (program.id === "pension-stay" || program.id === selectedProgram?.id) && "ring-2 ring-[#2F513F]"
                      )}
                    >
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={program.image}
                          alt={program.title}
                          fill
                          className="object-cover"
                        />
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
                            <h3 className="font-bold mb-2">{program.title}</h3>
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
                            className="w-full bg-[#2F513F] hover:bg-[#2F513F]/90"
                            onClick={() => setSelectedProgramState(program)}
                          >
                            자세히 보기
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
        <DialogContent className="max-w-lg max-h-[90vh]">
          {selectedProgram && (
            <>
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-lg font-bold">{selectedProgram.title}</DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedProgram.description}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[calc(80vh-8rem)]">
                <div className="space-y-3 pr-4">
                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                    <Image
                      src={selectedProgram.image}
                      alt={selectedProgram.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedProgram.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="font-bold">
                        {selectedProgram.price.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      프로그램 일정
                    </h4>
                    <ul className="text-xs space-y-1">
                      {selectedProgram.details.schedule.map((item, index) => (
                        <li key={index} className="flex gap-1.5 items-center">
                          <div className="h-1 w-1 rounded-full bg-[#2F513F]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      포함 사항
                    </h4>
                    <ul className="grid grid-cols-2 gap-1 text-xs">
                      {selectedProgram.details.includes.map((item, index) => (
                        <li key={index} className="flex gap-1.5 items-center">
                          <div className="h-1 w-1 rounded-full bg-[#2F513F]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" />
                      안내 사항
                    </h4>
                    <ul className="text-xs space-y-1">
                      {selectedProgram.details.notice.map((item, index) => (
                        <li key={index} className="flex gap-1.5 items-center">
                          <div className="h-1 w-1 rounded-full bg-[#2F513F]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-end gap-2 mt-3 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setSelectedProgramState(null)}
                >
                  닫기
                </Button>
                <Button 
                  size="sm"
                  className="h-8 px-3 text-xs bg-[#2F513F] hover:bg-[#2F513F]/90"
                  onClick={handleBooking}
                >
                  예약하기
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
} 