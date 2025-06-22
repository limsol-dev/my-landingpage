"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    if (!email) {
      setError('이메일을 입력해주세요.')
      setIsLoading(false)
      return
    }

    try {
      console.log('비밀번호 재설정 시작:', email)
      const { error } = await resetPassword(email)
      
      if (error) {
        console.error('resetPassword 오류:', error)
        let errorMessage = '비밀번호 재설정 이메일 전송에 실패했습니다.'
        
        if (error.message?.includes('User not found')) {
          errorMessage = '등록되지 않은 이메일입니다.'
        } else if (error.message?.includes('Email rate limit exceeded')) {
          errorMessage = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = '올바른 이메일 형식을 입력해주세요.'
        }
        
        setError(errorMessage)
      } else {
        console.log('비밀번호 재설정 이메일 전송 성공')
        setEmailSent(true)
        setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.')
      }
    } catch (error: any) {
      console.error('예외 발생:', error)
      setError('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link 
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            로그인으로 돌아가기
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {emailSent ? '이메일 전송됨' : '비밀번호 재설정'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 mb-4">
                    <strong>{email}</strong>로 비밀번호 재설정 링크를 전송했습니다.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    이메일을 확인하고 링크를 클릭하여 새 비밀번호를 설정하세요.
                    이메일이 보이지 않으면 스팸 폴더를 확인해주세요.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      setEmailSent(false)
                      setEmail('')
                      setMessage(null)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    다른 이메일로 재전송
                  </Button>
                  <Link href="/login">
                    <Button className="w-full">
                      로그인 페이지로 이동
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm">
                    가입할 때 사용한 이메일 주소를 입력하시면, 
                    비밀번호 재설정 링크를 보내드립니다.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 주소</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? '전송 중...' : '재설정 링크 전송'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 