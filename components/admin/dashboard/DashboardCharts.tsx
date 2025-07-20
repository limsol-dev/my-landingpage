'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Users,
  DollarSign,
  Home,
  Star
} from 'lucide-react'
import type { 
  ReservationTrend, 
  ProgramPopularity, 
  RoomOccupancy,
  DashboardStats 
} from '@/hooks/use-dashboard-data'

// =============================================
// Chart Configuration
// =============================================

const chartConfig = {
  reservations: {
    label: '예약 수',
    color: 'hsl(var(--chart-1))',
  },
  revenue: {
    label: '매출',
    color: 'hsl(var(--chart-2))',
  },
  confirmed: {
    label: '확정',
    color: 'hsl(var(--chart-1))',
  },
  pending: {
    label: '대기',
    color: 'hsl(var(--chart-3))',
  },
  cancelled: {
    label: '취소',
    color: 'hsl(var(--chart-4))',
  },
  completed: {
    label: '완료',
    color: 'hsl(var(--chart-2))',
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
// Props Interfaces
// =============================================

interface DashboardChartsProps {
  stats: DashboardStats
  reservationTrends: ReservationTrend[]
  programPopularity: ProgramPopularity[]
  roomOccupancy: RoomOccupancy[]
  isLoading?: boolean
}

// =============================================
// Revenue Trend Chart Component
// =============================================

function RevenueTrendChart({ data, isLoading }: { data: ReservationTrend[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            매출 트렌드 (최근 30일)
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

  const formattedData = data.map(item => ({
    ...item,
    dateLabel: format(parseISO(item.date), 'MM/dd', { locale: ko }),
    formattedRevenue: `₩${item.revenue.toLocaleString()}`
  }))

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const averageDaily = Math.round(totalRevenue / data.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          매출 트렌드 (최근 30일)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          총 매출: ₩{totalRevenue.toLocaleString()} | 일 평균: ₩{averageDaily.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}K`}
              />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₩${Number(value).toLocaleString()}` : value,
                    name === 'revenue' ? '매출' : '예약 수'
                  ]}
                />}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke={chartConfig.revenue.color}
                fill={chartConfig.revenue.color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// =============================================
// Reservation Status Chart Component
// =============================================

function ReservationStatusChart({ stats, isLoading }: { stats: DashboardStats, isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            예약 상태 분포
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

  const data = [
    { name: '확정', value: stats.confirmedReservations, color: chartConfig.confirmed.color },
    { name: '대기', value: stats.pendingReservations, color: chartConfig.pending.color },
    { name: '완료', value: stats.completedReservations, color: chartConfig.completed.color },
    { name: '취소', value: stats.cancelledReservations, color: chartConfig.cancelled.color }
  ].filter(item => item.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          예약 상태 분포
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          총 {stats.totalReservations}건의 예약
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}건`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [`${value}건`, name]}
                />}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}: {item.value}건</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================
// Program Popularity Chart Component
// =============================================

function ProgramPopularityChart({ data, isLoading }: { data: ProgramPopularity[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            인기 프로그램 순위
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

  const formattedData = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
    formattedRevenue: `₩${item.revenue.toLocaleString()}`
  }))

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          인기 프로그램 순위 (TOP {data.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          확정/완료된 예약 기준
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="programName" 
                tick={{ fontSize: 11 }}
                width={120}
              />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    name === 'reservationCount' ? `${value}건` : `₩${Number(value).toLocaleString()}`,
                    name === 'reservationCount' ? '예약 수' : '매출'
                  ]}
                />}
              />
              <Bar 
                dataKey="reservationCount" 
                fill={chartConfig.confirmed.color}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// =============================================
// Room Occupancy Chart Component
// =============================================

function RoomOccupancyChart({ data, isLoading }: { data: RoomOccupancy[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            객실 점유율
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

  const formattedData = data.map(item => ({
    ...item,
    occupancyDisplay: `${item.occupancyRate}%`
  }))

  const averageOccupancy = data.length > 0 ? 
    Math.round(data.reduce((sum, item) => sum + item.occupancyRate, 0) / data.length) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          객실 점유율
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          평균 점유율: {averageOccupancy}%
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
                             <XAxis 
                 dataKey="roomName" 
                 tick={{ fontSize: 11 }}
                 height={60}
                 angle={-45}
               />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    name === 'occupancyRate' ? `${value}%` : `${value}건`,
                    name === 'occupancyRate' ? '점유율' : 
                    name === 'confirmedBookings' ? '확정 예약' : '전체 예약'
                  ]}
                />}
              />
              <Bar 
                dataKey="occupancyRate" 
                fill={chartConfig.confirmed.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// =============================================
// Main Dashboard Charts Component
// =============================================

export default function DashboardCharts({
  stats,
  reservationTrends,
  programPopularity,
  roomOccupancy,
  isLoading = false
}: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {/* 첫 번째 행: 매출 트렌드 & 예약 상태 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart data={reservationTrends} isLoading={isLoading} />
        <ReservationStatusChart stats={stats} isLoading={isLoading} />
      </div>

      {/* 두 번째 행: 프로그램 인기도 & 객실 점유율 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProgramPopularityChart data={programPopularity} isLoading={isLoading} />
        <RoomOccupancyChart data={roomOccupancy} isLoading={isLoading} />
      </div>
    </div>
  )
} 