"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // 이미 로그인된 경우 홈으로 리다이렉트
    if (!loading && isAuthenticated) {
      router.push('/')
      router.refresh()
    }
  }, [isAuthenticated, loading, router])

  // 로딩 중이면 빈 화면
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 이미 로그인된 경우 빈 화면 (리다이렉트 처리 중)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            달팽이 아지트 펜션
          </h1>
          <p className="text-gray-600">
            자연 속에서 힐링하는 특별한 공간에 함께하세요
          </p>
        </div>
        
        <SignupForm 
          redirectTo="/"
          showLoginLink={true}
        />
      </div>
    </div>
  )
} 