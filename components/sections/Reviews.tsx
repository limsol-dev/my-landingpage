"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Quote, Camera } from "lucide-react"
import Image from "next/image"

type Review = {
  id: string
  author: string
  rating: number
  date: string
  content: string
  room: string
  images?: string[]
  isVerified: boolean
}

export default function Reviews() {
  const reviews: Review[] = [
    {
      id: "1",
      author: "김**",
      rating: 5,
      date: "2024.03.15",
      content: "조용하고 깨끗한 환경에서 편안한 휴식을 취할 수 있었습니다. 특히 아침에 보이는 산 뷰가 너무 좋았어요. 조식도 신선하고 맛있었습니다.",
      room: "디럭스룸",
      images: ["/reviews/review-1-1.jpg", "/reviews/review-1-2.jpg"],
      isVerified: true
    },
    {
      id: "2",
      author: "이**",
      rating: 4,
      date: "2024.03.10",
      content: "가족과 함께 즐거운 시간 보냈습니다. 바베큐 시설이 잘 되어있고, 주변 관광지도 가까워서 좋았어요.",
      room: "스위트룸",
      images: ["/reviews/review-2.jpg"],
      isVerified: true
    },
    {
      id: "3",
      author: "박**",
      rating: 5,
      date: "2024.03.05",
      content: "프리미엄룸의 테라스에서 보는 별이 정말 예뻤어요. 복층 구조라 아이들도 신나했습니다.",
      room: "프리미엄룸",
      isVerified: true
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">이용 후기</h2>
          <p className="text-muted-foreground">
            실제 투숙객들의 생생한 후기를 확인해보세요
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full max-w-[600px] mx-auto grid-cols-4">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="deluxe">디럭스룸</TabsTrigger>
            <TabsTrigger value="suite">스위트룸</TabsTrigger>
            <TabsTrigger value="premium">프리미엄룸</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.author}</span>
                      {review.isVerified && (
                        <Badge variant="secondary">실제 투숙객</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                  </div>
                  <Badge>{review.room}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    <Quote className="h-4 w-4 inline mr-2 text-primary" />
                    {review.content}
                  </p>
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {review.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-video rounded-lg overflow-hidden"
                        >
                          <Image
                            src={image}
                            alt={`Review image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="text-center">
              <Button variant="outline" className="gap-2">
                <Camera className="h-4 w-4" />
                포토 리뷰 더보기
              </Button>
            </div>
          </TabsContent>

          {/* 각 객실 타입별 탭 컨텐츠 */}
          {["deluxe", "suite", "premium"].map((roomType) => (
            <TabsContent key={roomType} value={roomType}>
              {reviews
                .filter((review) => review.room.toLowerCase().includes(roomType))
                .map((review) => (
                  // 리뷰 카드 렌더링 (위와 동일한 구조)
                  <Card key={review.id}>
                    {/* ... 리뷰 카드 내용 ... */}
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
} 