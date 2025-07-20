# 🚀 Supabase 간단 로그인 시스템 구현 가이드

이 가이드는 **복잡한 이메일 인증 없이** Supabase를 활용해서 즉시 사용 가능한 로그인 시스템을 구현하는 방법을 설명합니다.

## 📋 1단계: Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성
1. [supabase.com](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 회원가입

### 1.2 새 프로젝트 생성
1. Dashboard에서 "New Project" 클릭
2. 프로젝트 이름: `my-simple-auth` (원하는 이름)
3. 데이터베이스 비밀번호 설정 (안전한 비밀번호 사용)
4. 지역 선택: `Northeast Asia (Seoul)` 권장
5. "Create new project" 클릭

### 1.3 API 키 복사
- Project Settings → API 탭 이동
- 다음 값들 복사해두기:
  ```
  Project URL: https://your-project-id.supabase.co
  anon public key: eyJhbGciOiJIUzI1NiIs...
  service_role key: eyJhbGciOiJIUzI1NiIs... (보안 주의!)
  ```

## 🔧 2단계: Next.js 프로젝트 설정

### 2.1 프로젝트 생성
```bash
npx create-next-app@latest my-simple-auth --typescript --tailwind --app
cd my-simple-auth
```

### 2.2 Supabase 설치
```bash
npm install @supabase/supabase-js
```

### 2.3 환경변수 설정
`.env.local` 파일 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 🗄️ 3단계: 데이터베이스 설정 (이메일 인증 비활성화)

### 3.1 인증 설정 변경
Supabase Dashboard → Authentication → Settings:
1. **Enable email confirmations: OFF** ✅ (중요!)
2. **Enable email invites: OFF**
3. **Enable phone confirmations: OFF**

### 3.2 사용자 프로필 테이블 생성
SQL Editor에서 실행:
```sql
-- 사용자 프로필 테이블
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 트리거 함수: 회원가입 시 자동 프로필 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, username, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 🔌 4단계: Supabase 클라이언트 설정

`lib/supabase.ts` 파일 생성:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // 세션 유지
    autoRefreshToken: true,     // 토큰 자동 갱신
    detectSessionInUrl: true    // URL에서 세션 감지
  }
})

// 사용자 타입 정의
export interface UserProfile {
  id: string
  username: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}
```

## 🔐 5단계: 인증 훅 구현

`hooks/useAuth.ts` 파일 생성:
```typescript
"use client"
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    }

    getSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 프로필 정보 가져오기
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('프로필 조회 오류:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('프로필 조회 예외:', error)
    }
  }

  // 회원가입 (이메일 인증 없이 즉시 사용 가능)
  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: username
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // 이메일 인증이 비활성화되어 있으므로 즉시 로그인됨
      return { success: true, user: data.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 로그인
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, user: data.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 로그아웃
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { success: !error, error: error?.message }
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut
  }
}
```

## 🎨 6단계: UI 컴포넌트 구현

### 6.1 회원가입 폼
`components/SignupForm.tsx` 생성:
```typescript
"use client"
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function SignupForm() {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await signUp(formData.email, formData.password, formData.username)
    
    if (result.success) {
      setMessage('✅ 회원가입 성공! 자동으로 로그인되었습니다.')
    } else {
      setMessage(`❌ ${result.error}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            사용자명
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            required
            minLength={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? '처리 중...' : '회원가입'}
        </button>
      </form>
      
      {message && (
        <div className="mt-4 p-3 rounded-md bg-gray-50 text-sm">
          {message}
        </div>
      )}
    </div>
  )
}
```

### 6.2 로그인 폼
`components/LoginForm.tsx` 생성:
```typescript
"use client"
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginForm() {
  const { signIn } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await signIn(formData.email, formData.password)
    
    if (result.success) {
      setMessage('✅ 로그인 성공!')
    } else {
      setMessage(`❌ ${result.error}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? '처리 중...' : '로그인'}
        </button>
      </form>
      
      {message && (
        <div className="mt-4 p-3 rounded-md bg-gray-50 text-sm">
          {message}
        </div>
      )}
    </div>
  )
}
```

### 6.3 사용자 대시보드
`components/UserDashboard.tsx` 생성:
```typescript
"use client"
import { useAuth } from '@/hooks/useAuth'

export default function UserDashboard() {
  const { user, profile, signOut, loading } = useAuth()

  if (loading) {
    return <div className="text-center mt-8">로딩 중...</div>
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">사용자 정보</h2>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            사용자명
          </label>
          <p className="mt-1 text-sm text-gray-900">{profile?.username}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <p className="mt-1 text-sm text-gray-900">{profile?.email}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            가입일
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleSignOut}
        className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        로그아웃
      </button>
    </div>
  )
}
```

## 🏠 7단계: 메인 페이지 구현

`app/page.tsx` 수정:
```typescript
"use client"
import { useAuth } from '@/hooks/useAuth'
import SignupForm from '@/components/SignupForm'
import LoginForm from '@/components/LoginForm'
import UserDashboard from '@/components/UserDashboard'
import { useState } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const [showSignup, setShowSignup] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            간단 로그인 시스템
          </h1>
          <p className="mt-2 text-gray-600">
            Supabase를 활용한 즉시 사용 가능한 인증
          </p>
        </div>

        {user ? (
          <UserDashboard />
        ) : (
          <div>
            {showSignup ? <SignupForm /> : <LoginForm />}
            
            <div className="text-center mt-4">
              <button
                onClick={() => setShowSignup(!showSignup)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showSignup ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

## 🚀 8단계: 실행 및 테스트

### 8.1 개발 서버 시작
```bash
npm run dev
```

### 8.2 테스트 시나리오
1. **회원가입 테스트:**
   - http://localhost:3000 접속
   - "계정이 없나요? 회원가입" 클릭
   - 사용자명, 이메일, 비밀번호 입력
   - "회원가입" 버튼 클릭
   - ✅ 즉시 로그인되어 사용자 대시보드 표시

2. **로그인 테스트:**
   - 로그아웃 후 다시 로그인 폼에서 테스트
   - 등록한 이메일/비밀번호로 로그인
   - ✅ 사용자 정보 표시

3. **세션 유지 테스트:**
   - 브라우저 새로고침
   - ✅ 로그인 상태 유지됨

## ✅ 완료! 주요 특징

### 🎯 즉시 사용 가능
- **이메일 인증 불필요**: 회원가입 즉시 로그인 가능
- **SMS 인증 불필요**: 복잡한 인증 절차 생략
- **간단한 UI**: 최소한의 입력 필드만 사용

### 🔒 보안 기능
- Supabase Auth의 안전한 비밀번호 해싱
- JWT 토큰 기반 세션 관리
- Row Level Security(RLS)로 데이터 보호

### 🔄 자동 기능
- 회원가입 시 사용자 프로필 자동 생성
- 토큰 자동 갱신
- 세션 상태 실시간 동기화

### 📱 사용자 경험
- 로딩 상태 표시
- 명확한 에러 메시지
- 반응형 디자인

---

이제 **이메일 인증 없이** 바로 사용할 수 있는 로그인 시스템이 완성되었습니다! 🎉 