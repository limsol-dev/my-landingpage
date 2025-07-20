"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Users, Search, Filter, Star, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Program {
  id: string
  name: string
  description: string
  price: number
  unit: string
  maxParticipants?: number
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
  }
  images?: string[]
  stockQuantity?: number
  isAvailable: boolean
  requirements?: string
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'duration'>('name')
  const [loading, setLoading] = useState(true)

  // 프로그램 데이터 로드
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs')
        const data = await response.json()
        
        if (data.success) {
          setPrograms(data.data)
        } else {
          console.error('프로그램 로드 실패:', data.error)
        }
      } catch (error) {
        console.error('프로그램 로드 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  // 카테고리 데이터 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/programs/categories')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('카테고리 로드 오류:', error)
      }
    }

    fetchCategories()
  }, [])

  // 프로그램 필터링 및 정렬
  useEffect(() => {
    let filtered = programs

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(program => 
        program.category?.id === selectedCategory
      )
    }

    // 검색 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query)
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price
        case 'duration':
          return (a.duration || 0) - (b.duration || 0)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredPrograms(filtered)
  }, [programs, selectedCategory, searchQuery, sortBy])

  const formatPrice = (price: number, unit: string) => {
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
            <p className="text-gray-600">프로그램을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">프로그램 목록</h1>
        <p className="text-gray-600">다양한 힐링 프로그램과 펜션 서비스를 만나보세요</p>
      </div>

      {/* 필터 및 검색 */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="프로그램 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 정렬 */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="price">가격순</SelectItem>
              <SelectItem value="duration">기간순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 카테고리 탭 */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">전체</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 프로그램 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <Image
                  src={program.images?.[0] || '/images/healing-room.jpg'}
                  alt={program.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {program.stockQuantity !== undefined && program.stockQuantity <= 5 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute top-2 right-2"
                  >
                    {program.stockQuantity === 0 ? '마감' : `${program.stockQuantity}개 남음`}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="mb-2">
                <Badge variant="secondary" className="mb-2">
                  {program.category?.name || '일반'}
                </Badge>
                <CardTitle className="text-lg mb-2">{program.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600 line-clamp-2">
                  {program.description}
                </CardDescription>
              </div>

              <div className="space-y-2 mb-4">
                {program.duration && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(program.duration)}
                  </div>
                )}
                
                {program.maxParticipants && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    최대 {program.maxParticipants}명
                  </div>
                )}

                {program.partner && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {program.partner.name}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(program.price, program.unit)}
                </div>
                
                <Link href={`/programs/${program.id}`}>
                  <Button 
                    size="sm" 
                    disabled={program.stockQuantity === 0}
                    className={cn(
                      program.stockQuantity === 0 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {program.stockQuantity === 0 ? '마감' : '자세히 보기'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 결과 없음 */}
      {filteredPrograms.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-600">
            다른 검색어나 필터를 시도해보세요
          </p>
        </div>
      )}
    </div>
  )
} 