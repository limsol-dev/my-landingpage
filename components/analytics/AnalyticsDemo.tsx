"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAnalytics } from '@/hooks/use-analytics'
import { 
  Activity, 
  Eye, 
  MousePointer, 
  Calendar, 
  Users, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react'

export default function AnalyticsDemo() {
  const { 
    sessionId,
    isInitialized,
    trackPageView,
    trackRoomView,
    trackEvent,
    trackReservationStart,
    getConversionFunnel,
    getDailyEventStats,
    getRoomInterestAnalysis
  } = useAnalytics()

  const [eventLog, setEventLog] = useState<string[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // 이벤트 로그에 추가하는 헬퍼 함수
  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ko-KR')
    setEventLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  // 분석 데이터 로드
  const loadAnalyticsData = async () => {
    setIsLoadingData(true)
    try {
      const [funnelData, dailyStats, roomAnalysis] = await Promise.all([
        getConversionFunnel(),
        getDailyEventStats(),
        getRoomInterestAnalysis()
      ])
      
      setAnalyticsData({
        funnel: funnelData.slice(0, 5),
        daily: dailyStats.slice(0, 10),
        rooms: roomAnalysis.slice(0, 5)
      })
      
      addToLog('분석 데이터 로드 완료')
    } catch (error) {
      addToLog('분석 데이터 로드 실패: ' + error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // 데모 이벤트 추적 함수들
  const demoPageView = () => {
    trackPageView('/demo', { demo: true, component: 'AnalyticsDemo' })
    addToLog('페이지 조회 이벤트 전송')
  }

  const demoRoomView = () => {
    const roomId = 'demo-room-' + Math.random().toString(36).substr(2, 9)
    trackRoomView(roomId, { demo: true, room_type: 'deluxe' })
    addToLog(`객실 조회 이벤트 전송 (${roomId})`)
  }

  const demoDateSelect = () => {
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 1)
    
    trackEvent({
      event_type: 'date_select',
      check_in_date: checkIn.toISOString().split('T')[0],
      check_out_date: checkOut.toISOString().split('T')[0],
      conversion_funnel_step: 3,
      metadata: { demo: true, selection_method: 'calendar' }
    })
    addToLog(`날짜 선택 이벤트 전송 (${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()})`)
  }

  const demoReservationStart = () => {
    const roomId = 'demo-room-premium'
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 2)
    
    trackReservationStart(
      roomId,
      checkIn.toISOString().split('T')[0],
      checkOut.toISOString().split('T')[0],
      2, // adults
      0, // children
      ['demo-program-bbq', 'demo-program-breakfast'],
      850000 // estimated price
    )
    addToLog('예약 시작 이벤트 전송 (2박 3일, 2명, 부가옵션 2개)')
  }

  const demoPriceCheck = () => {
    trackEvent({
      event_type: 'price_check',
      room_id: 'demo-room-standard',
      adults_count: 2,
      children_count: 1,
      estimated_total_price: 650000,
      conversion_funnel_step: 3,
      metadata: { 
        demo: true, 
        price_comparison: true,
        original_price: 750000,
        discount_applied: true
      }
    })
    addToLog('가격 확인 이벤트 전송 (할인 적용)')
  }

  // 컴포넌트 마운트 시 페이지 뷰 추적
  useEffect(() => {
    if (isInitialized) {
      addToLog('Analytics 시스템 초기화 완료')
      demoPageView()
    }
  }, [isInitialized])

  if (process.env.NODE_ENV === 'production') {
    return null // Production 환경에서는 표시하지 않음
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics 시스템 데모
          </CardTitle>
          <CardDescription>
            사용자 행동 추적 및 분석 시스템의 작동을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 시스템 상태 */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">시스템 상태:</span>
            </div>
            <Badge variant={isInitialized ? "default" : "secondary"}>
              {isInitialized ? '활성화됨' : '초기화 중...'}
            </Badge>
            {sessionId && (
              <div className="text-xs text-muted-foreground">
                세션 ID: {sessionId.slice(-8)}
              </div>
            )}
          </div>

          {/* 데모 버튼들 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              onClick={demoPageView} 
              disabled={!isInitialized}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              페이지 조회
            </Button>
            
            <Button 
              onClick={demoRoomView} 
              disabled={!isInitialized}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <MousePointer className="h-4 w-4" />
              객실 조회
            </Button>
            
            <Button 
              onClick={demoDateSelect} 
              disabled={!isInitialized}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              날짜 선택
            </Button>
            
            <Button 
              onClick={demoPriceCheck} 
              disabled={!isInitialized}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              가격 확인
            </Button>
            
            <Button 
              onClick={demoReservationStart} 
              disabled={!isInitialized}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              예약 시작
            </Button>
            
            <Button 
              onClick={loadAnalyticsData} 
              disabled={!isInitialized || isLoadingData}
              variant="default" 
              size="sm"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {isLoadingData ? '로딩...' : '데이터 조회'}
            </Button>
          </div>

          {/* 이벤트 로그 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">이벤트 로그</h4>
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
              {eventLog.length > 0 ? (
                <div className="space-y-1">
                  {eventLog.map((log, index) => (
                    <div key={index} className="text-xs font-mono text-gray-700">
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  이벤트가 기록되면 여기에 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 분석 데이터 표시 */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 전환 깔때기 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">전환 깔때기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.funnel.map((step: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>단계 {step.conversion_funnel_step}</span>
                    <span>{step.attempts_count}회</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 일별 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">최근 이벤트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.daily.slice(0, 5).map((stat: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{stat.event_type}</span>
                    <span>{stat.event_count}회</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 객실 관심도 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">객실 관심도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.rooms.map((room: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="truncate">{room.room_name || '객실 ' + (index + 1)}</span>
                    <span>{room.total_interactions}회</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          이 데모는 개발 환경에서만 표시됩니다. 실제 분석 데이터는 관리자 대시보드에서 확인할 수 있습니다.
        </AlertDescription>
      </Alert>
    </div>
  )
} 