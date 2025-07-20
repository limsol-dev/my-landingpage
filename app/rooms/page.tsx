"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Maximize, Mountain, Calendar as CalendarIcon, Search, Filter, Star, Wifi, Car, Coffee, Bath } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

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
  'wifi': <Wifi className="w-4 h-4" />,
  'tv': <Star className="w-4 h-4" />,
  'aircon': <Star className="w-4 h-4" />,
  'refrigerator': <Coffee className="w-4 h-4" />,
  'kitchen': <Coffee className="w-4 h-4" />,
  'balcony': <Mountain className="w-4 h-4" />,
  'living_room': <Star className="w-4 h-4" />,
  'parking': <Car className="w-4 h-4" />,
  'bathtub': <Bath className="w-4 h-4" />
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [maxPrice, setMaxPrice] = useState<number>(500000)
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [guests, setGuests] = useState(2)

  // 객실 데이터 로드
  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      setError(null)

      // Supabase에서 객실 데이터 가져오기
      const { data, error: supabaseError } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .order('sort_order', { ascending: true })

      if (supabaseError) {
        // Supabase 오류 시 샘플 데이터 사용
        console.warn('Supabase 오류, 샘플 데이터 사용:', supabaseError)
        setRooms(sampleRooms)
      } else {
        setRooms(data || [])
      }
    } catch (error) {
      console.error('객실 데이터 로드 오류:', error)
      setError('객실 정보를 불러오는 중 오류가 발생했습니다.')
      // 오류 시 샘플 데이터 사용
      setRooms(sampleRooms)
    } finally {
      setLoading(false)
    }
  }

  // 샘플 데이터 (Supabase 연결 전까지 사용)
  const sampleRooms: Room[] = [
    {
      id: '1',
      name: '스탠다드 룸',
      type: 'standard',
      description: '기본적인 편의시설을 갖춘 아늑한 객실입니다.',
      base_price: 80000,
      max_guests: 4,
      amenities: ['wifi', 'tv', 'aircon', 'refrigerator'],
      images: ['/images/room1.jpg', '/images/room1-2.jpg'],
      is_available: true,
      sort_order: 1
    },
    {
      id: '2',
      name: '디럭스 룸',
      type: 'deluxe',
      description: '넓은 공간과 고급 편의시설을 갖춘 객실입니다.',
      base_price: 120000,
      max_guests: 6,
      amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'kitchen', 'balcony'],
      images: ['/images/room2.jpg', '/images/room2-2.jpg'],
      is_available: true,
      sort_order: 2
    },
    {
      id: '3',
      name: '패밀리 스위트',
      type: 'family',
      description: '가족 단위 투숙객을 위한 넓은 객실입니다.',
      base_price: 180000,
      max_guests: 8,
      amenities: ['wifi', 'tv', 'aircon', 'refrigerator', 'kitchen', 'balcony', 'living_room'],
      images: ['/images/suite.jpg', '/images/suite-2.jpg'],
      is_available: true,
      sort_order: 3
    }
  ]

  // 필터링된 객실 목록
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || room.type === selectedType
    const matchesPrice = room.base_price <= maxPrice
    const matchesGuests = room.max_guests >= guests

    return matchesSearch && matchesType && matchesPrice && matchesGuests
  })

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">객실 안내</h1>
          <p className="text-gray-600">편안하고 아늑한 객실에서 특별한 휴식을 경험하세요</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 필터 사이드바 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  검색 & 필터
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* 검색 */}
                <div className="space-y-2">
                  <Label htmlFor="search">객실 검색</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="객실명 또는 설명 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 체크인/체크아웃 날짜 */}
                <div className="space-y-4">
                  <Label>체크인 날짜</Label>
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

                  <Label>체크아웃 날짜</Label>
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

                {/* 인원 수 */}
                <div className="space-y-2">
                  <Label htmlFor="guests">투숙 인원</Label>
                  <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}명
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 객실 타입 */}
                <div className="space-y-2">
                  <Label htmlFor="type">객실 타입</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="standard">스탠다드</SelectItem>
                      <SelectItem value="deluxe">디럭스</SelectItem>
                      <SelectItem value="family">패밀리</SelectItem>
                      <SelectItem value="suite">스위트</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 최대 가격 */}
                <div className="space-y-2">
                  <Label htmlFor="price">최대 가격: {maxPrice.toLocaleString()}원</Label>
                  <Input
                    id="price"
                    type="range"
                    min="50000"
                    max="500000"
                    step="10000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  />
                </div>

                {/* 필터 초기화 */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedType('all')
                    setMaxPrice(500000)
                    setCheckInDate(undefined)
                    setCheckOutDate(undefined)
                    setGuests(2)
                  }}
                >
                  필터 초기화
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 객실 목록 */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                총 {filteredRooms.length}개의 객실이 있습니다
              </p>
            </div>

            {filteredRooms.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 mb-4">검색 조건에 맞는 객실이 없습니다.</p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('')
                    setSelectedType('all')
                    setMaxPrice(500000)
                    setGuests(2)
                  }}>
                    필터 초기화
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* 객실 이미지 */}
                    <div className="relative aspect-video">
                      <Image
                        src={room.images[0] || '/images/room-placeholder.jpg'}
                        alt={room.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary">
                          {roomTypeNames[room.type]}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* 객실 정보 */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                          <p className="text-gray-600 text-sm">{room.description}</p>
                        </div>

                        {/* 기본 정보 */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>최대 {room.max_guests}명</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mountain className="w-4 h-4" />
                            <span>산 전망</span>
                          </div>
                        </div>

                        {/* 편의시설 */}
                        <div>
                          <h4 className="font-medium mb-2 text-sm">편의시설</h4>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.slice(0, 4).map((amenity) => (
                              <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600">
                                {amenityIcons[amenity] || <Star className="w-3 h-3" />}
                                <span>{amenity}</span>
                              </div>
                            ))}
                            {room.amenities.length > 4 && (
                              <span className="text-xs text-gray-500">+{room.amenities.length - 4}개</span>
                            )}
                          </div>
                        </div>

                        {/* 가격 및 예약 버튼 */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <span className="text-2xl font-bold">{room.base_price.toLocaleString()}</span>
                            <span className="text-gray-600 text-sm">원/박</span>
                          </div>
                          <div className="space-x-2">
                            <Link href={`/rooms/${room.id}`}>
                              <Button variant="outline" size="sm">
                                상세보기
                              </Button>
                            </Link>
                            <Link href={`/booking?room=${room.id}`}>
                              <Button size="sm">
                                예약하기
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 