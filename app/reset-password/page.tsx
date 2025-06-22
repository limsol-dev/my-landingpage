"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validating, setValidating] = useState(true)

  useEffect(() => {
    // URL에서 토큰 확인
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      // Supabase 세션 설정
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      setValidating(false)
    } else {
      setError('유효하지 않은 재설정 링크입니다.')
      setValidating(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // 비밀번호 검증
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (error: any) {
      console.error('비밀번호 재설정 오류:', error)
      if (error.message.includes('session_not_found')) {
        setError('세션이 만료되었습니다. 비밀번호 재설정을 다시 요청해주세요.')
      } else if (error.message.includes('New password should be different from the old password')) {
        setError('새 비밀번호는 기존 비밀번호와 달라야 합니다. 다른 비밀번호를 입력해주세요.')
      } else if (error.message.includes('Password should be at least')) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.')
      } else if (error.message.includes('invalid_credentials')) {
        setError('인증 정보가 유효하지 않습니다. 비밀번호 재설정을 다시 요청해주세요.')
      } else {
        setError('비밀번호 재설정에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">링크를 확인하는 중...</p>
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
              {success ? '비밀번호 재설정 완료' : '새 비밀번호 설정'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 mb-4">
                    비밀번호가 성공적으로 재설정되었습니다!
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
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm">
                    새로운 비밀번호를 입력해주세요.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ 새 비밀번호는 기존 비밀번호와 달라야 합니다.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password">새 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="새 비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>비밀번호 요구사항:</p>
                    <ul className="list-disc list-inside space-y-1 text-left">
                      <li className={password.length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                        최소 6자 이상 {password.length >= 6 ? '✓' : ''}
                      </li>
                      <li className="text-gray-400">
                        기존 비밀번호와 다른 비밀번호
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`text-xs ${
                      password === confirmPassword ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {password === confirmPassword ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || password.length < 6 || password !== confirmPassword}
                >
                  {isLoading ? '재설정 중...' : '비밀번호 재설정'}
                </Button>

                <div className="text-center">
                  <Link 
                    href="/login" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    로그인 페이지로 돌아가기
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 