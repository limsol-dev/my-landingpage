"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Quote, ArrowRight } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Story = {
  id: string
  category: "office" | "teacher" | "family"
  author: {
    name: string
    image?: string
    job?: string
    program: string
  }
  rating: number
  content: string
  images?: string[]
  date: string
  tags: string[]
}

export default function Stories() {
  const categories = [
    { id: "all", name: "전체 스토리" },
    { id: "office", name: "직장인 스토리" },
    { id: "teacher", name: "교육자 스토리" },
    { id: "family", name: "가족 스토리" }
  ]

  const stories: Story[] = [
    {
      id: "1",
      category: "office",
      author: {
        name: "김지영",
        job: "IT 기업 직장인",
        program: "디지털 디톡스 프로그램"
      },
      rating: 5,
      content: "바쁜 일상에서 벗어나 온전히 나를 위한 시간을 가질 수 있었어요. 특히 명상 프로그램이 정말 좋았습니다. 마음의 안정을 찾는데 큰 도움이 되었어요.",
      images: ["/images/healing-room.jpg", "/images/living.jpg"],
      date: "2024.03.15",
      tags: ["힐링", "명상", "휴식"]
    },
    {
      id: "2",
      category: "teacher",
      author: {
        name: "이현우",
        job: "중학교 교사",
        program: "교원 힐링 프로그램"
      },
      rating: 5,
      content: "학기 중 쌓인 스트레스를 해소할 수 있었습니다. 같은 교직에 있는 분들과의 대화도 큰 위로가 되었고, 새로운 에너지를 얻어갑니다.",
      images: ["/images/room1.jpg"],
      date: "2024.03.10",
      tags: ["교원", "힐링", "재충전"]
    },
    {
      id: "3",
      category: "family",
      author: {
        name: "박서연",
        program: "가족 힐링 패키지"
      },
      rating: 5,
      content: "아이들과 함께한 특별한 추억이 되었어요. 자연 속에서 다양한 체험을 할 수 있어서 좋았고, 가족 간의 대화도 더 많아졌어요.",
      images: ["/images/room2.jpg"],
      date: "2024.03.05",
      tags: ["가족", "체험", "자연"]
    }
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">실제 참여자 스토리</h2>
          <p className="text-muted-foreground">
            프로그램을 경험한 분들의 진솔한 이야기를 들려드립니다
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-8">
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
              <div className="grid md:grid-cols-3 gap-6">
                {stories
                  .filter(story => category.id === "all" || story.category === category.id)
                  .map((story) => (
                    <Card key={story.id} className="group overflow-hidden border-none shadow-lg">
                      {story.images && story.images.length > 0 && (
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={story.images[0]}
                            alt="Story image"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          {story.images.length > 1 && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-white/90 text-black">
                                +{story.images.length - 1}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={story.author.image} />
                            <AvatarFallback>{story.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{story.author.name}</CardTitle>
                            {story.author.job && (
                              <p className="text-sm text-muted-foreground">
                                {story.author.job}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {story.author.program}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: story.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <div className="relative">
                          <Quote className="h-8 w-8 text-muted-foreground/20 absolute -top-2 -left-2" />
                          <p className="text-muted-foreground relative z-10 pl-6">
                            {story.content}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {story.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="rounded-full">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {story.date}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="group"
          >
            더 많은 스토리 보기
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
} 