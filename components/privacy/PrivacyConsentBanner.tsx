"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Shield, Cookie, Eye, Mail, Settings, Check, X } from 'lucide-react'
import { 
  getPrivacySettings, 
  savePrivacySettings, 
  getDefaultPrivacySettings,
  type PrivacySettings 
} from '@/lib/security'

export default function PrivacyConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [settings, setSettings] = useState<PrivacySettings>(getDefaultPrivacySettings())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    const currentSettings = getPrivacySettings()
    setSettings(currentSettings)
    
    // 쿠키 동의를 받지 않은 경우에만 배너 표시
    if (!currentSettings.cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const acceptAll = () => {
    const newSettings: PrivacySettings = {
      analytics: true,
      marketing: true,
      essential: true,
      cookieConsent: true,
      dataRetentionDays: 365
    }
    
    setSettings(newSettings)
    savePrivacySettings(newSettings)
    setIsVisible(false)
  }

  const acceptEssentialOnly = () => {
    const newSettings: PrivacySettings = {
      analytics: false,
      marketing: false,
      essential: true,
      cookieConsent: true,
      dataRetentionDays: 365
    }
    
    setSettings(newSettings)
    savePrivacySettings(newSettings)
    setIsVisible(false)
  }

  const customizeSettings = () => {
    setIsSettingsOpen(true)
  }

  const saveCustomSettings = () => {
    const newSettings = {
      ...settings,
      cookieConsent: true
    }
    
    setSettings(newSettings)
    savePrivacySettings(newSettings)
    setIsSettingsOpen(false)
    setIsVisible(false)
  }

  const updateSetting = (key: keyof PrivacySettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!isVisible) {
    return null
  }

  return (
    <>
      {/* 개인정보 동의 배너 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-start gap-4 md:items-center">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  🍪 개인정보 및 쿠키 사용 동의
                </h3>
                <Badge variant="outline" className="text-xs">
                  GDPR 준수
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600">
                달팽이 아지트는 서비스 제공, 분석, 마케팅을 위해 쿠키와 개인정보를 사용합니다. 
                자세한 내용은 <a href="/privacy-policy" className="text-blue-600 underline">개인정보 처리방침</a>을 확인하세요.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={acceptEssentialOnly}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                필수만
              </Button>
              
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={customizeSettings}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    설정
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      개인정보 설정
                    </DialogTitle>
                    <DialogDescription>
                      원하는 항목만 선택하여 개인화된 서비스를 받으세요.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* 필수 쿠키 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <Label className="font-medium">필수 쿠키</Label>
                          <Badge variant="secondary" className="text-xs">필수</Badge>
                        </div>
                        <Switch checked={true} disabled />
                      </div>
                      <p className="text-xs text-gray-600 ml-6">
                        로그인, 보안, 기본 서비스 제공에 필요한 쿠키입니다.
                      </p>
                    </div>

                    {/* 분석 쿠키 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <Label className="font-medium">분석 쿠키</Label>
                        </div>
                        <Switch 
                          checked={settings.analytics} 
                          onCheckedChange={(checked) => updateSetting('analytics', checked)}
                        />
                      </div>
                      <p className="text-xs text-gray-600 ml-6">
                        사이트 이용 패턴 분석으로 서비스 개선에 사용됩니다.
                      </p>
                    </div>

                    {/* 마케팅 쿠키 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-purple-600" />
                          <Label className="font-medium">마케팅 쿠키</Label>
                        </div>
                        <Switch 
                          checked={settings.marketing} 
                          onCheckedChange={(checked) => updateSetting('marketing', checked)}
                        />
                      </div>
                      <p className="text-xs text-gray-600 ml-6">
                        맞춤형 광고 및 이벤트 정보 제공에 사용됩니다.
                      </p>
                    </div>

                    {/* 데이터 보관 기간 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Cookie className="h-4 w-4 text-orange-600" />
                        <Label className="font-medium">데이터 보관 기간</Label>
                      </div>
                      <div className="ml-6">
                        <select 
                          value={settings.dataRetentionDays}
                          onChange={(e) => updateSetting('dataRetentionDays', parseInt(e.target.value))}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value={90}>3개월</option>
                          <option value={180}>6개월</option>
                          <option value={365}>1년</option>
                          <option value={730}>2년</option>
                        </select>
                        <p className="text-xs text-gray-600 mt-1">
                          분석 데이터 자동 삭제 기간을 설정합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsSettingsOpen(false)}
                      className="flex-1"
                    >
                      취소
                    </Button>
                    <Button 
                      onClick={saveCustomSettings}
                      className="flex-1"
                    >
                      저장
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={acceptAll}
                size="sm"
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                모두 허용
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// 개인정보 설정 상태 표시 컴포넌트
export function PrivacyStatusIndicator() {
  const [settings, setSettings] = useState<PrivacySettings>(getDefaultPrivacySettings())

  useEffect(() => {
    setSettings(getPrivacySettings())
  }, [])

  if (!settings.cookieConsent) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm border shadow-sm hover:bg-white"
          >
            <Shield className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">개인정보 설정 현황</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>필수 쿠키</span>
              <Badge variant="default" className="text-xs">활성화</Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>분석 쿠키</span>
              <Badge 
                variant={settings.analytics ? "default" : "secondary"}
                className="text-xs"
              >
                {settings.analytics ? '활성화' : '비활성화'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>마케팅 쿠키</span>
              <Badge 
                variant={settings.marketing ? "default" : "secondary"}
                className="text-xs"
              >
                {settings.marketing ? '활성화' : '비활성화'}
              </Badge>
            </div>
            
            <div className="text-xs text-gray-600 pt-2 border-t">
              데이터 보관: {settings.dataRetentionDays}일
            </div>
          </div>
          
          <div className="pt-4">
            <a 
              href="/privacy-policy" 
              className="text-xs text-blue-600 underline"
            >
              개인정보 처리방침 보기
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 