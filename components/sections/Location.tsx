"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Bus, Car } from "lucide-react"

interface KakaoMapOptions {
  center: any;
  level: number;
}

interface MarkerOptions {
  position: any;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        Map: new (container: HTMLElement, options: KakaoMapOptions) => any;
        LatLng: new (lat: number, lng: number) => any;
        Marker: new (options: MarkerOptions) => any;
      };
    };
  }
}

export default function Location() {
  const mapRef = useRef<HTMLDivElement>(null)

  const locationInfo = {
    name: "힐링 펜션",
    address: "강원도 평창군 봉평면 무이리 123-45",
    coordinates: { lat: 37.123456, lng: 128.123456 },
    transportation: [
      {
        type: "자가용",
        description: "영동고속도로 진부IC에서 10분 거리",
        icon: <Car className="h-5 w-5" />
      },
      {
        type: "대중교통",
        description: "진부역 도착 후 무료 셔틀버스 이용",
        icon: <Bus className="h-5 w-5" />
      }
    ],
    nearbyAttractions: [
      {
        name: "알펜시아 스키장",
        distance: "차량 15분"
      },
      {
        name: "이효석 문학관",
        distance: "차량 10분"
      },
      {
        name: "오대산 국립공원",
        distance: "차량 20분"
      }
    ]
  }

  useEffect(() => {
    if (typeof window.kakao !== "undefined" && mapRef.current) {
      const options = {
        center: new window.kakao.maps.LatLng(
          locationInfo.coordinates.lat,
          locationInfo.coordinates.lng
        ),
        level: 3
      }
      
      const map = new window.kakao.maps.Map(mapRef.current, options)
      
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(
          locationInfo.coordinates.lat,
          locationInfo.coordinates.lng
        )
      })
      
      marker.setMap(map)
    }
  }, [locationInfo.coordinates.lat, locationInfo.coordinates.lng])

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">오시는 길</h2>
          <p className="text-muted-foreground">
            자연 속 힐링을 위한 최적의 위치
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* 지도 */}
          <div className="relative aspect-video lg:aspect-auto rounded-lg overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* 위치 정보 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  주소
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{locationInfo.name}</p>
                <p className="text-muted-foreground">{locationInfo.address}</p>
                <Button variant="outline" className="w-full mt-4">
                  <Navigation className="h-4 w-4 mr-2" />
                  길찾기
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>교통편 안내</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {locationInfo.transportation.map((transport, index) => (
                  <div key={index} className="flex gap-3">
                    {transport.icon}
                    <div>
                      <p className="font-medium">{transport.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {transport.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>주변 관광지</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {locationInfo.nearbyAttractions.map((attraction, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{attraction.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {attraction.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
} 