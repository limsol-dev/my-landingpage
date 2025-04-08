import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "₩49,000",
      description: "소규모 프로그램 운영에 적합한 플랜",
      features: [
        "기본 고객관리",
        "이메일 알림",
        "기본 보고서",
        "5GB 저장공간"
      ]
    },
    {
      name: "Professional",
      price: "₩99,000",
      description: "전문적인 프로그램 운영을 위한 플랜",
      features: [
        "고급 고객관리",
        "자동화된 마케팅",
        "상세 분석 리포트",
        "무제한 저장공간"
      ],
      popular: true
    }
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">요금제 안내</h2>
          <p className="text-muted-foreground">
            비즈니스 규모에 맞는 최적의 플랜을 선택하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={plan.popular ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/월</span></p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  시작하기
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 