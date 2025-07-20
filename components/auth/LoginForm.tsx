"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { GoogleIcon } from './GoogleIcon'
import { supabase } from '@/lib/supabase'

interface LoginFormProps {
  redirectTo?: string
  title?: string
  description?: string
  showSignupLink?: boolean
}

export default function LoginForm({
  redirectTo = '/',
  title = '로그인',
  description = '계정에 로그인하세요',
  showSignupLink = true
}: LoginFormProps) {
  const router = useRouter()
  const { signIn, signInWithGoogle, loading } = useAuth()

  // 폼 상태
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 입력값 변경 처리
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null) // 에러 초기화
  }

  // 이메일/패스워드 로그인
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // 유효성 검사
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      setIsSubmitting(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('올바른 이메일 형식을 입력해주세요.')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        // Supabase 에러 메시지 한국어로 변환
        const errorMessage = getKoreanErrorMessage(error.message)
        setError(errorMessage)
      } else {
        // 로그인 성공 시 리다이렉트
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      console.error('로그인 오류:', err)
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 구글 로그인
  const handleGoogleLogin = async () => {
    setError(null)
    
    try {
      const { error } = await signInWithGoogle()
      
      if (error) {
        const errorMessage = getKoreanErrorMessage(error.message)
        setError(errorMessage)
      }
      // 성공 시 자동으로 리다이렉트됨
    } catch (err) {
      console.error('구글 로그인 오류:', err)
      setError('구글 로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  // 에러 메시지 한국어 변환
  const getKoreanErrorMessage = (errorMessage: string): string => {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
      'Email not confirmed': '이메일 인증이 완료되지 않았습니다. 인증 메일을 확인해주세요.',
      'Too many requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
      'User not found': '존재하지 않는 계정입니다.',
      'Invalid email': '올바르지 않은 이메일 형식입니다.',
      'Signup not allowed for this instance': '회원가입이 허용되지 않습니다.',
      'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.'
    }

    return errorMap[errorMessage] || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
  }

  // 이메일 인증 재전송
  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError('이메일을 입력해주세요.')
      return
    }

    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      })

      if (error) {
        setError('인증 메일 재전송에 실패했습니다.')
      } else {
        setError(null)
        alert('인증 메일이 재전송되었습니다. 이메일을 확인해주세요.')
      }
    } catch (err) {
      console.error('인증 메일 재전송 오류:', err)
      setError('인증 메일 재전송 중 오류가 발생했습니다.')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 구글 로그인 버튼 */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={loading || isSubmitting}
        >
          <GoogleIcon className="w-4 h-4 mr-2" />
          구글로 로그인
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        {/* 이메일/패스워드 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </Button>
        </form>
      </CardContent>

      {showSignupLink && (
        <CardFooter>
          <div className="text-sm text-center w-full">
            계정이 없으신가요?{' '}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              회원가입
            </Link>
          </div>
        </CardFooter>
      )}
    </Card>
  )
} 