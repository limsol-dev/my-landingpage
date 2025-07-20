'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import { 
  Download, 
  FileSpreadsheet, 
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
  ShoppingCart,
  Activity,
  AlertCircle,
  Filter,
  Search,
  Eye
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

// =============================================
// 타입 정의
// =============================================

interface AnalyticsFilter {
  startDate: string
  endDate: string
  groupBy: 'day' | 'week' | 'month'
  roomId?: string
  programId?: string
  eventTypes: string[]
}

interface ConversionData {
  step: string
  count: number
  conversionRate: number
  dropOffRate: number
}

interface PopularityData {
  id: string
  name: string
  views: number
  reservations: number
  conversionRate: number
  revenue: number
}

interface DetailedEvent {
  id: string
  eventType: string
  timestamp: string
  sessionId: string
  roomId?: string
  programIds: string[]
  estimatedPrice: number
  conversionStep: number
  attemptStatus: string
  deviceType: string
  customerName?: string
}

interface AnalyticsData {
  summary: {
    totalEvents: number
    totalSessions: number
    totalReservations: number
    overallConversionRate: number
    averageOrderValue: number
    bounceRate: number
  }
  conversionFunnel: ConversionData[]
  popularRooms: PopularityData[]
  popularPrograms: PopularityData[]
  timeseriesData: Array<{
    date: string
    events: number
    sessions: number
    reservations: number
    conversionRate: number
  }>
  detailedEvents: DetailedEvent[]
}

// =============================================
// 차트 색상 팔레트
// =============================================

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
]

// =============================================
// 메인 리포트 분석 컴포넌트
// =============================================

