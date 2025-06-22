"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { User, Mail, Phone, Calendar, Shield, LogOut, Calendar as CalendarIcon, Cake } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading, updateProfile, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    birthDate: null as Date | null
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        birthDate: profile.birth_date ? new Date(profile.birth_date) : null
      })
    }
  }, [user, profile, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    console.log('폼 제출 시작:', formData)

    try {
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone,
        birth_date: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      }

      console.log('업데이트할 데이터:', updateData)

      const { data, error } = await updateProfile(updateData)

      console.log('업데이트 결과:', { data, error })

      if (error) {
        console.error('업데이트 오류:', error)
        setError(`프로필 업데이트에 실패했습니다: ${error.message || '알 수 없는 오류'}`)
      } else if (data) {
        setMessage('프로필이 성공적으로 업데이트되었습니다!')
        setIsEditing(false)
        console.log('업데이트 성공!')
      } else {
        setError('업데이트 응답에 문제가 있습니다.')
      }
    } catch (error: any) {
      console.error('폼 제출 예외:', error)
      setError(`오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push('/')
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
              <p className="text-gray-600 mt-2">계정 정보를 관리하세요</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/my-reservations">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  내 예약
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 정보 카드 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {profile?.full_name || '이름 없음'}
                  </h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">이메일</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">전화번호</p>
                      <p className="text-sm text-gray-600">
                        {profile?.phone || '등록되지 않음'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">계정 유형</p>
                      <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                        {profile?.role === 'admin' ? '관리자' : '일반 사용자'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Cake className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">생년월일</p>
                      <p className="text-sm text-gray-600">
                        {profile?.birth_date 
                          ? new Date(profile.birth_date).toLocaleDateString('ko-KR')
                          : '등록되지 않음'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">가입일</p>
                      <p className="text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 프로필 편집 카드 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>프로필 편집</CardTitle>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                      편집하기
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {message && (
                  <Alert className="mb-4">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">이름</Label>
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="홍길동"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        disabled={!isEditing || isLoading}
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
                        disabled={!isEditing || isLoading}
                      />
                    </div>
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
                          disabled={!isEditing || isLoading}
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
                        <CalendarComponent
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
                    <Label htmlFor="email">이메일 (변경 불가)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                      >
                        {isLoading ? '저장 중...' : '저장하기'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setError(null)
                          setMessage(null)
                          // 원래 데이터로 복원
                          if (profile) {
                            setFormData({
                              full_name: profile.full_name || '',
                              phone: profile.phone || '',
                              birthDate: profile.birth_date ? new Date(profile.birth_date) : null
                            })
                          }
                        }}
                        disabled={isLoading}
                      >
                        취소
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 