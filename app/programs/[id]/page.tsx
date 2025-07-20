"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Users, MapPin, Phone, Calendar, Star, ArrowLeft, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Program {
  id: string
  name?: string
  title?: string
  description: string
  price: number
  unit?: string
  maxParticipants?: number
  minParticipants?: number
  duration?: number
  availableTimes?: string[]
  category?: {
    id: string
    name: string
    description: string
    icon: string
  }
  partner?: {
    id: string
    name: string
    contact_name?: string
    contact_phone?: string
    address?: string
  }
  images?: string[]
  stockQuantity?: number
  isAvailable?: boolean
  requirements?: string
  details?: {
    schedule: string[]
    includes: string[]
    notice: string[]
  }
  createdAt?: string
  updatedAt?: string
}

export default function ProgramPage({ params }: { params: { id: string } }) {
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/programs/${params.id}`)
        const data = await response.json()
        
        if (data.success) {
          setProgram(data.data)
        } else {
          setError(data.error || '프로그램을 찾을 수 없습니다.')
        }
      } catch (error) {
        console.error('프로그램 로드 오류:', error)
        setError('프로그램을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProgram()
  }, [params.id])

  const formatPrice = (price: number, unit?: string) => {
    const formattedPrice = price.toLocaleString()
    switch (unit) {
      case 'per_person':
        return `${formattedPrice}원/인`
      case 'per_group':
        return `${formattedPrice}원/팀`
      case 'fixed':
      default:
        return `${formattedPrice}원`
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return ''
    
    if (minutes < 60) {
      return `${minutes}분`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`
    } else {
      const days = Math.floor(minutes / 1440)
      const remainingHours = Math.floor((minutes % 1440) / 60)
      return remainingHours > 0 ? `${days}일 ${remainingHours}시간` : `${days}일`
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">프로그램 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            프로그램을 찾을 수 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            {error || '요청하신 프로그램이 존재하지 않습니다.'}
          </p>
          <Link href="/programs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              프로그램 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const programName = program.name || program.title || '프로그램'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로 가기 */}
      <Link 
        href="/programs" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        프로그램 목록으로 돌아가기
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2">
          {/* 이미지 갤러리 */}
          <div className="mb-8">
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={program.images?.[0] || '/images/healing-room.jpg'}
                alt={programName}
                fill
                className="object-cover"
              />
              {program.stockQuantity !== undefined && program.stockQuantity <= 5 && (
                <Badge 
                  variant={program.stockQuantity === 0 ? "destructive" : "secondary"}
                  className="absolute top-4 right-4"
                >
                  {program.stockQuantity === 0 ? '마감' : `${program.stockQuantity}개 남음`}
                </Badge>
              )}
            </div>
          </div>

          {/* 프로그램 정보 */}
          <div className="mb-8">
            <div className="mb-4">
              {program.category && (
                <Badge variant="secondary" className="mb-2">
                  {program.category.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{programName}</h1>
              <p className="text-gray-600 text-lg">{program.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {program.duration && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{formatDuration(program.duration)}</span>
                </div>
              )}
              
              {(program.maxParticipants || program.minParticipants) && (
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  <span>
                    {program.minParticipants && program.maxParticipants 
                      ? `${program.minParticipants}~${program.maxParticipants}명`
                      : program.maxParticipants 
                      ? `최대 ${program.maxParticipants}명`
                      : `최소 ${program.minParticipants}명`
                    }
                  </span>
                </div>
              )}

              {program.partner && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{program.partner.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* 상세 정보 탭 */}
          {program.details && (
            <Tabs defaultValue="schedule" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="schedule">일정</TabsTrigger>
                <TabsTrigger value="includes">포함사항</TabsTrigger>
                <TabsTrigger value="notice">유의사항</TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedule" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      프로그램 일정
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {program.details.schedule.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="includes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>포함 사항</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {program.details.includes.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <Star className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notice" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      유의 사항
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {program.details.notice.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* 추가 정보 */}
          {(program.availableTimes || program.requirements) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {program.availableTimes && program.availableTimes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">이용 가능 시간</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {program.availableTimes.map((time, index) => (
                        <Badge key={index} variant="outline">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {program.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">필요 조건</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{program.requirements}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* 예약 사이드바 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600">
                {formatPrice(program.price, program.unit)}
              </CardTitle>
              {program.unit && (
                <CardDescription>
                  {program.unit === 'per_person' ? '1인당 가격' : 
                   program.unit === 'per_group' ? '팀당 가격' : '고정 가격'}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {program.partner && (
                <div className="space-y-2">
                  <h4 className="font-medium">제공업체</h4>
                  <div className="text-sm text-gray-600">
                    <p>{program.partner.name}</p>
                    {program.partner.contact_name && (
                      <p>담당자: {program.partner.contact_name}</p>
                    )}
                    {program.partner.contact_phone && (
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-1" />
                        {program.partner.contact_phone}
                      </div>
                    )}
                    {program.partner.address && (
                      <div className="flex items-start mt-1">
                        <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{program.partner.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg"
                disabled={program.stockQuantity === 0}
              >
                {program.stockQuantity === 0 ? '마감' : '예약하기'}
              </Button>

              {program.stockQuantity !== undefined && program.stockQuantity > 0 && program.stockQuantity <= 5 && (
                <p className="text-sm text-amber-600 text-center">
                  ⚠️ {program.stockQuantity}개만 남았습니다!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 