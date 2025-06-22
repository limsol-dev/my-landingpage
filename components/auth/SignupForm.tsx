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
import { Eye, EyeOff, Calendar as CalendarIcon, Cake, CheckCircle, User, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface SignupFormProps {
  redirectTo?: string
  showLoginLink?: boolean
}

export default function SignupForm({ redirectTo = '/', showLoginLink = true }: SignupFormProps) {
  const router = useRouter()
  const { signUp, loading, checkUsernameAvailable } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean
    available: boolean | null
    message: string
  }>({
    checking: false,
    available: null,
    message: ''
  })
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    birthDate: null as Date | null
  })

  // 아이디 중복 체크
  const handleUsernameCheck = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameCheck({
        checking: false,
        available: false,
        message: '아이디는 3자 이상 입력해주세요.'
      })
      return
    }

    // 아이디 형식 검사 (영문, 숫자, 언더스코어만 허용)
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      setUsernameCheck({
        checking: false,
        available: false,
        message: '아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.'
      })
      return
    }

    setUsernameCheck(prev => ({ ...prev, checking: true }))
    
    try {
      const isAvailable = await checkUsernameAvailable(username)
      setUsernameCheck({
        checking: false,
        available: isAvailable,
        message: isAvailable ? '✅ 사용 가능한 아이디입니다.' : '❌ 이미 사용 중인 아이디입니다.'
      })
    } catch (error) {
      setUsernameCheck({
        checking: false,
        available: false,
        message: '아이디 확인 중 오류가 발생했습니다.'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    // 유효성 검사
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('모든 필수 필드를 입력해주세요.')
      setIsLoading(false)
      return
    }

    // 아이디 사용 가능 여부 확인
    if (!usernameCheck.available) {
      setError('사용 가능한 아이디를 입력해주세요.')
      setIsLoading(false)
      return
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('유효하지 않은 이메일 주소입니다.')
      setIsLoading(false)
      return
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    // 비밀번호 강도 검사
    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.')
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError } = await signUp(
        formData.email, 
        formData.password,
        {
          username: formData.username,
          full_name: formData.fullName,
          phone: formData.phone,
          birth_date: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : null
        }
      )
      
      if (signUpError) {
        const errorMessage = getErrorMessage(signUpError.message)
        setError(errorMessage)
      } else {
        setSuccess(`✅ 회원가입이 완료되었습니다! 아이디: ${formData.username}`)
        
        // 폼 초기화
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          phone: '',
          birthDate: null
        })
        setUsernameCheck({
          checking: false,
          available: null,
          message: ''
        })
        
        // 1초 후 홈페이지로 이동
        setTimeout(() => {
          router.push(redirectTo)
        }, 1000)
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error)
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (errorMessage: string) => {
    if (errorMessage.includes('already registered') || 
        errorMessage.includes('already exists')) {
      return '이미 가입된 이메일입니다. 로그인을 시도해주세요.'
    }
    if (errorMessage.includes('Invalid email')) {
      return '유효하지 않은 이메일 주소입니다.'
    }
    if (errorMessage.includes('Password should be at least')) {
      return '비밀번호는 최소 8자 이상이어야 합니다.'
    }
    if (errorMessage.includes('Password is too weak')) {
      return '비밀번호가 너무 약합니다. 영문, 숫자, 특수문자를 조합해주세요.'
    }
    if (errorMessage.includes('Too many requests')) {
      return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
    return '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // 아이디 입력 시 실시간 중복 체크
    if (field === 'username') {
      if (value.length >= 3) {
        const timeoutId = setTimeout(() => {
          handleUsernameCheck(value)
        }, 500) // 0.5초 디바운스
        
        return () => clearTimeout(timeoutId)
      } else {
        setUsernameCheck({
          checking: false,
          available: null,
          message: value.length > 0 ? '아이디는 3자 이상 입력해주세요.' : ''
        })
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">회원가입</CardTitle>
        <div className="text-center text-sm text-gray-600">
          <p>아이디와 비밀번호로 간편하게 가입하세요!</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 whitespace-pre-line">
                {success}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">아이디 <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="영문, 숫자, 언더스코어 3자 이상"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                disabled={isLoading || loading}
                className={cn(
                  usernameCheck.available === true && "border-green-500",
                  usernameCheck.available === false && "border-red-500"
                )}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {usernameCheck.checking && (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                )}
                {!usernameCheck.checking && usernameCheck.available === true && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {!usernameCheck.checking && usernameCheck.available === false && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            {usernameCheck.message && (
              <p className={cn(
                "text-xs",
                usernameCheck.available === true && "text-green-600",
                usernameCheck.available === false && "text-red-600",
                usernameCheck.available === null && "text-gray-500"
              )}>
                {usernameCheck.message}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">이메일 <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isLoading || loading}
            />
            <p className="text-xs text-gray-500">비밀번호 찾기 등에 사용됩니다.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">이름 (선택사항)</Label>
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
            <Label htmlFor="phone">전화번호 (선택사항)</Label>
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
            <Label htmlFor="birthDate">생년월일 (선택사항)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
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
                <Calendar
                  mode="single"
                  selected={formData.birthDate || undefined}
                  onSelect={(date) => setFormData(prev => ({ ...prev, birthDate: date || null }))}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  defaultMonth={formData.birthDate || new Date(1990, 0, 1)}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="최소 8자 이상"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                disabled={isLoading || loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 pr-3 flex items-center h-full"
                onClick={togglePasswordVisibility}
                disabled={isLoading || loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인 <span className="text-red-500">*</span></Label>
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 pr-3 flex items-center h-full"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading || loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || loading || (formData.username.length >= 3 && usernameCheck.available === false)}
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