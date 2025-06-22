"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import SignupForm from '@/components/auth/SignupForm'
import { Toaster } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // 이미 로그인된 사용자의 경우 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
          <p className="mt-2 text-gray-600">새 계정을 만드세요</p>
        </div>
        
        <SignupForm 
          redirectTo="/login" 
          showLoginLink={true}
        />
      </div>
    </div>
  )
} 