"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      setStatus('loading')
      setMessage('인증 처리 중...')

      // URL에서 인증 세션 처리
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('로그인 처리 중 오류가 발생했습니다.')
        return
      }

      if (data.session) {
        console.log('✅ OAuth 로그인 성공:', data.session.user.email)
        setStatus('success')
        setMessage('로그인이 완료되었습니다. 잠시만 기다려주세요...')

        // 리다이렉트 URL 처리 (null 체크 추가)
        const redirectTo = searchParams?.get('redirect') || '/'
        
        // 잠시 대기 후 리다이렉트
        setTimeout(() => {
          router.push(redirectTo)
          router.refresh()
        }, 1500)
      } else {
        setStatus('error')
        setMessage('인증 세션을 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      setStatus('error')
      setMessage('예상치 못한 오류가 발생했습니다.')
    }
  }

  const handleRetry = () => {
    handleAuthCallback()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleGoLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {status === 'loading' && '로그인 처리 중'}
            {status === 'success' && '로그인 완료'}
            {status === 'error' && '로그인 실패'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && '잠시만 기다려주세요...'}
            {status === 'success' && '메인 페이지로 이동합니다'}
            {status === 'error' && '문제가 발생했습니다'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 상태별 아이콘과 메시지 */}
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-center text-muted-foreground">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-center text-green-600 font-medium">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-500" />
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                
                {/* 에러 시 액션 버튼들 */}
                <div className="flex flex-col space-y-2 w-full">
                  <Button onClick={handleRetry} variant="outline" className="w-full">
                    다시 시도
                  </Button>
                  <Button onClick={handleGoLogin} variant="outline" className="w-full">
                    로그인 페이지로
                  </Button>
                  <Button onClick={handleGoHome} variant="ghost" className="w-full">
                    홈으로 돌아가기
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 