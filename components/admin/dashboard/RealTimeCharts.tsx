'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  MousePointer,
  Calendar,
  Award,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { TimeRange } from './TimeFilter'

// =============================================
// 타입 정의
// =============================================
interface TopRoom {
  roomId: string
  roomName: string
  roomType: string
  interactionCount: number
}

interface TopProgram {
  programId: string
  programName: string
  interactionCount: number
}

interface EventStat {
  eventType: string
  eventCount: number
}

interface HourlyTrend {
  hour: string
  events: number
  conversions: number
}

interface RealtimeAnalyticsData {
  timeRange: TimeRange
  lastUpdated: string
  topRooms: TopRoom[]
  topPrograms: TopProgram[]
  eventStats: EventStat[]
  hourlyTrends: HourlyTrend[]
  summary: {
    totalEvents: number
    totalRoomViews: number
    totalReservationAttempts: number
    conversionRate: number
  }
}

interface RealTimeChartsProps {
  data: RealtimeAnalyticsData | null
  isLoading?: boolean
}

// =============================================
// 차트 설정
// =============================================
const chartConfig = {
  interactions: {
    label: '상호작용',
    color: 'hsl(var(--chart-1))',
  },
  events: {
    label: '이벤트',
    color: 'hsl(var(--chart-2))',
  },
  conversions: {
    label: '전환',
    color: 'hsl(var(--chart-3))',
  }
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
]

// =============================================
// 인기 객실 랭킹 차트
// =============================================
function TopRoomsChart({ data, isLoading }: { data: TopRoom[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            인기 객실 TOP 5
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.slice(0, 5).map((room, index) => ({
    ...room,
    rank: index + 1,
    displayName: room.roomName.length > 10 ? room.roomName.substring(0, 10) + '...' : room.roomName
  }))

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'standard': return 'bg-blue-100 text-blue-800'
      case 'deluxe': return 'bg-purple-100 text-purple-800'
      case 'suite': return 'bg-amber-100 text-amber-800'
      case 'family': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          인기 객실 TOP 5
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          조회 및 예약 시도 기준
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="displayName" 
                tick={{ fontSize: 12 }}
                width={80}
              />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    `${value}회`,
                    '상호작용'
                  ]}
                  labelFormatter={(label) => `객실: ${label}`}
                />}
              />
              <Bar 
                dataKey="interactionCount" 
                fill={chartConfig.interactions.color}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* 상세 랭킹 목록 */}
        <div className="mt-4 space-y-2">
          {chartData.map((room) => (
            <div key={room.roomId} className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {room.rank}
                </div>
                <div>
                  <div className="font-medium">{room.roomName}</div>
                  <Badge variant="secondary" className={getRoomTypeColor(room.roomType)}>
                    {room.roomType}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{room.interactionCount}회</div>
                <div className="text-xs text-muted-foreground">상호작용</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================
// 시간별 트렌드 차트
// =============================================
function HourlyTrendChart({ data, timeRange, isLoading }: { data: HourlyTrend[], timeRange: TimeRange, isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            시간별 활동 트렌드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    switch (timeRange) {
      case '1h':
      case '24h':
        return format(date, 'HH:mm', { locale: ko })
      case '7d':
        return format(date, 'MM/dd', { locale: ko })
      case '30d':
        return format(date, 'MM/dd', { locale: ko })
      default:
        return format(date, 'HH:mm', { locale: ko })
    }
  }

  const chartData = data.map(item => ({
    ...item,
    time: formatTime(item.hour),
    conversionRate: item.events > 0 ? Math.round((item.conversions / item.events) * 100) : 0
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          시간별 활동 트렌드
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          이벤트 발생 및 전환 현황
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    `${value}${name === 'conversionRate' ? '%' : '회'}`,
                    name === 'events' ? '이벤트' : 
                    name === 'conversions' ? '전환' : '전환율'
                  ]}
                  labelFormatter={(label) => `시간: ${label}`}
                />}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke={chartConfig.events.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                name="events"
              />
              <Line
                type="monotone"
                dataKey="conversions"
                stroke={chartConfig.conversions.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                name="conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// =============================================
// 이벤트 타입별 분포 차트
// =============================================
function EventDistributionChart({ data, isLoading }: { data: EventStat[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            이벤트 타입별 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'page_view': return '페이지 조회'
      case 'room_view': return '객실 조회'
      case 'program_view': return '프로그램 조회'
      case 'date_select': return '날짜 선택'
      case 'guest_count_change': return '인원 변경'
      case 'program_add': return '프로그램 추가'
      case 'reservation_start': return '예약 시작'
      case 'reservation_submit': return '예약 제출'
      default: return type
    }
  }

  const chartData = data.slice(0, 6).map((item, index) => ({
    ...item,
    name: getEventTypeName(item.eventType),
    fill: COLORS[index % COLORS.length]
  }))

  const total = chartData.reduce((sum, item) => sum + item.eventCount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointer className="h-5 w-5" />
          이벤트 타입별 분포
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          총 {total.toLocaleString()}개 이벤트
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="eventCount"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [`${value}회`, name]}
                />}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// =============================================
// 주요 지표 카드들
// =============================================
function SummaryCards({ data, isLoading }: { data: RealtimeAnalyticsData['summary'], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const summaryItems = [
    {
      title: '총 이벤트',
      value: data.totalEvents.toLocaleString(),
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: '객실 조회',
      value: data.totalRoomViews.toLocaleString(),
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: '예약 시도',
      value: data.totalReservationAttempts.toLocaleString(),
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: '전환율',
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
              <item.icon className={`h-8 w-8 ${item.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// =============================================
// 메인 실시간 차트 컴포넌트
// =============================================
export default function RealTimeCharts({ data, isLoading = false }: RealTimeChartsProps) {
  if (!data && !isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">실시간 데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 주요 지표 */}
      <SummaryCards 
        data={data?.summary || { totalEvents: 0, totalRoomViews: 0, totalReservationAttempts: 0, conversionRate: 0 }} 
        isLoading={isLoading} 
      />

      {/* 첫 번째 행: 시간별 트렌드 & 이벤트 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HourlyTrendChart 
          data={data?.hourlyTrends || []} 
          timeRange={data?.timeRange || '24h'} 
          isLoading={isLoading} 
        />
        <EventDistributionChart 
          data={data?.eventStats || []} 
          isLoading={isLoading} 
        />
      </div>

      {/* 두 번째 행: 인기 객실 */}
      <TopRoomsChart 
        data={data?.topRooms || []} 
        isLoading={isLoading} 
      />
    </div>
  )
} 