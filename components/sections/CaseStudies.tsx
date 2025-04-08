import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon, User2 } from "lucide-react"

export default function CaseStudies() {
  const reviews = [
    {
      type: "가족여행",
      title: "최고의 가족 휴가",
      author: "김OO님",
      rating: 5,
      metrics: [
        { label: "숙박 기간", value: "2박 3일" },
        { label: "이용 객실", value: "스위트룸" }
      ],
      description: "아이들과 함께한 최고의 추억. 깨끗한 시설과 친절한 서비스에 매우 만족했습니다."
    },
    {
      type: "커플여행",
      title: "로맨틱한 힐링",
      author: "이OO님",
      rating: 5,
      metrics: [
        { label: "숙박 기간", value: "1박 2일" },
        { label: "이용 객실", value: "디럭스룸" }
      ],
      description: "조용하고 프라이빗한 공간에서 편안한 시간을 보냈습니다. 특히 야외 스파가 인상적이었어요."
    },
    {
      type: "친구모임",
      title: "즐거운 우정여행",
      author: "박OO님",
      rating: 5,
      metrics: [
        { label: "숙박 기간", value: "2박 3일" },
        { label: "이용 객실", value: "프리미엄룸" }
      ],
      description: "바베큐 시설이 잘 되어있고 주변 산책로도 너무 좋았습니다. 다음에 또 방문하고 싶어요!"
    }
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">생생한 이용후기</h2>
          <p className="text-muted-foreground">
            실제 투숙객들의 후기를 확인해보세요
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full" />
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">
                  {review.type}
                </Badge>
                <CardTitle className="flex items-center justify-between">
                  <span>{review.title}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User2 className="h-4 w-4" />
                  <span>{review.author}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {review.metrics.map((metric, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="text-muted-foreground">{metric.label}</p>
                      <p className="font-medium">{metric.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {review.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 