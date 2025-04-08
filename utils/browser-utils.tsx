// 브라우저 환경 체크 유틸리티 함수
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// 컴포넌트에서 사용
function YourComponent() {
  useEffect(() => {
    if (isBrowser()) {
      // 브라우저 API 사용
    }
  }, [])
  
  return <div>{/* 컴포넌트 내용 */}</div>
} 