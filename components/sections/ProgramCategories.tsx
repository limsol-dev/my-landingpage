"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function ProgramCategories() {
  const router = useRouter()

  const categories = [
    {
      id: "pension",
      title: "펜션 숙박",
      description: "15인 기준의 넓은 공간에서 편안한 휴식",
      image: "/images/pension-stay.jpg",
      program: "숙박객 전용 패키지",
      price: "700,000원",
      tags: ["1박 2일", "15인 기준", "조식 포함"],
      isRecommended: true
    },
    {
      id: "healing",
      title: "힐링 프로그램",
      description: "싱잉볼의 깊은 울림으로 마음의 안정을",
      image: "/images/singing-bowl.jpg",
      program: "싱잉볼 테라피",
      price: "120,000원",
      tags: ["90분", "소리치유", "스트레스 해소"]
    },
    {
      id: "family",
      title: "가족 프로그램",
      description: "소중한 가족과 함께하는 특별한 시간",
      image: "/images/family.jpg",
      program: "가족 힐링 캠프",
      price: "360,000원",
      tags: ["1박 2일", "가족활동", "추억만들기"]
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">나에게 맞는 프로그램</h2>
          <p className="text-muted-foreground">
            목적에 따라 추천드리는 맞춤형 프로그램을 만나보세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className={cn(
                "group overflow-hidden border-none shadow-lg relative",
                category.isRecommended && "ring-2 ring-[#2F513F]"
              )}
            >
              {category.isRecommended && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-[#2F513F] hover:bg-[#2F513F]/90">
                    추천
                  </Badge>
                </div>
              )}
              <div className="relative aspect-[4/3]">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className={cn(
                  "absolute inset-0",
                  category.isRecommended ? "bg-[#2F513F]/20" : "bg-black/20"
                )} />
              </div>
              <CardContent className={cn(
                "p-6 space-y-4",
                category.isRecommended && "bg-[#2F513F]/5"
              )}>
                <div>
                  <h3 className={cn(
                    "text-xl font-bold mb-2",
                    category.isRecommended && "text-[#2F513F]"
                  )}>
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant={category.isRecommended ? "default" : "secondary"}
                      className={cn(
                        "rounded-full",
                        category.isRecommended && "bg-[#2F513F] hover:bg-[#2F513F]/90"
                      )}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">추천 프로그램</p>
                      <p className="font-medium">{category.program}</p>
                      <p className="text-sm font-bold mt-1">{category.price}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "group/btn",
                        category.isRecommended && "hover:bg-[#2F513F] hover:text-white"
                      )}
                      onClick={() => router.push(`/#programs-section`)}
                    >
                      자세히 보기
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 