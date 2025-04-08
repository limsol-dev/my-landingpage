// 브라우저 환경 체크 유틸리티 함수
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
} 