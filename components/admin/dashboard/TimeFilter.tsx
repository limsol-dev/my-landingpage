'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================
// 시간 필터 옵션 타입
// =============================================
export type TimeRange = '1h' | '24h' | '7d' | '30d'

interface TimeFilterOption {
  value: TimeRange
  label: string
  description: string
}

const TIME_FILTER_OPTIONS: TimeFilterOption[] = [
  {
    value: '1h',
    label: '1시간',
    description: '최근 1시간'
  },
  {
    value: '24h',
    label: '24시간',
    description: '최근 24시간'
  },
  {
    value: '7d',
    label: '7일',
    description: '최근 7일'
  },
  {
    value: '30d',
    label: '30일',
    description: '최근 30일'
  }
]

// =============================================
// 시간 필터 컴포넌트 Props
// =============================================
interface TimeFilterProps {
  selectedTimeRange: TimeRange
  onTimeRangeChange: (timeRange: TimeRange) => void
  onRefresh?: () => void
  isLoading?: boolean
  lastUpdated?: Date
}

// =============================================
// 시간 필터 컴포넌트
// =============================================
export function TimeFilter({
  selectedTimeRange,
  onTimeRangeChange,
  onRefresh,
  isLoading = false,
  lastUpdated
}: TimeFilterProps) {
  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) {
      return `${seconds}초 전`
    } else if (minutes < 60) {
      return `${minutes}분 전`
    } else if (hours < 24) {
      return `${hours}시간 전`
    } else {
      return date.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          시간 범위 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 시간 범위 선택 버튼들 */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIME_FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedTimeRange === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeRangeChange(option.value)}
              disabled={isLoading}
              className={cn(
                'flex flex-col h-auto py-2 px-3',
                selectedTimeRange === option.value && 'bg-primary text-primary-foreground'
              )}
            >
              <span className="font-medium text-sm">{option.label}</span>
              <span className="text-xs opacity-75">{option.description}</span>
            </Button>
          ))}
        </div>

        {/* 새로고침 버튼 및 마지막 업데이트 시간 */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {lastUpdated && (
              <span>
                마지막 업데이트: {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </div>
          
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 px-2"
            >
              <RefreshCw className={cn(
                'h-4 w-4',
                isLoading && 'animate-spin'
              )} />
              <span className="ml-1 hidden sm:inline">새로고침</span>
            </Button>
          )}
        </div>

        {/* 실시간 상태 표시 */}
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            'w-2 h-2 rounded-full',
            isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
          )} />
          <span className="text-muted-foreground">
            {isLoading ? '업데이트 중...' : '실시간 데이터'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
} 