"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bath } from "lucide-react"

type Feature = {
  title: string
  description: string
  icon?: JSX.Element
  amenities?: string[]
}

export default function Features() {
  const features: Feature[] = [
    {
      title: "객실 시설",
      description: "편안한 휴식을 위한 객실 시설",
      amenities: [
        "킹사이즈 침대",
        "욕조",
        "미니 주방",
        "스마트 TV",
        "무료 WiFi"
      ]
    },
    {
      title: "부대 시설",
      description: "다양한 부대시설 이용",
      icon: <Bath className="h-6 w-6" />,
    }
    // ... 나머지 features
  ]

  return (
    <section className="py-20">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">
          시설 안내
        </h2>
        
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {features.map(feature => (
              <TabsTrigger key={feature.title} value={feature.title}>
                {feature.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="rooms">
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.amenities?.map((amenity, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full" />
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="facilities">
            <div className="grid md:grid-cols-3 gap-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
} 