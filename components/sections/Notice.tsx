"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Megaphone, Calendar, ChevronRight } from "lucide-react"

type Notice = {
  id: string
  title: string
  date: string
  content: string
  isImportant?: boolean
  category: "공지" | "이벤트" | "안내"
}

export default function Notice() {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)

  const notices: Notice[] = [
    {
      id: "1",
      title: "여름 성수기 예약 안내",
      date: "2024.03.15",
      content: `안녕하세요. 힐링 펜션입니다.

2024년 여름 성수기(7/15 ~ 8/15) 예약이 시작되었습니다.

- 성수기 기간 중에는 객실 요금 30% 할증
- 예약 취소 시 특별 위약금 규정 적용
- 바베큐장 이용 시 사전 예약 필수

자세한 사항은 예약실로 문의 부탁드립니다.`,
      isImportant: true,
      category: "공지"
    },
    {
      id: "2",
      title: "봄꽃 여행 패키지 출시",
      date: "2024.03.10",
      content: "봄꽃 시즌을 맞아 특별 패키지를 준비했습니다. 벚꽃 명소 투어와 웰컴 드링크가 포함되어 있습니다.",
      category: "이벤트"
    },
    {
      id: "3",
      title: "객실 정기 소독 안내",
      date: "2024.03.05",
      content: "3월 20일(수) 전 객실 정기 소독이 진행됩니다. 해당 일자 체크인은 16시부터 가능합니다.",
      category: "안내"
    }
  ]

  const categoryColors = {
    공지: "bg-primary",
    이벤트: "bg-green-500",
    안내: "bg-orange-500"
  }

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">공지사항</h2>
          <p className="text-muted-foreground">
            펜션 소식과 이벤트를 확인하세요
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                공지사항
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.map((notice) => (
                <Dialog key={notice.id}>
                  <DialogTrigger asChild>
                    <div 
                      className="flex items-center justify-between p-4 hover:bg-muted rounded-lg cursor-pointer"
                      onClick={() => setSelectedNotice(notice)}
                    >
                      <div className="flex items-start gap-4">
                        <Badge 
                          className={categoryColors[notice.category]}
                        >
                          {notice.category}
                        </Badge>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {notice.title}
                            </p>
                            {notice.isImportant && (
                              <Badge variant="destructive">중요</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {notice.date}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{notice.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {notice.date}
                      </div>
                      <div className="whitespace-pre-line text-muted-foreground">
                        {notice.content}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button variant="outline">
              더보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 