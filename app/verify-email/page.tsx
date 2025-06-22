"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { CheckCircle, XCircle, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // URL에서 토큰 확인
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (type === 'signup' && accessToken && refreshToken) {
          // 이메일 인증 완료 - 세션 설정
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            throw error
          }

          setVerified(true)
        } else {
          setError('유효하지 않은 인증 링크입니다.')
        }
      } catch (error: any) {
        console.error('이메일 인증 오류:', error)
        setError('이메일 인증에 실패했습니다.')
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [])

  const handleContinue = () => {
    router.push('/')
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">이메일을 인증하는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {verified ? '이메일 인증 완료' : '이메일 인증 실패'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                verified ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {verified ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              
              {verified ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    축하합니다! 이메일 인증이 완료되었습니다.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    이제 모든 서비스를 이용하실 수 있습니다.
                  </p>
                  <Button onClick={handleContinue} className="w-full">
                    시작하기
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    이메일 인증에 실패했습니다.
                  </p>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <p className="text-sm text-gray-500 mb-6">
                    인증 링크가 만료되었거나 유효하지 않을 수 있습니다.
                    다시 시도해주세요.
                  </p>
                  <div className="space-y-2">
                    <Link href="/signup">
                      <Button variant="outline" className="w-full">
                        회원가입 다시 하기
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button className="w-full">
                        로그인 페이지로 이동
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 