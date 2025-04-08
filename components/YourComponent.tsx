import { useState, useEffect } from 'react'

function YourComponent() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // 또는 로딩 상태를 표시
  }

  // 클라이언트 사이드에서만 실행되어야 하는 코드
  return (
    <div>
      {/* 컴포넌트 내용 */}
    </div>
  )
}

export default YourComponent 