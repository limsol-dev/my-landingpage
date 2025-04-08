"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Battery, Clock, ArrowRight } from "lucide-react"

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
  category: string
  duration: string
  price: string
  tags: string[]
  matchScore: number
}

export default function ProgramMatcher() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const questions: Question[] = [
    {
      id: 1,
      text: "현재 어떤 휴식이 필요하신가요?",
      options: [
        {
          id: "mental",
          text: "마음의 안정",
          icon: <Brain className="h-6 w-6" />,
          description: "스트레스 해소, 마음 챙김"
        },
        {
          id: "physical",
          text: "몸의 회복",
          icon: <Battery className="h-6 w-6" />,
          description: "피로 회복, 건강 관리"
        },
        {
          id: "both",
          text: "전반적인 재충전",
          icon: <Clock className="h-6 w-6" />,
          description: "종합적인 힐링 케어"
        }
      ]
    },
    {
      id: 2,
      text: "선호하는 프로그램 유형은?",
      options: [
        {
          id: "meditation",
          text: "명상과 요가",
          description: "고요한 자기 성찰"
        },
        {
          id: "activity",
          text: "체험과 활동",
          description: "다양한 액티비티"
        },
        {
          id: "nature",
          text: "자연 친화",
          description: "자연과 함께하는 시간"
        }
      ]
    },
    {
      id: 3,
      text: "희망하는 프로그램 기간은?",
      options: [
        {
          id: "short",
          text: "반나절 프로그램",
          description: "3-4시간 코스"
        },
        {
          id: "day",
          text: "1일 프로그램",
          description: "전일 코스"
        },
        {
          id: "stay",
          text: "1박 2일 이상",
          description: "숙박 포함 프로그램"
        }
      ]
    }
  ]

  const programs: Program[] = [
    {
      id: "digital-detox",
      title: "디지털 디톡스 프로그램",
      description: "전자기기로부터 벗어나 자연과 교감하는 시간",
      category: "힐링",
      duration: "1박 2일",
      price: "280,000원",
      tags: ["명상", "자연", "디톡스"],
      matchScore: 0
    },
    {
      id: "teacher-healing",
      title: "교원 힐링 프로그램",
      description: "지친 교육자를 위한 맞춤형 휴식",
      category: "직무",
      duration: "2박 3일",
      price: "450,000원",
      tags: ["교육자", "힐링", "재충전"],
      matchScore: 0
    },
    {
      id: "wellness",
      title: "웰니스 케어 프로그램",
      description: "전문가와 함께하는 건강한 라이프스타일",
      category: "건강",
      duration: "1일",
      price: "180,000원",
      tags: ["웰니스", "건강", "운동"],
      matchScore: 0
    }
  ]

  const handleAnswer = (answerId: string) => {
    const newAnswers = [...answers, answerId]
    setAnswers(newAnswers)

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResults(true)
    }
  }

  const getRecommendedPrograms = () => {
    // 답변에 따른 프로그램 매칭 로직
    return programs.map(program => ({
      ...program,
      matchScore: Math.random() * 100 // 실제로는 더 복잡한 매칭 로직 필요
    })).sort((a, b) => b.matchScore - a.matchScore)
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
                <h3 className="text-2xl font-bold mb-2">추천 프로그램</h3>
                <p className="text-muted-foreground">
                  회원님의 선호도에 맞는 프로그램을 추천해드립니다
                </p>
              </div>

              <div className="grid gap-6">
                {getRecommendedPrograms().map((program) => (
                  <Card key={program.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{program.title}</CardTitle>
                          <CardDescription>{program.description}</CardDescription>
                        </div>
                        <Badge>
                          {Math.round(program.matchScore)}% 매칭
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-x-2">
                            {program.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="font-bold">{program.price}</span>
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