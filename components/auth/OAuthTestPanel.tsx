"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, Settings, User, Shield } from 'lucide-react'

interface OAuthTestPanelProps {
  isAdmin?: boolean
}

export default function OAuthTestPanel({ isAdmin = false }: OAuthTestPanelProps) {
  const [testResults, setTestResults] = useState<{ [key: string]: 'success' | 'error' | 'pending' | null }>({
    google: null,
    kakao: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectPath = isAdmin ? '/admin/auth/callback' : '/auth/callback'
  const testDescription = isAdmin ? '관리자용 OAuth' : '일반 사용자용 OAuth'

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

      if (error) {
        console.error(`❌ ${provider} OAuth 테스트 실패:`, error)
        setTestResults(prev => ({ ...prev, [provider]: 'error' }))
        setError(`${provider} OAuth 연결 실패: ${error.message}`)
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

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'success':
        return '성공'
      case 'error':
        return '실패'
      case 'pending':
        return '테스트 중...'
      default:
        return '미테스트'
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return null // Production 환경에서는 표시하지 않음
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8 border-dashed border-orange-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Settings className="h-5 w-5" />
          OAuth 테스트 패널
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {isAdmin ? (
            <><Shield className="h-4 w-4" /> 관리자용 소셜 로그인 테스트</>
          ) : (
            <><User className="h-4 w-4" /> 일반 사용자용 소셜 로그인 테스트</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
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

        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
          <div className="font-medium mb-1">테스트 방법:</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>위 버튼 클릭 시 OAuth 로그인 창이 열립니다</li>
            <li>소셜 계정으로 로그인 완료 후 콜백 페이지를 확인하세요</li>
            <li>관리자 테스트 시 권한 오류가 정상적으로 표시되는지 확인하세요</li>
          </ol>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            개발 환경에서만 표시됩니다. OAuth 설정이 완료된 후 테스트하세요.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
} 