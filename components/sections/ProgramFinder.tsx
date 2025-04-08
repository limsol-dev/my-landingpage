"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Users, Leaf, Zap, Clock, ArrowRight } from "lucide-react"

type Question = {
  id: number
  text: string
  options: {
    id: string
    text: string
    icon?: React.ReactNode
    description?: string
  }[]
}

type Program = {
  id: string
  title: string
  description: string
  price: string
  duration: string
  includes: string[]
  tags: string[]
  recommended: boolean
}

export default function ProgramFinder() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const questions: Question[] = [
    {
      id: 1,
      text: "누구와 함께 방문하시나요?",
      options: [
        { 
          id: "family", 
          text: "가족과 함께", 
          icon: <Users className="h-6 w-6" />,
          description: "가족 단위 맞춤 프로그램"
        },
        { 
          id: "couple", 
          text: "연인과 함께", 
          icon: <Heart className="h-6 w-6" />,
          description: "로맨틱한 커플 프로그램"
        },
        { 
          id: "alone", 
          text: "혼자서", 
          icon: <Users className="h-6 w-6" />,
          description: "나를 위한 힐링 시간"
        }
      ]
    },
    {
      id: 2,
      text: "어떤 목적으로 방문하시나요?",
      options: [
        { 
          id: "healing", 
          text: "마음의 치유", 
          icon: <Leaf className="h-6 w-6" />,
          description: "명상과 요가 중심 프로그램"
        },
        { 
          id: "rest", 
          text: "휴식과 재충전", 
          icon: <Zap className="h-6 w-6" />,
          description: "편안한 휴식과 스파"
        },
        { 
          id: "activity", 
          text: "액티비티와 체험", 
          icon: <Clock className="h-6 w-6" />,
          description: "다양한 체험 활동"
        }
      ]
    },
    {
      id: 3,
      text: "선호하는 프로그램 기간은?",
      options: [
        { 
          id: "1day", 
          text: "당일 프로그램",
          description: "3-4시간 소요"
        },
        { 
          id: "2days", 
          text: "1박 2일",
          description: "여유로운 1박 2일"
        },
        { 
          id: "3days", 
          text: "2박 3일 이상",
          description: "깊이 있는 프로그램"
        }
      ]
    }
  ]

  const programs: Program[] = [
    {
      id: "family-healing",
      title: "가족 힐링 패키지",
      description: "가족과 함께하는 특별한 힐링 시간",
      price: "320,000원~",
      duration: "2박 3일",
      includes: [
        "가족 명상 세션",
        "아로마테라피",
        "가족 요리 클래스",
        "숲 테라피"
      ],
      tags: ["가족", "힐링", "체험"],
      recommended: false
    },
    {
      id: "couple-rest",
      title: "커플 스파 패키지",
      description: "연인과 함께하는 로맨틱한 휴식",
      price: "280,000원~",
      duration: "1박 2일",
      includes: [
        "커플 스파",
        "아로마 마사지",
        "와인 디너",
        "조식 서비스"
      ],
      tags: ["커플", "스파", "휴식"],
      recommended: false
    },
    {
      id: "solo-healing",
      title: "나를 위한 힐링",
      description: "온전한 나만의 시간",
      price: "180,000원~",
      duration: "당일",
      includes: [
        "명상 클래스",
        "요가 세션",
        "건강식 제공",
        "산책 테라피"
      ],
      tags: ["힐링", "명상", "요가"],
      recommended: false
    }
  ]

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResults(true)
    }
  }

  const getRecommendedPrograms = () => {
    // 간단한 추천 로직
    const [visitor, purpose, duration] = answers
    
    return programs.map(program => ({
      ...program,
      recommended: 
        (visitor === "family" && program.tags.includes("가족")) ||
        (visitor === "couple" && program.tags.includes("커플")) ||
        (visitor === "alone" && program.tags.includes("힐링"))
    }))
  }

  const resetQuiz = () => {
    setCurrentStep(0)
    setAnswers([])
    setShowResults(false)
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">나에게 맞는 프로그램 찾기</h2>
          <p className="text-muted-foreground">
            간단한 질문에 답하고 맞춤 프로그램을 추천받으세요
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!showResults ? (
            <>
              <div className="mb-8">
                <Progress value={((currentStep + 1) / questions.length) * 100} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{questions[currentStep].text}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {questions[currentStep].options.map((option) => (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="h-auto py-6 px-6"
                        onClick={() => handleAnswer(option.id)}
                      >
                        <div className="flex items-center gap-4">
                          {option.icon}
                          <div className="text-left">
                            <div className="font-medium">{option.text}</div>
                            {option.description && (
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">맞춤 프로그램 추천</h3>
                <p className="text-muted-foreground">
                  선호도에 맞는 프로그램을 추천해드립니다
                </p>
              </div>

              <div className="grid gap-6">
                {getRecommendedPrograms().map((program) => (
                  <Card 
                    key={program.id}
                    className={program.recommended ? "border-primary" : ""}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{program.title}</CardTitle>
                          <CardDescription>{program.description}</CardDescription>
                        </div>
                        {program.recommended && (
                          <Badge>추천</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">기간: </span>
                            <span className="font-medium">{program.duration}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">가격: </span>
                            <span className="font-medium">{program.price}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">포함 사항</h4>
                          <ul className="grid grid-cols-2 gap-2">
                            {program.includes.map((item, index) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <span className="w-1 h-1 bg-primary rounded-full" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button className="w-full">
                          자세히 보기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={resetQuiz}>
                  다시 찾아보기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 