export default function ReportsAnalytics() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AnalyticsFilter>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    groupBy: 'day',
    eventTypes: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // =============================================
  // 데이터 페칭
  // =============================================

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy,
        ...(filters.roomId && { roomId: filters.roomId }),
        ...(filters.programId && { programId: filters.programId }),
        ...(filters.eventTypes.length > 0 && { eventTypes: filters.eventTypes.join(',') })
      })

      const response = await fetch(`/api/admin/analytics/reports?${params}`)
      
      if (!response.ok) {
        throw new Error('분석 데이터를 불러오는데 실패했습니다')
      }

      const result = await response.json()
      setData(result.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('분석 데이터 페칭 오류:', err)
      setError(err instanceof Error ? err.message : '데이터 로딩 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // =============================================
  // 다운로드 처리
  // =============================================

  const handleExport = async (type: 'xlsx' | 'csv', reportType: 'summary' | 'detailed' | 'conversion' | 'popular') => {
    try {
      const params = new URLSearchParams({
        ...filters,
        type,
        reportType,
        startDate: filters.startDate,
        endDate: filters.endDate
      })

      const response = await fetch(`/api/admin/analytics/export?${params}`)
      
      if (!response.ok) {
        throw new Error('다운로드에 실패했습니다')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const filename = `분석리포트_${reportType}_${filters.startDate}_${filters.endDate}.${type}`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`${type.toUpperCase()} 파일 다운로드가 완료되었습니다`)
    } catch (error) {
      console.error('다운로드 오류:', error)
      toast.error(error instanceof Error ? error.message : '다운로드에 실패했습니다')
    }
  }

  // =============================================
  // 초기 데이터 로딩
  // =============================================

  useEffect(() => {
    fetchAnalyticsData()
  }, [filters])

  // =============================================
  // 렌더링
  // =============================================

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">누적 리포트 & 분석</h2>
          <p className="text-muted-foreground">
            클릭/예약 시도 데이터를 기반으로 한 상세 분석 리포트
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            마지막 업데이트: {format(lastUpdated, 'HH:mm:ss', { locale: ko })}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchAnalyticsData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>시작일</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>종료일</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>집계 단위</Label>
              <Select value={filters.groupBy} onValueChange={(value: 'day' | 'week' | 'month') => setFilters({ ...filters, groupBy: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">일별</SelectItem>
                  <SelectItem value="week">주별</SelectItem>
                  <SelectItem value="month">월별</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>객실 필터</Label>
              <Select value={filters.roomId || ''} onValueChange={(value) => setFilters({ ...filters, roomId: value || undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 객실" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체 객실</SelectItem>
                  {/* 실제 객실 목록이 여기에 들어감 */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 에러 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 메인 콘텐츠 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="conversion">전환율</TabsTrigger>
          <TabsTrigger value="popular">인기도</TabsTrigger>
          <TabsTrigger value="detailed">상세내역</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <ConversionTab data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <PopularTab data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <DetailedTab 
            data={data} 
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onExport={handleExport}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// =============================================
// 개요 탭 컴포넌트
// =============================================

function OverviewTab({ data, isLoading }: { data: AnalyticsData | null; isLoading: boolean }) {
  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!data) {
    return <div className="text-center py-8">데이터가 없습니다.</div>
  }

  return (
    <div className="space-y-6">
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="총 이벤트"
          value={data.summary.totalEvents}
          icon={Activity}
          trend="up"
          description="전체 클릭/조회 수"
        />
        <StatCard
          title="총 세션"
          value={data.summary.totalSessions}
          icon={Users}
          trend="up"
          description="순 방문자 수"
        />
        <StatCard
          title="예약 완료"
          value={data.summary.totalReservations}
          icon={ShoppingCart}
          trend="up"
          description="실제 예약 건수"
        />
        <StatCard
          title="전환율"
          value={`${data.summary.overallConversionRate.toFixed(2)}%`}
          icon={TrendingUp}
          trend="up"
          description="예약 완료율"
        />
      </div>

      {/* 트렌드 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>시간별 트렌드</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.timeseriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="events" 
                stroke={COLORS[0]} 
                name="이벤트 수"
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke={COLORS[1]} 
                name="세션 수"
              />
              <Line 
                type="monotone" 
                dataKey="reservations" 
                stroke={COLORS[2]} 
                name="예약 완료"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================
// 전환율 탭 컴포넌트
// =============================================

function ConversionTab({ data, isLoading }: { data: AnalyticsData | null; isLoading: boolean }) {
  if (isLoading) return <div className="text-center py-8">로딩 중...</div>
  if (!data) return <div className="text-center py-8">데이터가 없습니다.</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>전환 퍼널</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <FunnelChart data={data.conversionFunnel}>
              <Tooltip />
              <Funnel
                dataKey="count"
                data={data.conversionFunnel}
                isAnimationActive
              >
                <LabelList position="center" fill="#fff" stroke="none" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>단계별 전환율</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>단계</TableHead>
                <TableHead>사용자 수</TableHead>
                <TableHead>전환율</TableHead>
                <TableHead>이탈율</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.conversionFunnel.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.step}</TableCell>
                  <TableCell>{item.count.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={item.conversionRate > 50 ? "default" : "secondary"}>
                      {item.conversionRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.dropOffRate > 50 ? "destructive" : "outline"}>
                      {item.dropOffRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================
// 인기도 탭 컴포넌트
// =============================================

function PopularTab({ data, isLoading }: { data: AnalyticsData | null; isLoading: boolean }) {
  if (isLoading) return <div className="text-center py-8">로딩 중...</div>
  if (!data) return <div className="text-center py-8">데이터가 없습니다.</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>인기 객실</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.popularRooms}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill={COLORS[0]} name="조회수" />
                <Bar dataKey="reservations" fill={COLORS[1]} name="예약수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>인기 프로그램</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.popularPrograms}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill={COLORS[2]} name="조회수" />
                <Bar dataKey="reservations" fill={COLORS[3]} name="예약수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// =============================================
// 상세내역 탭 컴포넌트
// =============================================

function DetailedTab({ 
  data, 
  isLoading, 
  searchTerm, 
  onSearchChange, 
  onExport 
}: { 
  data: AnalyticsData | null
  isLoading: boolean
  searchTerm: string
  onSearchChange: (term: string) => void
  onExport: (type: 'xlsx' | 'csv', reportType: 'summary' | 'detailed' | 'conversion' | 'popular') => void
}) {
  if (isLoading) return <div className="text-center py-8">로딩 중...</div>
  if (!data) return <div className="text-center py-8">데이터가 없습니다.</div>

  const filteredEvents = data.detailedEvents.filter(event => 
    event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.customerName && event.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="이벤트 검색..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Badge variant="outline">
            {filteredEvents.length}개 이벤트
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onExport('xlsx', 'detailed')}>
            <Download className="h-4 w-4 mr-2" />
            엑셀 다운로드
          </Button>
          <Button variant="outline" onClick={() => onExport('csv', 'detailed')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV 다운로드
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시간</TableHead>
                <TableHead>이벤트</TableHead>
                <TableHead>세션</TableHead>
                <TableHead>객실/프로그램</TableHead>
                <TableHead>예상 금액</TableHead>
                <TableHead>단계</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>기기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.slice(0, 100).map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    {format(new Date(event.timestamp), 'MM/dd HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.eventType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {event.sessionId.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {event.roomId && <div>객실: {event.roomId}</div>}
                    {event.programIds.length > 0 && (
                      <div>프로그램: {event.programIds.length}개</div>
                    )}
                  </TableCell>
                  <TableCell>
                    ₩{event.estimatedPrice.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{event.conversionStep}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        event.attemptStatus === 'completed' ? 'default' : 
                        event.attemptStatus === 'abandoned' ? 'destructive' : 'secondary'
                      }
                    >
                      {event.attemptStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.deviceType}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================
// 통계 카드 컴포넌트
// =============================================

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description 
}: { 
  title: string
  value: number | string
  icon: any
  trend?: 'up' | 'down' | 'neutral'
  description: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
            <span className="text-xs text-muted-foreground">vs 이전 기간</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 