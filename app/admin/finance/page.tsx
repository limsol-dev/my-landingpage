'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { 
  Download, 
  FileSpreadsheet, 
  RefreshCw,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  AlertCircle,
  Filter,
  Eye,
  Banknote
} from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'
import { useSettlementData } from '@/hooks/use-settlement-data'

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
// 메인 정산 페이지 컴포넌트
// =============================================

export default function FinancePage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  const {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refreshData,
    exportData,
    lastUpdated
  } = useSettlementData({
    autoRefresh: false,
    initialFilters: {
      startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      groupBy: 'day'
    }
  })

  // =============================================
  // 다운로드 핸들러
  // =============================================

  const handleExport = async (type: 'xlsx' | 'csv', reportType: 'summary' | 'detailed' | 'programs' | 'partners') => {
    try {
      await exportData(type, reportType)
      toast.success(`${type.toUpperCase()} 파일 다운로드가 시작되었습니다`)
    } catch (error) {
      console.error('다운로드 오류:', error)
      toast.error(error instanceof Error ? error.message : '다운로드에 실패했습니다')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">정산 관리</h1>
          <p className="text-muted-foreground">
            매출 현황 및 정산 리포트를 확인하고 관리하세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            마지막 업데이트: {format(lastUpdated, 'HH:mm:ss', { locale: ko })}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 필터 섹션 */}
      <SettlementFilters 
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={isLoading}
      />

      {/* 에러 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            정산 데이터를 불러오는데 실패했습니다: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 메인 콘텐츠 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="trends">트렌드</TabsTrigger>
          <TabsTrigger value="programs">프로그램</TabsTrigger>
          <TabsTrigger value="exports">다운로드</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendsTab data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <ProgramsTab data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="exports" className="space-y-6">
          <ExportsTab 
            data={data} 
            filters={filters}
            onExport={handleExport}
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// =============================================
// 필터 컴포넌트
// =============================================

interface SettlementFiltersProps {
  filters: any
  onFiltersChange: (filters: any) => void
  isLoading: boolean
}

function SettlementFilters({ filters, onFiltersChange, isLoading }: SettlementFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          필터 설정
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">시작일</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => onFiltersChange({ startDate: e.target.value })}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">종료일</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => onFiltersChange({ endDate: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>집계 기준</Label>
            <Select
              value={filters.groupBy}
              onValueChange={(value) => onFiltersChange({ groupBy: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">일별</SelectItem>
                <SelectItem value="month">월별</SelectItem>
                <SelectItem value="program">프로그램별</SelectItem>
                <SelectItem value="partner">파트너별</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>결제 상태</Label>
            <Select
              value={filters.paymentStatus || 'completed'}
              onValueChange={(value) => onFiltersChange({ paymentStatus: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="completed">결제완료</SelectItem>
                <SelectItem value="pending">결제대기</SelectItem>
                <SelectItem value="refunded">환불완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={() => onFiltersChange({})}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              필터 초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================
// 개요 탭 컴포넌트
// =============================================

interface TabProps {
  data: any
  isLoading: boolean
}

function OverviewTab({ data, isLoading }: TabProps) {
  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!data) {
    return <div className="text-center py-8">데이터가 없습니다.</div>
  }

  const summary = data.summary || {}

  return (
    <div className="space-y-6">
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="총 매출"
          value={`₩${(summary.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          description="전체 기간 총매출"
        />
        <StatsCard
          title="객실 매출"
          value={`₩${(summary.totalRoomRevenue || 0).toLocaleString()}`}
          icon={Banknote}
          trend="up"
          description="객실 예약 매출"
        />
        <StatsCard
          title="프로그램 매출"
          value={`₩${(summary.totalProgramRevenue || 0).toLocaleString()}`}
          icon={Package}
          trend="up"
          description="부가 프로그램 매출"
        />
        <StatsCard
          title="총 예약"
          value={`${(summary.totalReservations || 0).toLocaleString()}건`}
          icon={Users}
          trend="up"
          description="확정된 예약 건수"
        />
      </div>

      {/* 결제 상태 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>결제 상태별 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentStatusChart payments={data.payments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>매출 구성</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueCompositionChart summary={summary} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// =============================================
// 트렌드 탭 컴포넌트
// =============================================

function TrendsTab({ data, isLoading }: TabProps) {
  if (isLoading) return <div className="text-center py-8">로딩 중...</div>
  if (!data) return <div className="text-center py-8">데이터가 없습니다.</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>매출 트렌드</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.daily || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`₩${value.toLocaleString()}`, '매출']}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke={COLORS[0]}
                fill={COLORS[0]}
                name="총 매출"
              />
              <Area
                type="monotone"
                dataKey="roomRevenue"
                stackId="1"
                stroke={COLORS[1]}
                fill={COLORS[1]}
                name="객실 매출"
              />
              <Area
                type="monotone"
                dataKey="programRevenue"
                stackId="1"
                stroke={COLORS[2]}
                fill={COLORS[2]}
                name="프로그램 매출"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예약 건수 트렌드</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.daily || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value}건`, '예약 건수']}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="reservationCount"
                stroke={COLORS[3]}
                strokeWidth={2}
                name="예약 건수"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================
// 프로그램 탭 컴포넌트
// =============================================

function ProgramsTab({ data, isLoading }: TabProps) {
  if (isLoading) return <div className="text-center py-8">로딩 중...</div>
  if (!data) return <div className="text-center py-8">데이터가 없습니다.</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>프로그램별 매출 순위</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.programs?.slice(0, 10) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="programName"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`₩${value.toLocaleString()}`, '매출']}
                />
                <Bar
                  dataKey="totalRevenue"
                  fill={COLORS[1]}
                  name="총 매출"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>파트너별 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data.partners || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="totalRevenue"
                  nameKey="partnerName"
                  label={({ partnerName, totalRevenue }) => 
                    `${partnerName}: ₩${totalRevenue.toLocaleString()}`
                  }
                >
                  {(data.partners || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₩${value.toLocaleString()}`, '매출']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 프로그램 상세 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>프로그램 상세 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>프로그램명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>총 매출</TableHead>
                <TableHead>판매 수량</TableHead>
                <TableHead>평균 단가</TableHead>
                <TableHead>예약 건수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.programs || []).slice(0, 20).map((program: any) => (
                <TableRow key={program.programId}>
                  <TableCell className="font-medium">{program.programName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{program.categoryName}</Badge>
                  </TableCell>
                  <TableCell>₩{program.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell>{program.totalQuantity}개</TableCell>
                  <TableCell>₩{program.averagePrice.toLocaleString()}</TableCell>
                  <TableCell>{program.reservationCount}건</TableCell>
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
// 다운로드 탭 컴포넌트
// =============================================

interface ExportsTabProps extends TabProps {
  filters: any
  onExport: (type: 'xlsx' | 'csv', reportType: 'summary' | 'detailed' | 'programs' | 'partners') => void
}

function ExportsTab({ data, filters, onExport, isLoading }: ExportsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              정산 요약 리포트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              예약별 정산 요약 정보를 다운로드합니다.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => onExport('xlsx', 'summary')}
                disabled={isLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                엑셀 다운로드
              </Button>
              <Button
                variant="outline"
                onClick={() => onExport('csv', 'summary')}
                disabled={isLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              상세 내역 리포트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              객실과 프로그램을 분리한 상세 내역입니다.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => onExport('xlsx', 'detailed')}
                disabled={isLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                엑셀 다운로드
              </Button>
              <Button
                variant="outline"
                onClick={() => onExport('csv', 'detailed')}
                disabled={isLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              프로그램별 정산
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              프로그램별 매출 및 통계 데이터입니다.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => onExport('xlsx', 'programs')}
                disabled={isLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                엑셀 다운로드
              </Button>
              <Button
                variant="outline"
                onClick={() => onExport('csv', 'programs')}
                disabled={isLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              파트너별 정산
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              파트너별 매출 및 수수료 정산 데이터입니다.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => onExport('xlsx', 'partners')}
                disabled={isLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                엑셀 다운로드
              </Button>
              <Button
                variant="outline"
                onClick={() => onExport('csv', 'partners')}
                disabled={isLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 현재 필터 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>다운로드 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">기간:</span>
              <p className="text-muted-foreground">
                {filters.startDate} ~ {filters.endDate}
              </p>
            </div>
            <div>
              <span className="font-medium">집계:</span>
              <p className="text-muted-foreground">{filters.groupBy}</p>
            </div>
            <div>
              <span className="font-medium">결제상태:</span>
              <p className="text-muted-foreground">{filters.paymentStatus || '전체'}</p>
            </div>
            <div>
              <span className="font-medium">데이터 건수:</span>
              <p className="text-muted-foreground">
                {data?.summary?.totalReservations || 0}건
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================
// 통계 카드 컴포넌트
// =============================================

interface StatsCardProps {
  title: string
  value: string
  icon: any
  trend?: 'up' | 'down' | 'neutral'
  description?: string
}

function StatsCard({ title, value, icon: Icon, trend = 'neutral', description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================
// 결제 상태 차트 컴포넌트
// =============================================

function PaymentStatusChart({ payments }: { payments: any }) {
  if (!payments) return <div>데이터 없음</div>

  const data = [
    { name: '완료', value: payments.completedAmount, color: COLORS[0] },
    { name: '대기', value: payments.pendingAmount, color: COLORS[1] },
    { name: '환불', value: payments.refundedAmount, color: COLORS[2] }
  ].filter(item => item.value > 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, value }) => `${name}: ₩${value.toLocaleString()}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`₩${value.toLocaleString()}`, '금액']} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// =============================================
// 매출 구성 차트 컴포넌트
// =============================================

function RevenueCompositionChart({ summary }: { summary: any }) {
  const data = [
    { name: '객실', value: summary.totalRoomRevenue || 0, color: COLORS[0] },
    { name: '프로그램', value: summary.totalProgramRevenue || 0, color: COLORS[1] }
  ].filter(item => item.value > 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, value }) => `${name}: ₩${value.toLocaleString()}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`₩${value.toLocaleString()}`, '매출']} />
      </PieChart>
    </ResponsiveContainer>
  )
} 