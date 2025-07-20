"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface OAuthDebugPanelProps {
  isAdmin?: boolean
}

export default function OAuthDebugPanel({ isAdmin = false }: OAuthDebugPanelProps) {
  const [testResults, setTestResults] = useState<{ [key: string]: 'success' | 'error' | 'pending' | null }>({
    google: null,
    kakao: null,
    supabase: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const redirectPath = isAdmin ? '/admin/auth/callback' : '/auth/callback'
  const testDescription = isAdmin ? '관리자용 OAuth' : '일반 사용자용 OAuth'

  // Supabase 연결 테스트
  const testSupabaseConnection = async () => {
    setIsLoading(true)
    setError(null)
    setTestResults(prev => ({ ...prev, supabase: 'pending' }))

    try {
      console.log('🔍 Supabase 연결 테스트 시작')
      
      // 환경변수 체크
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('🔍 환경변수 확인:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        urlValue: supabaseUrl?.substring(0, 30) + '...',
        keyValue: supabaseAnonKey?.substring(0, 30) + '...'
      })

      // Supabase 세션 체크
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      console.log('🔍 세션 확인:', { sessionData, sessionError })
      
      if (sessionError) {
        throw new Error(`세션 확인 실패: ${sessionError.message}`)
      }

      // 테스트 쿼리 실행
      const { data: testData, error: testError } = await supabase
        .from('user_profiles')
        .select('count(*)')
        .limit(1)

      console.log('🔍 테스트 쿼리 결과:', { testData, testError })

      setTestResults(prev => ({ ...prev, supabase: 'success' }))
      setDebugInfo({
        connection: 'success',
        session: sessionData,
        query: testData
      })
      
    } catch (error: any) {
      console.error('❌ Supabase 연결 테스트 실패:', error)
      setTestResults(prev => ({ ...prev, supabase: 'error' }))
      setError(`Supabase 연결 실패: ${error.message}`)
      setDebugInfo({
        connection: 'error',
        error: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  // OAuth 제공자 테스트
  const testOAuthProvider = async (provider: 'google' | 'kakao') => {
    setIsLoading(true)
    setError(null)
    setTestResults(prev => ({ ...prev, [provider]: 'pending' }))

    try {
      console.log(`🧪 ${provider} OAuth 테스트 시작 (${testDescription})`)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectPath}?test=true`
        }
      })

      console.log(`🧪 ${provider} OAuth 응답:`, { data, error })

      if (error) {
        console.error(`❌ ${provider} OAuth 테스트 실패:`, error)
        setTestResults(prev => ({ ...prev, [provider]: 'error' }))
        
        if (error.message.includes('Provider not found')) {
          setError(`${provider} OAuth가 Supabase에서 활성화되지 않았습니다.`)
        } else {
          setError(`${provider} OAuth 연결 실패: ${error.message}`)
        }
      } else {
        console.log(`✅ ${provider} OAuth 리디렉트 시작됨`)
        setTestResults(prev => ({ ...prev, [provider]: 'success' }))
        // 리디렉트가 시작되므로 이 코드는 실행되지 않을 수 있음
      }
    } catch (error: any) {
      console.error(`💥 ${provider} OAuth 예외:`, error)
      setTestResults(prev => ({ ...prev, [provider]: 'error' }))
      setError(`${provider} OAuth 테스트 중 오류: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-3 h-3" />
      case 'error': return <XCircle className="w-3 h-3" />
      case 'pending': return <RefreshCw className="w-3 h-3 animate-spin" />
      default: return null
    }
  }

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'success': return '성공'
      case 'error': return '실패'
      case 'pending': return '테스트 중'
      default: return '미테스트'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          OAuth 디버깅 패널 ({testDescription})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Supabase 연결 테스트 */}
        <div className="space-y-3">
          <h3 className="font-semibold">1. Supabase 연결 테스트</h3>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="font-medium">Supabase 연결</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(testResults.supabase)}>
                {getStatusIcon(testResults.supabase)}
                <span className="ml-1">{getStatusText(testResults.supabase)}</span>
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={testSupabaseConnection}
                disabled={isLoading}
              >
                테스트
              </Button>
            </div>
          </div>
        </div>

        {/* OAuth 제공자 테스트 */}
        <div className="space-y-3">
          <h3 className="font-semibold">2. OAuth 제공자 테스트</h3>
          
          {/* Google OAuth */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium">Google</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(testResults.google)}>
                {getStatusIcon(testResults.google)}
                <span className="ml-1">{getStatusText(testResults.google)}</span>
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => testOAuthProvider('google')}
                disabled={isLoading}
              >
                테스트
              </Button>
            </div>
          </div>

          {/* Kakao OAuth */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#FEE500" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              <span className="font-medium">Kakao</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(testResults.kakao)}>
                {getStatusIcon(testResults.kakao)}
                <span className="ml-1">{getStatusText(testResults.kakao)}</span>
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => testOAuthProvider('kakao')}
                disabled={isLoading}
              >
                테스트
              </Button>
            </div>
          </div>
        </div>

        {/* 디버그 정보 */}
        {debugInfo && (
          <div className="space-y-3">
            <h3 className="font-semibold">3. 디버그 정보</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* 사용 안내 */}
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
          <div className="font-medium mb-2">🔧 OAuth 설정 방법:</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Supabase Dashboard → Authentication → Providers 이동</li>
            <li>Google/Kakao OAuth 제공자 활성화</li>
            <li>각 제공자의 Client ID/Secret 입력</li>
            <li>리다이렉트 URL 설정: <code className="bg-white px-1 rounded">{window.location.origin}/auth/callback</code></li>
          </ol>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            개발 환경에서만 표시됩니다. 오류가 발생하면 브라우저 개발자 도구의 콘솔을 확인하세요.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
} 