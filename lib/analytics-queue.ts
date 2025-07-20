"use client"

import { supabase } from './supabase'

// =============================================================================
// 고급 Analytics 이벤트 큐 및 재시도 시스템
// =============================================================================

interface QueuedEvent {
  id: string
  data: any
  timestamp: number
  retryCount: number
  lastAttempt?: number
  error?: string
}

interface QueueConfig {
  maxRetries: number
  baseDelay: number // 기본 지연시간 (ms)
  maxDelay: number // 최대 지연시간 (ms)
  batchSize: number // 배치당 최대 이벤트 수
  batchTimeout: number // 배치 타임아웃 (ms)
}

const DEFAULT_CONFIG: QueueConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1초
  maxDelay: 30000, // 30초
  batchSize: 10,
  batchTimeout: 100 // 100ms
}

class AnalyticsQueue {
  private config: QueueConfig
  private queue: QueuedEvent[] = []
  private processing = false
  private batchTimer?: NodeJS.Timeout
  private isOnline = true
  private readonly STORAGE_KEY = 'analytics_event_queue'

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      this.loadQueueFromStorage()
      this.setupNetworkListeners()
      this.startQueueProcessor()
    }
  }

  /**
   * 이벤트를 큐에 추가
   */
  enqueue(eventData: any): void {
    const event: QueuedEvent = {
      id: this.generateEventId(),
      data: eventData,
      timestamp: Date.now(),
      retryCount: 0
    }

    this.queue.push(event)
    this.saveQueueToStorage()
    
    // 온라인 상태이면 즉시 처리 시도
    if (this.isOnline && !this.processing) {
      this.scheduleProcessing()
    }
  }

  /**
   * 배치 처리 스케줄링
   */
  private scheduleProcessing(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch()
    }, this.config.batchTimeout)
  }

  /**
   * 배치 처리 실행
   */
  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0 || !this.isOnline) {
      return
    }

    this.processing = true

    try {
      // 재시도 간격이 지난 이벤트만 처리
      const readyEvents = this.queue.filter(event => this.isEventReady(event))
      
      if (readyEvents.length === 0) {
        this.processing = false
        this.scheduleNextProcessing()
        return
      }

      // 배치 크기만큼 가져오기
      const batch = readyEvents.slice(0, this.config.batchSize)
      
      console.log(`📊 Processing analytics batch: ${batch.length} events`)

      // 배치 전송
      const results = await Promise.allSettled(
        batch.map(event => this.sendEvent(event))
      )

      // 결과 처리
      for (let i = 0; i < batch.length; i++) {
        const event = batch[i]
        const result = results[i]

        if (result.status === 'fulfilled') {
          // 성공: 큐에서 제거
          this.removeEventFromQueue(event.id)
        } else {
          // 실패: 재시도 카운트 증가
          this.handleEventFailure(event, result.reason)
        }
      }

      this.saveQueueToStorage()

    } catch (error) {
      console.error('Batch processing error:', error)
    } finally {
      this.processing = false
      
      // 큐에 더 처리할 이벤트가 있으면 계속 처리
      if (this.queue.length > 0 && this.isOnline) {
        this.scheduleNextProcessing()
      }
    }
  }

  /**
   * 개별 이벤트 전송
   */
  private async sendEvent(event: QueuedEvent): Promise<void> {
    const { error } = await supabase
      .from('click_reservation_attempts')
      .insert(event.data)

    if (error) {
      throw error
    }
  }

  /**
   * 이벤트 처리 준비 여부 확인
   */
  private isEventReady(event: QueuedEvent): boolean {
    if (event.retryCount === 0) return true
    
    const now = Date.now()
    const lastAttempt = event.lastAttempt || event.timestamp
    const delay = this.calculateRetryDelay(event.retryCount)
    
    return now - lastAttempt >= delay
  }

  /**
   * 지수 백오프 계산
   */
  private calculateRetryDelay(retryCount: number): number {
    const delay = this.config.baseDelay * Math.pow(2, retryCount - 1)
    return Math.min(delay, this.config.maxDelay)
  }

  /**
   * 이벤트 실패 처리
   */
  private handleEventFailure(event: QueuedEvent, error: any): void {
    event.retryCount++
    event.lastAttempt = Date.now()
    event.error = error?.message || String(error)

    if (event.retryCount >= this.config.maxRetries) {
      console.warn(`Analytics event ${event.id} exceeded max retries, removing from queue`, {
        event: event.data,
        error: event.error,
        retryCount: event.retryCount
      })
      
      this.removeEventFromQueue(event.id)
    } else {
      console.warn(`Analytics event ${event.id} failed, will retry (${event.retryCount}/${this.config.maxRetries})`, {
        error: event.error,
        nextRetryIn: this.calculateRetryDelay(event.retryCount)
      })
    }
  }

  /**
   * 큐에서 이벤트 제거
   */
  private removeEventFromQueue(eventId: string): void {
    this.queue = this.queue.filter(event => event.id !== eventId)
  }

  /**
   * 다음 처리 스케줄링
   */
  private scheduleNextProcessing(): void {
    // 가장 빨리 처리 가능한 이벤트의 시간 계산
    const nextEvent = this.queue
      .filter(event => event.retryCount < this.config.maxRetries)
      .sort((a, b) => {
        const aNextTime = (a.lastAttempt || a.timestamp) + this.calculateRetryDelay(a.retryCount)
        const bNextTime = (b.lastAttempt || b.timestamp) + this.calculateRetryDelay(b.retryCount)
        return aNextTime - bNextTime
      })[0]

    if (nextEvent) {
      const now = Date.now()
      const nextTime = (nextEvent.lastAttempt || nextEvent.timestamp) + this.calculateRetryDelay(nextEvent.retryCount)
      const delay = Math.max(0, nextTime - now)

      setTimeout(() => {
        if (this.isOnline && !this.processing) {
          this.processBatch()
        }
      }, delay)
    }
  }

  /**
   * localStorage에 큐 저장
   */
  private saveQueueToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue))
    } catch (error) {
      console.warn('Failed to save analytics queue to localStorage:', error)
    }
  }

  /**
   * localStorage에서 큐 로드
   */
  private loadQueueFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
        console.log(`📊 Loaded ${this.queue.length} pending analytics events from storage`)
      }
    } catch (error) {
      console.warn('Failed to load analytics queue from localStorage:', error)
      this.queue = []
    }
  }

  /**
   * 네트워크 상태 리스너 설정
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('📶 Network back online, resuming analytics queue processing')
      
      if (this.queue.length > 0 && !this.processing) {
        this.scheduleProcessing()
      }
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📵 Network offline, analytics events will be queued')
    })

    // 초기 네트워크 상태 설정
    this.isOnline = navigator.onLine
  }

  /**
   * 큐 프로세서 시작
   */
  private startQueueProcessor(): void {
    // 페이지 로드시 저장된 이벤트가 있으면 처리
    if (this.queue.length > 0 && this.isOnline) {
      setTimeout(() => {
        this.scheduleProcessing()
      }, 1000) // 1초 후 시작
    }

    // 주기적 상태 확인 (5분마다)
    setInterval(() => {
      if (this.queue.length > 0 && this.isOnline && !this.processing) {
        this.scheduleProcessing()
      }
    }, 5 * 60 * 1000)
  }

  /**
   * 고유 이벤트 ID 생성
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 큐 상태 조회 (디버깅용)
   */
  getQueueStatus(): {
    queueLength: number
    processing: boolean
    isOnline: boolean
    failedEvents: number
    oldestEvent?: number
  } {
    const failedEvents = this.queue.filter(e => e.retryCount > 0).length
    const oldestEvent = this.queue.length > 0 
      ? Math.min(...this.queue.map(e => e.timestamp))
      : undefined

    return {
      queueLength: this.queue.length,
      processing: this.processing,
      isOnline: this.isOnline,
      failedEvents,
      oldestEvent
    }
  }

  /**
   * 큐 강제 처리 (개발자 도구용)
   */
  async forceProcessQueue(): Promise<void> {
    if (this.processing) return
    
    console.log('🔄 Force processing analytics queue...')
    await this.processBatch()
  }

  /**
   * 큐 초기화 (개발자 도구용)
   */
  clearQueue(): void {
    this.queue = []
    this.saveQueueToStorage()
    console.log('🗑️ Analytics queue cleared')
  }
}

// 전역 큐 인스턴스
export const analyticsQueue = new AnalyticsQueue()

// 개발 환경에서 전역 접근 가능하게 설정
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).analyticsQueue = analyticsQueue
} 