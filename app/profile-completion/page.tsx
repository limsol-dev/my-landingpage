"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Star,
  Home,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { 
  checkProfileCompletion, 
  getRequiredFieldsInfo,
  isTemporaryName 
} from '@/lib/profile-completion'
import { toast } from 'sonner'
import { Toaster } from 'sonner'
import Link from 'next/link'

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

export default function ProfileCompletionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading, updateProfile, signOut } = useAuth()
  
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    birth_date: null
  })
  
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [completionProgress, setCompletionProgress] = useState(0)

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
  }, [user, loading, router])

  // 프로필이 이미 완성된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (profile) {
      const completion = checkProfileCompletion(profile)
      if (completion.isComplete && !completion.requiresInput) {
        const redirectTo = searchParams?.get('redirect') || '/'
        router.push(redirectTo)
        return
      }
    }
  }, [profile, router, searchParams])

  // 필수 필드 정보 가져오기
  const fieldsInfo = getRequiredFieldsInfo(profile)

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

  const handleInputChange = (field: keyof FormData, value: string | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)

    try {
      const updateData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.replace(/[^\d]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
        birth_date: formData.birth_date ? formData.birth_date.toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await updateProfile(updateData)

      if (error) {
        toast.error(`프로필 업데이트에 실패했습니다: ${error.message}`)
        return
      }

      toast.success('프로필 정보가 성공적으로 저장되었습니다!')

      const redirectTo = searchParams?.get('redirect') || '/'
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)

    } catch (error: any) {
      toast.error(`오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">프로필 완성</h1>
            <p className="text-gray-600 mt-2">서비스 이용을 위해 추가 정보를 입력해주세요</p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">추가 정보 입력</CardTitle>
                  <p className="text-sm text-gray-600">
                    {user?.email} 계정의 프로필을 완성하세요
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">완성도</span>
                  <span className="font-medium">{completionProgress}%</span>
                </div>
                <Progress value={completionProgress} className="h-3" />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  입력하신 정보는 안전하게 암호화되어 저장되며, 
                  개인정보 보호정책에 따라 보호됩니다.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2 text-base">
                    <Star className="w-4 h-4 text-red-500" />
                    실명 (닉네임)
                  </Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="본명 또는 사용하실 닉네임을 입력하세요"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="h-12 text-base"
                    maxLength={20}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-base">
                    <Star className="w-4 h-4 text-red-500" />
                    휴대폰 번호
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-12 text-base"
                    maxLength={13}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    생년월일 (선택사항)
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal text-base",
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

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        프로필 완성하기
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 