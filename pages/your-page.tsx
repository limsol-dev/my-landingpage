import { useState, useEffect } from 'react'

function YourPage() {
  // 초기값을 서버와 클라이언트 모두 동일하게 설정
  const [date, setDate] = useState(() => new Date().toISOString())

  useEffect(() => {
    // 클라이언트에서만 업데이트
    setDate(new Date().toISOString())
  }, [])

  return <div>{date}</div>
}

export default YourPage 