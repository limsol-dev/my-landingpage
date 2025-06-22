"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

interface LoginFormProps {
  redirectTo?: string
  showSignupLink?: boolean
}

export default function LoginForm({ redirectTo = '/', showSignupLink = true }: LoginFormProps) {
  const router = useRouter()
  const { signIn, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!credentials.email || !credentials.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signIn(credentials.email, credentials.password)
      
      if (error) {
        // 에러 메시지를 한국어로 변환
        const errorMessage = getErrorMessage(error.message)
        setError(errorMessage)
      } else {
        // 로그인 성공
        router.push(redirectTo)
      }
    } catch (error: any) {
      setError('로그인 중 오류가 발생했습니다.')
      console.error('로그인 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (errorMessage: string) => {
    if (errorMessage.includes('Invalid login credentials') || 
        errorMessage.includes('invalid_credentials')) {
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    }
    if (errorMessage.includes('Email not confirmed')) {
      return '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
    }
    if (errorMessage.includes('Too many requests')) {
      return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
    return '로그인 중 오류가 발생했습니다.'
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
              disabled={isLoading || loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                required
                disabled={isLoading || loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || loading}
          >
            {isLoading || loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <Link 
            href="/forgot-password" 
            className="text-sm text-blue-600 hover:underline"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>
        
        {showSignupLink && (
          <>
            <Separator className="my-4" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link 
                  href="/signup" 
                  className="text-blue-600 hover:underline font-medium"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 