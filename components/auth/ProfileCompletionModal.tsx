"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  User, 
  Phone, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  Star
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { 
  checkProfileCompletion, 
  getRequiredFieldsInfo,
  isTemporaryName 
} from '@/lib/profile-completion'
import { toast } from 'sonner'

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

interface FormData {
  full_name: string
  phone: string
  birth_date: Date | null
}

interface ValidationErrors {
  full_name?: string
  phone?: string
  birth_date?: string
}

export default function ProfileCompletionModal({ 
  isOpen, 
  onClose, 
  onComplete 
}: ProfileCompletionModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, updateProfile } = useAuth()
  
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    birth_date: null
  })
  
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [completionProgress, setCompletionProgress] = useState(0)

  // 필수 필드 정보 가져오기
  const fieldsInfo = getRequiredFieldsInfo(profile)
  const totalSteps = fieldsInfo.required.length

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name && !isTemporaryName(profile.full_name) ? profile.full_name : '',
        phone: profile.phone || '',
        birth_date: profile.birth_date ? new Date(profile.birth_date) : null
      })
    }
  }, [profile])

  // 진행률 계산
  useEffect(() => {
    let completed = 0
    if (formData.full_name.trim() !== '' && !errors.full_name) completed++
    if (formData.phone.trim() !== '' && !errors.phone) completed++
    
    const progress = Math.round((completed / fieldsInfo.required.length) * 100)
    setCompletionProgress(progress)
  }, [formData, errors, fieldsInfo.required.length])

  // 실시간 유효성 검사
  useEffect(() => {
    const validateForm = async () => {
      const newErrors: ValidationErrors = {}

      // 실명 검증
      if (formData.full_name.trim() === '') {
        newErrors.full_name = '실명(닉네임)을 입력해주세요.'
      } else if (formData.full_name.length < 2) {
        newErrors.full_name = '실명은 2자 이상 입력해주세요.'
      } else if (formData.full_name.length > 20) {
        newErrors.full_name = '실명은 20자 이하로 입력해주세요.'
      } else if (isTemporaryName(formData.full_name)) {
        newErrors.full_name = '사용할 수 없는 이름입니다. 다른 이름을 입력해주세요.'
      }

      // 휴대폰 번호 검증 
      if (formData.phone.trim() === '') {
        newErrors.phone = '휴대폰 번호를 입력해주세요.'
      } else {
        const phoneRegex = /^(01[016789]|02|0[3-9]\d)-?\d{3,4}-?\d{4}$/
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
          newErrors.phone = '올바른 휴대폰 번호 형식으로 입력해주세요. (예: 010-1234-5678)'
        }
      }

      setErrors(newErrors)
    }

    // 디바운스를 위한 타이머
    const timer = setTimeout(validateForm, 300)
    return () => clearTimeout(timer)
  }, [formData])

  // 닉네임 중복 체크
  const checkUsernameAvailability = async (name: string) => {
    if (!name || name.trim() === '' || errors.full_name) return

    setIsCheckingUsername(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('full_name', name.trim())
        .neq('id', user?.id || '') // 본인 제외
        .limit(1)

      if (error) {
        console.error('Username check error:', error)
        return
      }

      if (data && data.length > 0) {
        setErrors(prev => ({
          ...prev,
          full_name: '이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.'
        }))
      }
    } catch (error) {
      console.error('Username availability check failed:', error)
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // 닉네임 체크 디바운스
  useEffect(() => {
    if (formData.full_name.trim() !== '' && !errors.full_name) {
      const timer = setTimeout(() => {
        checkUsernameAvailability(formData.full_name)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.full_name])

  const handleInputChange = (field: keyof FormData, value: string | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhoneChange = (value: string) => {
    // 숫자만 추출하고 포맷팅
    const numericValue = value.replace(/[^\d]/g, '')
    
    let formattedPhone = numericValue
    if (numericValue.length >= 3) {
      if (numericValue.startsWith('02')) {
        // 서울 지역번호
        if (numericValue.length <= 6) {
          formattedPhone = `${numericValue.slice(0, 2)}-${numericValue.slice(2)}`
        } else {
          formattedPhone = `${numericValue.slice(0, 2)}-${numericValue.slice(2, 6)}-${numericValue.slice(6, 10)}`
        }
      } else {
        // 휴대폰 또는 기타 지역번호
        if (numericValue.length <= 7) {
          formattedPhone = `${numericValue.slice(0, 3)}-${numericValue.slice(3)}`
        } else {
          formattedPhone = `${numericValue.slice(0, 3)}-${numericValue.slice(3, 7)}-${numericValue.slice(7, 11)}`
        }
      }
    }

    handleInputChange('phone', formattedPhone)
  }

  const isFormValid = () => {
    return Object.keys(errors).length === 0 && 
           formData.full_name.trim() !== '' && 
           formData.phone.trim() !== '' &&
           !isCheckingUsername
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      toast.error('입력 정보를 확인해주세요.')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔄 프로필 완성 제출 시작:', formData)

      const updateData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.replace(/[^\d]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
        birth_date: formData.birth_date ? formData.birth_date.toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await updateProfile(updateData)

      if (error) {
        console.error('❌ 프로필 업데이트 실패:', error)
        toast.error(`프로필 업데이트에 실패했습니다: ${error.message}`)
        return
      }

      console.log('✅ 프로필 완성 성공:', data)
      toast.success('프로필 정보가 성공적으로 저장되었습니다!')

      // 완성 콜백 호출
      onComplete()
      
      // 리다이렉트 처리
      const redirectTo = searchParams?.get('redirect') || '/'
      router.push(redirectTo)

    } catch (error: any) {
      console.error('❌ 프로필 완성 오류:', error)
      toast.error(`오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipOptional = () => {
    if (isFormValid()) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto [&>button]:hidden"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5 text-blue-600" />
            추가 정보 입력
          </DialogTitle>
          <DialogDescription>
            서비스 이용을 위해 필수 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 진행률 표시 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">완성도</span>
              <span className="font-medium">{completionProgress}%</span>
            </div>
            <Progress value={completionProgress} className="h-2" />
          </div>

          {/* 보안 안내 */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              입력하신 정보는 안전하게 암호화되어 저장되며, 
              개인정보 보호정책에 따라 보호됩니다.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 실명(닉네임) 입력 */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <Star className="w-4 h-4 text-red-500" />
                실명 (닉네임)
                {isCheckingUsername && <Loader2 className="w-4 h-4 animate-spin" />}
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="본명 또는 사용하실 닉네임을 입력하세요"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={cn(
                  "transition-colors",
                  errors.full_name ? "border-red-500 focus:border-red-500" : 
                  formData.full_name && !errors.full_name ? "border-green-500" : ""
                )}
                maxLength={20}
                required
                disabled={isLoading}
              />
              {errors.full_name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.full_name}
                </p>
              )}
              {formData.full_name && !errors.full_name && !isCheckingUsername && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  사용 가능한 닉네임입니다.
                </p>
              )}
            </div>

            {/* 휴대폰 번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Star className="w-4 h-4 text-red-500" />
                휴대폰 번호
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={cn(
                  "transition-colors",
                  errors.phone ? "border-red-500 focus:border-red-500" : 
                  formData.phone && !errors.phone ? "border-green-500" : ""
                )}
                maxLength={13}
                required
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
              {formData.phone && !errors.phone && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  올바른 형식입니다.
                </p>
              )}
            </div>

            {/* 생년월일 입력 (선택사항) */}
            <div className="space-y-2">
              <Label htmlFor="birth_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                생년월일 (선택사항)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.birth_date && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.birth_date ? (
                      format(formData.birth_date, "yyyy년 MM월 dd일", { locale: ko })
                    ) : (
                      "생년월일을 선택하세요"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.birth_date || undefined}
                    onSelect={(date) => handleInputChange('birth_date', date || null)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    정보 저장하기
                  </>
                )}
              </Button>
            </div>

            {/* 나중에 입력 버튼 (선택사항) */}
            {fieldsInfo.missingRequiredCount === 0 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-600"
                onClick={handleSkipOptional}
                disabled={isLoading}
              >
                나중에 입력하기
              </Button>
            )}
          </form>

          {/* 도움말 */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• 입력하신 정보는 예약 및 서비스 제공을 위해 사용됩니다.</p>
            <p>• 필수 정보를 입력하지 않으면 일부 서비스 이용이 제한될 수 있습니다.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 