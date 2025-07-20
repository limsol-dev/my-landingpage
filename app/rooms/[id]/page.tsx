"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Users, 
  Maximize, 
  Mountain, 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  Star, 
  Wifi, 
  Car, 
  Coffee, 
  Bath,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MapPin,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Room {
  id: string
  name: string
  type: 'standard' | 'deluxe' | 'family' | 'suite'
  description: string
  base_price: number
  max_guests: number
  amenities: string[]
  images: string[]
  is_available: boolean
  sort_order: number
}

const roomTypeNames = {
  standard: '스탠다드',
  deluxe: '디럭스',
  family: '패밀리',
  suite: '스위트'
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  'wifi': <Wifi className="w-5 h-5" />,
  'tv': <Star className="w-5 h-5" />,
  'aircon': <Star className="w-5 h-5" />,
  'refrigerator': <Coffee className="w-5 h-5" />,
  'kitchen': <Coffee className="w-5 h-5" />,
  'balcony': <Mountain className="w-5 h-5" />,
  'living_room': <Star className="w-5 h-5" />,
  'parking': <Car className="w-5 h-5" />,
  'bathtub': <Bath className="w-5 h-5" />
}

const amenityNames: { [key: string]: string } = {
  'wifi': '무료 WiFi',
  'tv': '스마트 TV',
  'aircon': '에어컨',
  'refrigerator': '냉장고',
  'kitchen': '간이 주방',
  'balcony': '발코니',
  'living_room': '거실',
  'parking': '주차장',
  'bathtub': '욕조'
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params?.id as string
  
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [guests, setGuests] = useState(2)
  const [isFavorite, setIsFavorite] = useState(false)

  // 객실 데이터 로드
  useEffect(() => {
    if (roomId) {
      loadRoom(roomId)
    }
  }, [roomId])

  const loadRoom = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      // Supabase에서 객실 데이터 가져오기
      const { data, error: supabaseError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single()

      if (supabaseError) {
        // Supabase 오류 시 샘플 데이터 사용
        console.warn('Supabase 오류, 샘플 데이터 사용:', supabaseError)
        const sampleRoom = getSampleRoom(id)
        if (sampleRoom) {
          setRoom(sampleRoom)
        } else {
          setError('객실을 찾을 수 없습니다.')
        }
      } else {
        setRoom(data)
      }
    } catch (error) {
      console.error('객실 데이터 로드 오류:', error)
      setError('객실 정보를 불러오는 중 오류가 발생했습니다.')
      
      // 오류 시 샘플 데이터 사용
      const sampleRoom = getSampleRoom(id)
      if (sampleRoom) {
        setRoom(sampleRoom)
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  // 샘플 데이터 (Supabase 연결 전까지 사용)
  const getSampleRoom = (id: string): Room | null => {
    const sampleRooms: { [key: string]: Room } = {
      '1': {
        id: '1',
        name: '스탠다드 룸',
        type: 'standard',
        description: '기본적인 편의시설을 갖춘 아늑한 객실입니다. 자연의 아름다움을 만끽할 수 있는 정원 전망과 함께 편안한 휴식을 제공합니다.',
        base_price: 80000,
        max_guests: 4,
        amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'parking'],
        images: ['/images/room1.jpg', '/images/room1-2.jpg', '/images/living.jpg'],
        is_available: true,
        sort_order: 1
      },
      '2': {
        id: '2',
        name: '디럭스 룸',
        type: 'deluxe',
        description: '넓은 공간과 고급 편의시설을 갖춘 객실입니다. 프라이빗 발코니에서 아름다운 산 전망을 감상하며 특별한 시간을 보내세요.',
        base_price: 120000,
        max_guests: 6,
        amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'kitchen', 'balcony', 'parking'],
        images: ['/images/room2.jpg', '/images/room2-2.jpg', '/images/kitchen.jpg'],
        is_available: true,
        sort_order: 2
      },
      '3': {
        id: '3',
        name: '패밀리 스위트',
        type: 'family',
        description: '가족 단위 투숙객을 위한 넓은 객실입니다. 별도의 거실 공간과 완비된 주방 시설로 마치 집처럼 편안한 숙박을 경험하실 수 있습니다.',
        base_price: 180000,
        max_guests: 8,
        amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'kitchen', 'balcony', 'living_room', 'bathtub', 'parking'],
        images: ['/images/healing-room.jpg', '/images/living.jpg', '/images/kitchen.jpg'],
        is_available: true,
        sort_order: 3
      }
    }
    return sampleRooms[id] || null
  }

  const nextImage = () => {
    if (room && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
    }
  }

  const prevImage = () => {
    if (room && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
    }
  }

  const calculateNights = () => {
    if (checkInDate && checkOutDate) {
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    return 1
  }

  const calculateTotalPrice = () => {
    if (room) {
      return room.base_price * calculateNights()
    }
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>객실 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="mt-4" onClick={() => router.push('/rooms')}>
              객실 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="mb-4">객실을 찾을 수 없습니다.</p>
            <Button onClick={() => router.push('/rooms')}>
              객실 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/rooms" className="hover:text-primary">객실</Link>
              <span>/</span>
              <span>{room.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 객실 이미지 갤러리 */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={room.images[currentImageIndex] || '/images/room-placeholder.jpg'}
                    alt={room.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  
                  {/* 이미지 네비게이션 */}
                  {room.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      
                      {/* 이미지 인디케이터 */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {room.images.map((_, index) => (
                          <button
                            key={index}
                            className={cn(
                              "w-2 h-2 rounded-full",
                              index === currentImageIndex ? "bg-white" : "bg-white/50"
                            )}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* 액션 버튼 */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500 text-red-500")} />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 썸네일 이미지 */}
                {room.images.length > 1 && (
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {room.images.map((image, index) => (
                        <button
                          key={index}
                          className={cn(
                            "relative aspect-video rounded-lg overflow-hidden border-2",
                            index === currentImageIndex ? "border-primary" : "border-transparent"
                          )}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <Image
                            src={image}
                            alt={`${room.name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 객실 정보 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{room.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {roomTypeNames[room.type]}
                      </Badge>
                      <Badge variant={room.is_available ? "default" : "secondary"}>
                        {room.is_available ? "예약 가능" : "예약 마감"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">객실 설명</TabsTrigger>
                    <TabsTrigger value="amenities">편의시설</TabsTrigger>
                    <TabsTrigger value="policies">이용 안내</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">{room.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span>최대 {room.max_guests}명</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mountain className="w-5 h-5 text-gray-400" />
                        <span>산 전망</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span>1층</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Maximize className="w-5 h-5 text-gray-400" />
                        <span>26㎡</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="amenities" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {room.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3">
                          {amenityIcons[amenity] || <Star className="w-5 h-5" />}
                          <span>{amenityNames[amenity] || amenity}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="policies" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          체크인/체크아웃
                        </h4>
                        <p className="text-sm text-gray-600">체크인: 15:00 | 체크아웃: 11:00</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">이용 규칙</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 금연 객실입니다</li>
                          <li>• 반려동물 동반 불가</li>
                          <li>• 정원에서의 바비큐는 별도 예약 필요</li>
                          <li>• 조용한 시간: 22:00 ~ 08:00</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">취소 정책</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 체크인 7일 전: 100% 환불</li>
                          <li>• 체크인 3일 전: 50% 환불</li>
                          <li>• 체크인 1일 전: 환불 불가</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 예약 사이드바 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">예약하기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 가격 */}
                <div className="text-center pb-4 border-b">
                  <span className="text-3xl font-bold">{room.base_price.toLocaleString()}</span>
                  <span className="text-gray-600 ml-1">원/박</span>
                </div>

                {/* 날짜 선택 */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">체크인</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkInDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, "yyyy년 M월 d일", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={setCheckInDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">체크아웃</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkOutDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, "yyyy년 M월 d일", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* 인원 선택 */}
                <div>
                  <Label className="text-sm font-medium">투숙 인원</Label>
                  <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: room.max_guests }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}명
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 총 금액 */}
                {checkInDate && checkOutDate && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>{room.base_price.toLocaleString()}원 × {calculateNights()}박</span>
                      <span>{calculateTotalPrice().toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>총 금액</span>
                      <span>{calculateTotalPrice().toLocaleString()}원</span>
                    </div>
                  </div>
                )}

                {/* 예약 버튼 */}
                <Link 
                  href={`/booking?room=${room.id}${checkInDate ? `&checkin=${format(checkInDate, 'yyyy-MM-dd')}` : ''}${checkOutDate ? `&checkout=${format(checkOutDate, 'yyyy-MM-dd')}` : ''}${guests !== 2 ? `&guests=${guests}` : ''}`}
                  className="w-full"
                >
                  <Button className="w-full" disabled={!room.is_available}>
                    {room.is_available ? "예약하기" : "예약 마감"}
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center">
                  예약 확정 전까지는 요금이 청구되지 않습니다
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 