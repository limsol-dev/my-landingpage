"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function EnvironmentCheck() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
    configured: boolean
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    configured: false
  })

  useEffect(() => {
    // 환경변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const hasUrl = supabaseUrl && supabaseUrl !== 'https://atxpuystwztisamzdybo.supabase.co' && supabaseUrl.includes('.supabase.co')
    const hasKey = supabaseKey && supabaseKey !== 'demo-key' && supabaseKey.startsWith('eyJ')
    
    setEnvStatus({
      supabaseUrl: !!hasUrl,
      supabaseKey: !!hasKey,
      configured: !!(hasUrl && hasKey)
    })

    // 콘솔에 환경변수 정보 출력
    console.log('🔍 환경변수 체크:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || '❌ 설정되지 않음')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ 설정됨' : '❌ 설정되지 않음')
    console.log('- 전체 설정 상태:', hasUrl && hasKey ? '✅ 완료' : '❌ 미완료')
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />
  }

  const getStatusBadge = (status: boolean) => {
    return status ? 
      <Badge className="bg-green-100 text-green-800">설정됨</Badge> : 
      <Badge className="bg-red-100 text-red-800">미설정</Badge>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-500" />
          환경변수 설정 상태
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 전체 상태 */}
        <Alert variant={envStatus.configured ? "default" : "destructive"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {envStatus.configured ? 
              "✅ Supabase 환경변수가 모두 설정되었습니다. 소셜 로그인이 가능합니다." : 
              "❌ 환경변수 설정이 필요합니다. 소셜 로그인이 작동하지 않습니다."
            }
          </AlertDescription>
        </Alert>

        {/* 개별 환경변수 상태 */}
        <div className="space-y-3">
          <h3 className="font-semibold">환경변수 체크:</h3>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(envStatus.supabaseUrl)}
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(envStatus.supabaseUrl)}
              <span className="text-xs text-gray-500">
                {envStatus.supabaseUrl ? '올바른 URL' : '데모 URL 또는 미설정'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(envStatus.supabaseKey)}
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(envStatus.supabaseKey)}
              <span className="text-xs text-gray-500">
                {envStatus.supabaseKey ? '올바른 키' : '데모 키 또는 미설정'}
              </span>
            </div>
          </div>
        </div>

        {/* 설정 방법 안내 */}
        {!envStatus.configured && (
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium mb-2">📝 설정 방법:</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>프로젝트 루트에 <code className="bg-white px-1 rounded">.env.local</code> 파일 생성</li>
              <li>Supabase Dashboard → Settings → API에서 URL과 키 복사</li>
              <li>다음 내용을 .env.local에 추가:</li>
            </ol>
            <pre className="mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`}
            </pre>
            <p className="mt-2 text-xs">4. 개발 서버 재시작: <code className="bg-white px-1 rounded">npm run dev</code></p>
          </div>
        )}

        {/* 임시 테스트 환경변수 */}
        {!envStatus.configured && (
          <div className="text-xs text-blue-600 p-3 bg-blue-50 rounded-lg">
            <div className="font-medium mb-2">🚀 임시 테스트용 환경변수:</div>
            <p className="mb-2">설정이 완료되지 않은 경우 아래 환경변수로 테스트해보세요:</p>
            <pre className="p-2 bg-white rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://atxpuystwztisamzdybo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0eHB1eXN0d3p0aXNhbXpkeWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2NTY1ODQsImV4cCI6MjA0OTIzMjU4NH0.jWuGcyqgWlBUhXS2F9VQNyLLOiJOEaWKvXZkAJFrDTE`}
            </pre>
            <p className="mt-2 text-xs">⚠️ 이는 개발 테스트용이므로 실제 운영에서는 본인의 Supabase 프로젝트 설정을 사용하세요.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 