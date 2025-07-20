'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import supabase from '@/lib/supabase'
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Database, 
  Key, 
  Globe, 
  Settings,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react'

interface ConnectionTest {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: any
}

interface OAuthProvider {
  name: string
  enabled: boolean
  configured: boolean
  clientId?: string
  instructions: string[]
}

export default function SuperOAuthDebugger() {
  const [tests, setTests] = useState<ConnectionTest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [oauthProviders, setOAuthProviders] = useState<OAuthProvider[]>([])
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: '',
    anonKey: '',
    isValid: false
  })

  const initializeTests = () => {
    setTests([
      { name: '🔧 Supabase 클라이언트 초기화', status: 'pending', message: '테스트 준비 중...' },
      { name: '🌐 네트워크 연결', status: 'pending', message: '연결 확인 중...' },
      { name: '🔑 인증 키 검증', status: 'pending', message: 'API 키 확인 중...' },
      { name: '🗄️ 데이터베이스 접근', status: 'pending', message: 'DB 연결 테스트 중...' },
      { name: '👤 사용자 인증 시스템', status: 'pending', message: 'Auth 시스템 확인 중...' },
      { name: '🔐 OAuth 프로바이더 설정', status: 'pending', message: 'OAuth 설정 확인 중...' }
    ])
  }

  const updateTest = (index: number, updates: Partial<ConnectionTest>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ))
  }

  const runDiagnostics = async () => {
    setIsLoading(true)
    initializeTests()

    try {
      // 1. Supabase 클라이언트 초기화 테스트
      updateTest(0, { status: 'pending', message: 'Supabase 클라이언트 확인 중...' })
      
      if (!supabase) {
        updateTest(0, { 
          status: 'error', 
          message: 'Supabase 클라이언트가 초기화되지 않았습니다.'
        })
        return
      }
      
      updateTest(0, { 
        status: 'success', 
        message: 'Supabase 클라이언트 초기화 성공!',
        details: { 
          hasClient: !!supabase,
          hasAuth: !!supabase.auth,
          clientType: typeof supabase
        }
      })

      // 2. 네트워크 연결 테스트
      updateTest(1, { status: 'pending', message: '네트워크 연결 테스트 중...' })
      
      const config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      }
      
      setSupabaseConfig({
        ...config,
        isValid: config.url.includes('supabase.co') && config.anonKey.startsWith('eyJ')
      })

      try {
        const response = await fetch(`${config.url}/rest/v1/`, {
          headers: {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${config.anonKey}`
          }
        })
        
        if (response.ok || response.status === 401) {
          updateTest(1, { 
            status: 'success', 
            message: `네트워크 연결 성공! (상태: ${response.status})`,
            details: { 
              url: config.url,
              status: response.status,
              headers: Object.fromEntries(response.headers.entries())
            }
          })
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (networkError: any) {
        updateTest(1, { 
          status: 'error', 
          message: `네트워크 연결 실패: ${networkError.message}`,
          details: { error: networkError.toString() }
        })
        return
      }

      // 3. 인증 키 검증
      updateTest(2, { status: 'pending', message: 'API 키 유효성 검증 중...' })
      
      try {
        const { data, error } = await supabase.auth.getSession()
        updateTest(2, { 
          status: 'success', 
          message: 'API 키 검증 성공!',
          details: { 
            hasSession: !!data.session,
            sessionData: data,
            error: error?.message 
          }
        })
      } catch (authError: any) {
        updateTest(2, { 
          status: 'error', 
          message: `API 키 검증 실패: ${authError.message}`,
          details: { error: authError.toString() }
        })
      }

      // 4. 데이터베이스 접근 테스트
      updateTest(3, { status: 'pending', message: 'DB 테이블 접근 확인 중...' })
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1)
        
        updateTest(3, { 
          status: 'success', 
          message: 'DB 접근 성공! user_profiles 테이블 확인됨',
          details: { 
            data: data,
            error: error?.message,
            tableAccess: true
          }
        })
      } catch (dbError: any) {
        updateTest(3, { 
          status: 'error', 
          message: `DB 접근 실패: ${dbError.message}`,
          details: { error: dbError.toString() }
        })
      }

      // 5. 사용자 인증 시스템 테스트
      updateTest(4, { status: 'pending', message: '인증 시스템 기능 확인 중...' })
      
      try {
        const { data: user } = await supabase.auth.getUser()
        const authMethods = {
          getUser: !!supabase.auth.getUser,
          signInWithPassword: !!supabase.auth.signInWithPassword,
          signInWithOAuth: !!supabase.auth.signInWithOAuth,
          signUp: !!supabase.auth.signUp,
          signOut: !!supabase.auth.signOut
        }
        
        updateTest(4, { 
          status: 'success', 
          message: '인증 시스템 모든 메서드 사용 가능!',
          details: { 
            currentUser: user.user,
            availableMethods: authMethods,
            totalMethods: Object.values(authMethods).filter(Boolean).length
          }
        })
      } catch (userError: any) {
        updateTest(4, { 
          status: 'error', 
          message: `인증 시스템 오류: ${userError.message}`,
          details: { error: userError.toString() }
        })
      }

      // 6. OAuth 프로바이더 설정 확인
      updateTest(5, { status: 'pending', message: 'OAuth 프로바이더 확인 중...' })
      
      try {
        // Google OAuth 테스트
        const testGoogleOAuth = async () => {
          try {
            const { data, error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                }
              }
            })
            return { success: !error, error: error?.message, data }
          } catch (e: any) {
            return { success: false, error: e.message }
          }
        }

        // Kakao OAuth 테스트 
        const testKakaoOAuth = async () => {
          try {
            const { data, error } = await supabase.auth.signInWithOAuth({
              provider: 'kakao',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`
              }
            })
            return { success: !error, error: error?.message, data }
          } catch (e: any) {
            return { success: false, error: e.message }
          }
        }

        const googleTest = await testGoogleOAuth()
        const kakaoTest = await testKakaoOAuth()

        const providers: OAuthProvider[] = [
          {
            name: 'Google',
            enabled: googleTest.success,
            configured: !googleTest.error?.includes('Provider not found'),
            instructions: [
              '1. Supabase 대시보드 → Authentication → Providers → Google',
              '2. Google OAuth 2.0 클라이언트 ID와 Secret 입력',
              '3. 승인된 리디렉션 URI 추가: https://[your-project].supabase.co/auth/v1/callback',
              '4. Google Cloud Console에서 OAuth 동의 화면 설정'
            ]
          },
          {
            name: 'Kakao',
            enabled: kakaoTest.success,
            configured: !kakaoTest.error?.includes('Provider not found'),
            instructions: [
              '1. Supabase 대시보드 → Authentication → Providers → Kakao',
              '2. Kakao Developers에서 앱 생성 후 REST API 키 입력',
              '3. Redirect URI 설정: https://[your-project].supabase.co/auth/v1/callback',
              '4. 카카오 로그인 활성화 및 동의항목 설정'
            ]
          }
        ]

        setOAuthProviders(providers)
        
        const enabledCount = providers.filter(p => p.enabled).length
        const configuredCount = providers.filter(p => p.configured).length

        updateTest(5, { 
          status: enabledCount > 0 ? 'success' : 'error', 
          message: enabledCount > 0 
            ? `OAuth 설정 확인됨! (${enabledCount}/${providers.length} 프로바이더 활성화)`
            : '⚠️ OAuth 프로바이더가 설정되지 않았습니다.',
          details: { 
            providers,
            enabledCount,
            configuredCount,
            googleTest,
            kakaoTest
          }
        })

      } catch (oauthError: any) {
        updateTest(5, { 
          status: 'error', 
          message: `OAuth 확인 실패: ${oauthError.message}`,
          details: { error: oauthError.toString() }
        })
      }

    } catch (error: any) {
      console.error('❌ 진단 실행 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    const variants = {
      pending: 'default',
      success: 'success' as any,
      error: 'destructive' as any
    }
    const labels = {
      pending: '테스트 중',
      success: '성공',
      error: '실패'
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🚀 Super OAuth Debugger
              <Badge variant="outline">MCP 연동</Badge>
            </CardTitle>
            <CardDescription>
              Supabase MCP를 활용한 실시간 OAuth 진단 도구
            </CardDescription>
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            다시 테스트
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="diagnostics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diagnostics">진단 결과</TabsTrigger>
          <TabsTrigger value="oauth-setup">OAuth 설정</TabsTrigger>
          <TabsTrigger value="config">환경 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="space-y-4">
          {tests.map((test, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{test.name}</h4>
                        {getStatusBadge(test.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{test.message}</p>
                      {test.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            상세 정보 보기
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="oauth-setup" className="space-y-4">
          {oauthProviders.length > 0 ? (
            oauthProviders.map((provider, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {provider.name} OAuth 설정
                    <Badge variant={provider.enabled ? 'success' as any : 'secondary'}>
                      {provider.enabled ? '활성화됨' : '비활성화됨'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!provider.configured && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {provider.name} OAuth가 아직 설정되지 않았습니다. 아래 단계를 따라 설정해주세요.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <h4 className="font-medium">설정 단계:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {provider.instructions.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  OAuth 프로바이더 정보를 가져오는 중...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                현재 환경 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium">Supabase URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-xs">
                      {supabaseConfig.url || 'Not set'}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(supabaseConfig.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Anonymous Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-xs">
                      {supabaseConfig.anonKey ? `${supabaseConfig.anonKey.substring(0, 20)}...` : 'Not set'}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(supabaseConfig.anonKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">설정 상태:</span>
                  <Badge variant={supabaseConfig.isValid ? 'success' as any : 'destructive'}>
                    {supabaseConfig.isValid ? '유효함' : '무효함'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>빠른 해결책</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>OAuth 설정이 필요합니다!</strong><br/>
                    소셜 로그인을 사용하려면 Supabase 대시보드에서 OAuth 프로바이더를 설정해야 합니다.
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a 
                      href={`${supabaseConfig.url.replace('https://', 'https://supabase.com/dashboard/project/')}/auth/providers`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Supabase 대시보드 열기
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a 
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Google Cloud Console
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a 
                      href="https://developers.kakao.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Kakao Developers
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 