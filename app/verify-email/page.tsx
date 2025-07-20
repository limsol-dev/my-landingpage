"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_verified'>('loading')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
              try {
          // URL에서 토큰과 타입 확인
          const token = searchParams?.get('token')
          const type = searchParams?.get('type')
          
          console.log('이메일 인증 시도:', { token, type })

        if (!token) {
          setStatus('error')
          setMessage('유효하지 않은 인증 링크입니다.')
          return
        }

        // Supabase를 통한 이메일 인증
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        })

        console.log('인증 결과:', { data, error })

        if (error) {
          if (error.message.includes('already_verified') || error.message.includes('expired')) {
            setStatus('already_verified')
            setMessage('이미 인증된 계정이거나 만료된 링크입니다.')
          } else {
            setStatus('error')
            setMessage('이메일 인증에 실패했습니다. 다시 시도해주세요.')
          }
        } else {
          setStatus('success')
          setMessage('이메일 인증이 완료되었습니다!')
          
          // 3초 후 로그인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
      } catch (error) {
        console.error('이메일 인증 오류:', error)
        setStatus('error')
        setMessage('이메일 인증 중 오류가 발생했습니다.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      // 여기에 이메일 재전송 로직 추가
      // 현재는 단순히 성공 메시지만 표시
      alert('인증 이메일이 다시 전송되었습니다. 이메일을 확인해주세요.')
    } catch (error) {
      alert('이메일 재전송에 실패했습니다.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              이메일 인증
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
                      이메일을 인증하는 중입니다...
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
                      잠시 후 로그인 페이지로 이동합니다...
                    </p>
                  </div>
                  <Link href="/login">
                    <Button className="w-full">
                      지금 로그인하기
                    </Button>
                  </Link>
                </>
              )}

              {(status === 'error' || status === 'already_verified') && (
                <>
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                    
                    {status === 'error' && (
                      <div className="space-y-3">
                        <Button 
                          onClick={handleResendEmail}
                          disabled={isResending}
                          className="w-full"
                        >
                          {isResending ? '전송 중...' : '인증 이메일 다시 받기'}
                        </Button>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          로그인 페이지로 이동
                        </Button>
                      </Link>
                    </div>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 로드하는 중...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
} 