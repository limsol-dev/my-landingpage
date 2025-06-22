import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-6xl font-bold text-gray-300 mb-4">404</h2>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="space-x-4">
          <Link href="/">
            <Button>메인으로 돌아가기</Button>
          </Link>
          <Button variant="outline" onClick={() => {
            if (typeof window !== 'undefined') {
              window.history.back()
            }
          }}>
            이전 페이지
          </Button>
        </div>
      </div>
    </div>
  )
} 