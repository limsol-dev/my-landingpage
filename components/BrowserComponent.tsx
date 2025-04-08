import { useEffect } from 'react'
import { isBrowser } from '../utils/browser-utils'

function BrowserComponent() {
  useEffect(() => {
    if (isBrowser()) {
      // 브라우저 API 사용
    }
  }, [])
  
  return <div>{/* 컴포넌트 내용 */}</div>
}

export default BrowserComponent 