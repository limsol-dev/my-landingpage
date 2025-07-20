'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { checkProfileCompletion } from '@/lib/profile-completion'
import Link from 'next/link'

function AdminAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 정보 가져오기
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('관리자 인증 콜백 오류:', error)
          setStatus('error')
          setMessage('관리자 소셜 로그인 인증에 실패했습니다.')
          return
        }

        if (data.session && data.session.user) {
          console.log('관리자 소셜 로그인 성공:', data.session.user.email)
          
          // Edge Function을 호출하여 사용자 프로필 처리
          try {
            const response = await fetch('/api/auth/handle-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: data.session.user.id,
                email: data.session.user.email,
                user_metadata: data.session.user.user_metadata,
                app_metadata: data.session.user.app_metadata
              })
            })

            const result = await response.json()
            
            if (!response.ok || !result.success) {
              throw new Error(result.error || 'Edge Function 호출 실패')
            }

            console.log('✅ 관리자 프로필 처리 완료:', result.action)
            
            setStatus('success')
            setMessage('관리자 소셜 로그인이 완료되었습니다!')

            // 관리자 페이지로 리다이렉트
            const redirectTo = searchParams?.get('redirect') || '/admin'
            
            // 2초 후 리다이렉트
            setTimeout(() => {
              router.push(redirectTo)
            }, 2000)

          } catch (profileError) {
            console.error('관리자 프로필 처리 오류:', profileError)
            setStatus('error')
            setMessage('관리자 프로필 처리에 실패했습니다.')
            return
          }

        } else {
          setStatus('error')
          setMessage('인증 정보를 찾을 수 없습니다.')
        }
      } catch (error) {
        console.error('관리자 인증 콜백 처리 오류:', error)
        setStatus('error')
        setMessage('관리자 인증 처리 중 오류가 발생했습니다.')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              관리자 소셜 로그인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              {status === 'loading' && (
                <>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <p className="text-gray-600 mb-4">
                      관리자 로그인을 처리하는 중입니다...
                    </p>
                    <p className="text-sm text-gray-500">
                      잠시만 기다려주세요.
                    </p>
                  </div>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 mb-4">
                      {message}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      잠시 후 관리자 페이지로 이동합니다...
                    </p>
                  </div>
                  <Link href="/admin">
                    <Button className="w-full">
                      지금 관리자 페이지로 이동
                    </Button>
                  </Link>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                    <p className="text-sm text-gray-500 mb-6">
                      다시 시도하거나 일반 관리자 로그인을 이용해주세요.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link href="/admin">
                      <Button className="w-full">
                        관리자 로그인 페이지로 이동
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminAuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>인증 처리 중...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AdminAuthCallbackContent />
    </Suspense>
  )
} 