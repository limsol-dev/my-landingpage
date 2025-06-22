"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Eye, EyeOff, Calendar as CalendarIcon, Cake } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface SignupFormProps {
  redirectTo?: string
  showLoginLink?: boolean
}

export default function SignupForm({ redirectTo = '/login', showLoginLink = true }: SignupFormProps) {
  const router = useRouter()
  const { signUp, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    birthDate: null as Date | null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    // 유효성 검사
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('필수 항목을 모두 입력해주세요.')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(
        formData.email, 
        formData.password,
        {
          full_name: formData.fullName,
          phone: formData.phone,
          birth_date: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : null
        }
      )
      
      if (error) {
        const errorMessage = getErrorMessage(error.message)
        setError(errorMessage)
      } else {
        setSuccess('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 인증해주세요.')
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push(redirectTo)
        }, 3000)
      }
    } catch (error: any) {
      setError('회원가입 중 오류가 발생했습니다.')
      console.error('회원가입 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (errorMessage: string) => {
    if (errorMessage.includes('User already registered')) {
      return '이미 등록된 이메일입니다.'
    }
    if (errorMessage.includes('Password should be at least')) {
      return '비밀번호는 최소 6자 이상이어야 합니다.'
    }
    if (errorMessage.includes('Invalid email')) {
      return '올바른 이메일 형식을 입력해주세요.'
    }
    if (errorMessage.includes('signup_disabled')) {
      return '현재 회원가입이 비활성화되어 있습니다.'
    }
    return '회원가입 중 오류가 발생했습니다.'
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">회원가입</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isLoading || loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">이름</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="홍길동"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              disabled={isLoading || loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={isLoading || loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthDate">생년월일</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.birthDate && "text-muted-foreground"
                  )}
                  disabled={isLoading || loading}
                >
                  <Cake className="mr-2 h-4 w-4" />
                  {formData.birthDate ? (
                    format(formData.birthDate, "yyyy년 MM월 dd일", { locale: ko })
                  ) : (
                    <span>생년월일을 선택하세요</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                  <div className="flex gap-2">
                    <select
                      className="px-2 py-1 border rounded text-sm"
                      value={formData.birthDate?.getFullYear() || new Date().getFullYear()}
                      onChange={(e) => {
                        const year = parseInt(e.target.value)
                        const currentDate = formData.birthDate || new Date()
                        const newDate = new Date(year, currentDate.getMonth(), currentDate.getDate())
                        setFormData(prev => ({ ...prev, birthDate: newDate }))
                      }}
                    >
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}년</option>
                      ))}
                    </select>
                    <select
                      className="px-2 py-1 border rounded text-sm"
                      value={formData.birthDate?.getMonth() || new Date().getMonth()}
                      onChange={(e) => {
                        const month = parseInt(e.target.value)
                        const currentDate = formData.birthDate || new Date()
                        const newDate = new Date(currentDate.getFullYear(), month, currentDate.getDate())
                        setFormData(prev => ({ ...prev, birthDate: newDate }))
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i).map(month => (
                        <option key={month} value={month}>{month + 1}월</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={formData.birthDate || undefined}
                  onSelect={(date) => setFormData(prev => ({ ...prev, birthDate: date || null }))}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  month={formData.birthDate || new Date(1990, 0, 1)}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="최소 6자 이상"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                disabled={isLoading || loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || loading}
              >
                {showConfirmPassword ? (
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
            {isLoading || loading ? '가입 중...' : '회원가입'}
          </Button>
        </form>
        
        {showLoginLink && (
          <>
            <Separator className="my-4" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:underline font-medium"
                >
                  로그인
                </Link>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 