'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkResetToken = async () => {
      try {
        // URL에서 토큰 확인
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('토큰 확인 오류:', error)
          setError('유효하지 않은 재설정 링크입니다.')
          setIsValidToken(false)
        } else if (data.session) {
          setIsValidToken(true)
        } else {
          setError('재설정 링크가 만료되었거나 유효하지 않습니다.')
          setIsValidToken(false)
        }
      } catch (error: any) {
        console.error('토큰 확인 예외:', error)
        setError('재설정 링크 확인 중 오류가 발생했습니다.')
        setIsValidToken(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkResetToken()
  }, [])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다.'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    // 비밀번호 유효성 검사
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setIsSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsSubmitting(false)
      return
    }

    try {
      console.log('🔐 관리자 비밀번호 재설정 시도')
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('비밀번호 재설정 오류:', error)
        setError('비밀번호 재설정에 실패했습니다.')
      } else {
        console.log('✅ 관리자 비밀번호 재설정 성공')
        setSuccess('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.')
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/admin/login')
        }, 3000)
      }
    } catch (error: any) {
      console.error('비밀번호 재설정 예외:', error)
      setError('비밀번호 재설정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">토큰 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            비밀번호 재설정
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            새로운 비밀번호를 설정하세요
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>새 비밀번호 설정</CardTitle>
            <CardDescription>
              안전한 비밀번호로 변경해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {!isValidToken ? (
              <div className="text-center space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    재설정 링크가 유효하지 않습니다. 다시 요청해주세요.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => router.push('/admin/login')}
                  className="w-full"
                >
                  로그인 페이지로 이동
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">새 비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="새 비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    8자 이상, 대문자, 소문자, 숫자 포함
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      변경 중...
                    </>
                  ) : (
                    '비밀번호 변경'
                  )}
                </Button>
              </form>
            )}

            <div className="text-center">
              <button
                onClick={() => router.push('/admin/login')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 