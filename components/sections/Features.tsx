import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bath, Utensils, Trees, Wifi, Car, Mountain } from "lucide-react"

export default function Features() {
  const categories = [
    {
      id: "rooms",
      title: "객실 안내",
      features: [
        {
          title: "디럭스룸",
          description: "2-3인 기준의 아늑한 객실",
          amenities: ["퀸 사이즈 침대", "욕조", "미니 주방", "테라스"]
        },
        {
          title: "스위트룸",
          description: "4-5인 가족을 위한 넓은 객실",
          amenities: ["킹 사이즈 침대", "대형 욕조", "풀 키친", "프라이빗 테라스"]
        },
        {
          title: "프리미엄룸",
          description: "최고급 시설의 프라이빗 공간",
          amenities: ["복층 구조", "자쿠지", "바베큐 시설", "전용 정원"]
        }
      ]
    },
    {
      id: "facilities",
      title: "부대시설",
      features: [
        {
          title: "바베큐장",
          description: "프라이빗 바베큐 파티",
          icon: <Utensils className="h-6 w-6" />
        },
        {
          title: "산책로",
          description: "아름다운 자연 속 산책",
          icon: <Trees className="h-6 w-6" />
        },
        {
          title: "스파",
          description: "편안한 휴식과 힐링",
          icon: <Bath className="h-6 w-6" />
        }
      ]
    }
  ]

  return (
    <section className="py-20">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">
          시설 안내
        </h2>
        
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="rooms">
            <div className="grid md:grid-cols-3 gap-6">
              {categories[0].features.map((room, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{room.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{room.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {room.amenities.map((amenity, idx) => (
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
              {categories[1].features.map((facility, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      {facility.icon}
                    </div>
                    <CardTitle>{facility.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {facility.description}
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