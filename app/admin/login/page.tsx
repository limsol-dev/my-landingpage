"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import { Toaster } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuth()

  // 이미 로그인된 관리자의 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, isAdmin, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="mt-2 text-gray-600">관리자 계정으로 로그인하세요</p>
        </div>
        
        <LoginForm 
          redirectTo="/admin/dashboard" 
          showSignupLink={false}
        />
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">관리자 계정 안내</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• 관리자 권한이 있는 계정만 로그인 가능합니다</p>
            <p>• 계정이 없는 경우 시스템 관리자에게 문의하세요</p>
            <p>• 테스트: admin@example.com / admin123456</p>
          </div>
        </div>
      </div>
    </div>
  )
} 