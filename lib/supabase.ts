import { createClient } from '@supabase/supabase-js'

// 개발 환경에서 임시 기본값 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://temp-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'temp-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 기본 환경 변수 검증 (개발 환경에서는 경고만 표시)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되지 않았습니다. .env.local 파일을 생성하고 Supabase 설정을 완료해주세요.')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다. .env.local 파일을 생성하고 Supabase 설정을 완료해주세요.')
}

// 실제 Supabase 키가 설정되었는지 확인
const isRealSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://temp-project.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'temp-anon-key'

if (isRealSupabaseConfigured) {
  console.log('✅ Supabase 설정이 완료되었습니다.')
} else {
  console.warn('⚠️  Supabase 환경변수가 실제 값으로 설정되지 않았습니다. 데이터베이스 기능이 제한될 수 있습니다.')
}

// 클라이언트 사이드용 (브라우저)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// 서버 사이드용 (API 라우트) - Service Role Key 사용
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export default supabase

// TypeScript 타입 확장
declare global {
  interface Window {
    __supabase_client__: any
  }
} 