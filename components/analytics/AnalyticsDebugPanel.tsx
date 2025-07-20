"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAnalytics } from '@/hooks/use-analytics'
import { analyticsQueue } from '@/lib/analytics-queue'
import { 
  Activity, 
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Network,
  Trash2,
  RefreshCw,
  Eye,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface EventLog {
  id: string
  timestamp: number
  event_type: string
  metadata: any
  status: 'pending' | 'sent' | 'failed'
}

export default function AnalyticsDebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])
  const [queueStatus, setQueueStatus] = useState<any>({})
  const [performanceStats, setPerformanceStats] = useState({
    eventsToday: 0,
    averageLatency: 0,
    errorRate: 0,
    lastUpdate: Date.now()
  })

  const { sessionId, isInitialized } = useAnalytics()

  // 개발 환경에서만 표시
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development')
  }, [])

  // 큐 상태 모니터링
  useEffect(() => {
    if (!isVisible) return

    const updateStatus = () => {
      setQueueStatus(analyticsQueue.getQueueStatus())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000)

    return () => clearInterval(interval)
  }, [isVisible])

  // 이벤트 로그 수집
  useEffect(() => {
    if (!isVisible) return

    // 원본 trackEvent 함수를 래핑하여 로그 수집
    const originalConsoleLog = console.log
    console.log = (...args) => {
      if (args[0]?.includes?.('📊')) {
        const logEntry: EventLog = {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          event_type: 'batch_processing',
          metadata: args,
          status: 'sent'
        }
        
        setEventLogs(prev => [logEntry, ...prev.slice(0, 49)]) // 최대 50개 보관
      }
      
      originalConsoleLog.apply(console, args)
    }

    return () => {
      console.log = originalConsoleLog
    }
  }, [isVisible])

  // 큐 강제 처리
  const handleForceProcess = async () => {
    await analyticsQueue.forceProcessQueue()
  }

  // 큐 초기화
  const handleClearQueue = () => {
    analyticsQueue.clearQueue()
    setEventLogs([])
  }

  // 테스트 이벤트 생성
  const handleGenerateTestEvent = () => {
    const testEvent = {
      session_id: sessionId,
      event_type: 'debug_test',
      page_url: window.location.href,
      conversion_funnel_step: 1,
      device_type: 'desktop',
      browser: 'test',
      os: 'test',
      metadata: {
        test: true,
        timestamp: Date.now(),
        debug_panel: 'generated'
      }
    }

    analyticsQueue.enqueue(testEvent)

    const logEntry: EventLog = {
      id: `test_${Date.now()}`,
      timestamp: Date.now(),
      event_type: 'debug_test',
      metadata: testEvent,
      status: 'pending'
    }

    setEventLogs(prev => [logEntry, ...prev.slice(0, 49)])
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 max-h-96 shadow-lg border-2 border-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Analytics Debug Panel
            <Badge variant="outline" className="ml-auto">
              {process.env.NODE_ENV}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            실시간 이벤트 추적 및 큐 상태 모니터링
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="status" className="text-xs">상태</TabsTrigger>
              <TabsTrigger value="queue" className="text-xs">큐</TabsTrigger>
              <TabsTrigger value="logs" className="text-xs">로그</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs">Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${queueStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs">Network</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Session ID:</span>
                  <span className="font-mono text-gray-600">
                    {sessionId ? `${sessionId.slice(-8)}...` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Queue Length:</span>
                  <Badge variant="outline">{queueStatus.queueLength || 0}</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Failed Events:</span>
                  <Badge variant={queueStatus.failedEvents > 0 ? "destructive" : "outline"}>
                    {queueStatus.failedEvents || 0}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleGenerateTestEvent} className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  테스트
                </Button>
                <Button size="sm" variant="outline" onClick={handleForceProcess} className="text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  처리
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="queue" className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">큐 상태</span>
                  <Badge variant={queueStatus.processing ? "default" : "outline"}>
                    {queueStatus.processing ? "처리중" : "대기중"}
                  </Badge>
                </div>

                {queueStatus.queueLength > 0 && (
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {queueStatus.queueLength}개 이벤트가 큐에 대기 중입니다.
                      {queueStatus.failedEvents > 0 && ` (${queueStatus.failedEvents}개 실패)`}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>처리 대기:</span>
                    <span>{queueStatus.queueLength || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>재시도 필요:</span>
                    <span>{queueStatus.failedEvents || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>네트워크:</span>
                    <span className={queueStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                      {queueStatus.isOnline ? '온라인' : '오프라인'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleForceProcess} className="text-xs">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    강제 처리
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleClearQueue} className="text-xs">
                    <Trash2 className="w-3 h-3 mr-1" />
                    초기화
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">실시간 이벤트 로그</span>
                <Badge variant="outline">{eventLogs.length}</Badge>
              </div>

              <ScrollArea className="h-40 w-full">
                <div className="space-y-2">
                  {eventLogs.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-4">
                      이벤트 로그가 없습니다
                    </div>
                  ) : (
                    eventLogs.map((log) => (
                      <div key={log.id} className="border rounded p-2 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono">{log.event_type}</span>
                          <div className="flex items-center gap-1">
                            {log.status === 'sent' && <CheckCircle className="w-3 h-3 text-green-500" />}
                            {log.status === 'failed' && <AlertCircle className="w-3 h-3 text-red-500" />}
                            {log.status === 'pending' && <Clock className="w-3 h-3 text-yellow-500" />}
                            <span className="text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        {log.metadata && (
                          <pre className="text-xs text-gray-600 overflow-hidden">
                            {JSON.stringify(log.metadata, null, 1).slice(0, 100)}...
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <Button size="sm" variant="outline" onClick={() => setEventLogs([])} className="text-xs w-full">
                <Trash2 className="w-3 h-3 mr-1" />
                로그 지우기
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 