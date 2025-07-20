import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useCallback, useRef } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 디바운스 훅
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay]
  ) as T

  return debouncedCallback
}

// 쓰로틀 훅
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const throttleRef = useRef<NodeJS.Timeout | null>(null)
  const lastRunRef = useRef<number>(0)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastRunRef.current >= delay) {
        callback(...args)
        lastRunRef.current = now
      } else if (!throttleRef.current) {
        throttleRef.current = setTimeout(() => {
          callback(...args)
          lastRunRef.current = Date.now()
          throttleRef.current = null
        }, delay - (now - lastRunRef.current))
      }
    },
    [callback, delay]
  ) as T

  return throttledCallback
}

// 로컬 스토리지 헬퍼
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue || null
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return defaultValue || null
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }
}

// 날짜 포맷팅 헬퍼
export function formatDate(date: Date | string, locale: string = 'ko-KR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 전화번호 포맷팅
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return phone
}

// 가격 포맷팅
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(price)
}

// 에러 메시지 정규화
export function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '알 수 없는 오류가 발생했습니다.'
}
