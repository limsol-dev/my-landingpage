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
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { GoogleIcon } from './GoogleIcon'

interface SignupFormProps {
  redirectTo?: string
  title?: string
  description?: string
  showLoginLink?: boolean
}

export default function SignupForm({
  redirectTo = '/',
  title = '회원가입',
  description = '새 계정을 만드세요',
  showLoginLink = true
}: SignupFormProps) {
  const router = useRouter()
  const { signUp, signInWithGoogle, loading } = useAuth()

  // 폼 상태
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: '',
    phone: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  // 입력값 변경 처리
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 실시간 유효성 검사
    validateField(field, value)
    
    if (error) setError(null) // 에러 초기화
  }

  // 필드별 유효성 검사
  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors }

    switch (field) {
      case 'email':
        if (!value) {
          errors.email = '이메일을 입력해주세요.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = '올바른 이메일 형식을 입력해주세요.'
        } else {
          delete errors.email
        }
        break

      case 'password':
        if (!value) {
          errors.password = '비밀번호를 입력해주세요.'
        } else if (value.length < 6) {
          errors.password = '비밀번호는 최소 6자 이상이어야 합니다.'
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          errors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.'
        } else {
          delete errors.password
        }
        
        // 확인 비밀번호와 매치 확인
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete errors.confirmPassword
        }
        break

      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = '비밀번호 확인을 입력해주세요.'
        } else if (value !== formData.password) {
          errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
        } else {
          delete errors.confirmPassword
        }
        break

      case 'username':
        if (!value) {
          errors.username = '사용자명을 입력해주세요.'
        } else if (value.length < 2) {
          errors.username = '사용자명은 최소 2자 이상이어야 합니다.'
        } else if (!/^[a-zA-Z0-9가-힣_]+$/.test(value)) {
          errors.username = '사용자명은 영문, 한글, 숫자, _만 사용 가능합니다.'
        } else {
          delete errors.username
        }
        break

      case 'full_name':
        if (!value) {
          errors.full_name = '이름을 입력해주세요.'
        } else if (value.length < 2) {
          errors.full_name = '이름은 최소 2자 이상이어야 합니다.'
        } else {
          delete errors.full_name
        }
        break

      case 'phone':
        if (value && !/^010-?\d{4}-?\d{4}$/.test(value.replace(/[^0-9]/g, ''))) {
          errors.phone = '올바른 휴대폰 번호를 입력해주세요. (010-0000-0000)'
        } else {
          delete errors.phone
        }
        break
    }

    setValidationErrors(errors)
  }

  // 전체 폼 유효성 검사
  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!formData.email) errors.email = '이메일을 입력해주세요.'
    if (!formData.password) errors.password = '비밀번호를 입력해주세요.'
    if (!formData.confirmPassword) errors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    if (!formData.username) errors.username = '사용자명을 입력해주세요.'
    if (!formData.full_name) errors.full_name = '이름을 입력해주세요.'

    // 기존 유효성 검사 에러도 포함
    const allErrors = { ...validationErrors, ...errors }
    setValidationErrors(allErrors)

    return Object.keys(allErrors).length === 0
  }

  // 이메일/패스워드 회원가입
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // 유효성 검사
    if (!validateForm()) {
      setError('입력하신 정보를 다시 확인해주세요.')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.full_name,
        phone: formData.phone || undefined
      })
      
      if (error) {
        const errorMessage = getKoreanErrorMessage(error.message)
        setError(errorMessage)
      } else {
        // 회원가입 성공 시 리다이렉트
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      console.error('회원가입 오류:', err)
      setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 구글 회원가입
  const handleGoogleSignup = async () => {
    setError(null)
    
    try {
      const { error } = await signInWithGoogle()
      
      if (error) {
        const errorMessage = getKoreanErrorMessage(error.message)
        setError(errorMessage)
      }
      // 성공 시 자동으로 리다이렉트됨
    } catch (err) {
      console.error('구글 회원가입 오류:', err)
      setError('구글 회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  // 에러 메시지 한국어 변환
  const getKoreanErrorMessage = (errorMessage: string): string => {
    const errorMap: { [key: string]: string } = {
      'User already registered': '이미 가입된 이메일입니다.',
      'Invalid email': '올바르지 않은 이메일 형식입니다.',
      'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
      'Signup not allowed for this instance': '회원가입이 허용되지 않습니다.',
      'Email rate limit exceeded': '이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      'Too many requests': '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.'
    }

    return errorMap[errorMessage] || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'
  }

  // 필드별 에러 표시 헬퍼
  const getFieldError = (field: string) => {
    return validationErrors[field]
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

        {/* 구글 회원가입 버튼 */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={loading || isSubmitting}
        >
          <GoogleIcon className="w-4 h-4 mr-2" />
          구글로 가입하기
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        {/* 이메일/패스워드 회원가입 폼 */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일 *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${getFieldError('email') ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
                required
              />
              {!getFieldError('email') && formData.email && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {getFieldError('email') && (
              <p className="text-sm text-red-500">{getFieldError('email')}</p>
            )}
          </div>

          {/* 사용자명 */}
          <div className="space-y-2">
            <Label htmlFor="username">사용자명 *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="username"
                type="text"
                placeholder="사용자명 (영문, 한글, 숫자 가능)"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`pl-10 ${getFieldError('username') ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
                required
              />
              {!getFieldError('username') && formData.username && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {getFieldError('username') && (
              <p className="text-sm text-red-500">{getFieldError('username')}</p>
            )}
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="full_name">이름 *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="full_name"
                type="text"
                placeholder="실명을 입력하세요"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={`pl-10 ${getFieldError('full_name') ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
                required
              />
              {!getFieldError('full_name') && formData.full_name && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {getFieldError('full_name') && (
              <p className="text-sm text-red-500">{getFieldError('full_name')}</p>
            )}
          </div>

          {/* 휴대폰 번호 (선택) */}
          <div className="space-y-2">
            <Label htmlFor="phone">휴대폰 번호 (선택)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`pl-10 ${getFieldError('phone') ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {getFieldError('phone') && (
              <p className="text-sm text-red-500">{getFieldError('phone')}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호 (영문+숫자, 6자 이상)"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 ${getFieldError('password') ? 'border-red-500' : ''}`}
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
            {getFieldError('password') && (
              <p className="text-sm text-red-500">{getFieldError('password')}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`pl-10 pr-10 ${getFieldError('confirmPassword') ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {getFieldError('confirmPassword') && (
              <p className="text-sm text-red-500">{getFieldError('confirmPassword')}</p>
            )}
            {!getFieldError('confirmPassword') && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                비밀번호가 일치합니다
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loading || Object.keys(validationErrors).length > 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                가입 중...
              </>
            ) : (
              '회원가입'
            )}
          </Button>
        </form>
      </CardContent>

      {showLoginLink && (
        <CardFooter>
          <div className="text-sm text-center w-full">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              로그인
            </Link>
          </div>
        </CardFooter>
      )}
    </Card>
  )
} 