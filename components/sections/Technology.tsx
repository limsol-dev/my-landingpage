import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Server, Zap, Lock } from "lucide-react"

export default function Technology() {
  const features = [
    {
      icon: <Server className="h-6 w-6" />,
      title: "API 연동 아키텍처",
      description: "안정적인 API 연동 및 데이터 처리"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "데이터 보안",
      description: "엔터프라이즈급 보안 정책 적용"
    },
    // ... 다른 기술 특징들
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">
          기술 및 보안
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 