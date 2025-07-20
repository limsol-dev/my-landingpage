'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TimeFilter } from './TimeFilter'
import RealTimeCharts from './RealTimeCharts'
import { useRealtimeAnalytics } from '@/hooks/use-realtime-analytics'
import { BarChart3, RefreshCw, AlertTriangle, WifiOff } from 'lucide-react'

// =============================================
// 실시간 분석 대시보드 컴포넌트
// =============================================
interface RealtimeAnalyticsDashboardProps {
  className?: string
}

export default function RealtimeAnalyticsDashboard({ className }: RealtimeAnalyticsDashboardProps) {
  // 실시간 분석 데이터 훅 사용
  const {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    setTimeRange
  } = useRealtimeAnalytics({
    timeRange: '24h',
    autoRefresh: true,
    refreshInterval: 30000, // 30초마다 자동 새로고침
    enableRealtime: true
  })

  // 에러 상태 처리
  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              실시간 클릭/예약 시도 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>데이터 로딩 중 오류가 발생했습니다: {error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refresh}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  재시도
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              실시간 클릭/예약 시도 현황
            </div>
            <div className="flex items-center gap-2">
              {/* 실시간 상태 표시 */}
              <Badge variant="secondary" className="flex items-center gap-1">
                {isLoading ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    업데이트 중
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    실시간
                  </>
                )}
              </Badge>
              
              {/* 수동 새로고침 버튼 */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            웹사이트 방문자의 클릭 및 예약 시도 패턴을 실시간으로 추적합니다
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 시간 필터 */}
          <TimeFilter
            selectedTimeRange={data?.timeRange || '24h'}
            onTimeRangeChange={setTimeRange}
            onRefresh={refresh}
            isLoading={isLoading}
            lastUpdated={lastUpdated || undefined}
          />

          {/* 데이터 없음 상태 */}
          {!data && !isLoading && (
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                분석 데이터가 없습니다. 웹사이트에 방문자 활동이 있으면 여기에 표시됩니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 실시간 차트 */}
          <RealTimeCharts data={data} isLoading={isLoading} />

          {/* 추가 정보 */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">데이터 범위</span>
                    <Badge variant="outline">
                      {data.timeRange === '1h' && '최근 1시간'}
                      {data.timeRange === '24h' && '최근 24시간'}
                      {data.timeRange === '7d' && '최근 7일'}
                      {data.timeRange === '30d' && '최근 30일'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">마지막 업데이트</span>
                    <span className="text-sm font-medium">
                      {lastUpdated?.toLocaleString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 