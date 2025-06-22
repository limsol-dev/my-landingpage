# Supabase 연동 설정 가이드

이 프로젝트는 Supabase를 데이터베이스와 인증 시스템으로 사용합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 다음 정보를 확인합니다:
   - Project URL
   - Project API Key (anon, public)
   - Service Role Key (secret)

## 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 기타 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Supabase 키 찾는 방법:

1. Supabase 대시보드에서 프로젝트를 선택합니다.
2. 왼쪽 메뉴에서 "Settings" → "API"를 클릭합니다.
3. 다음 정보를 복사하여 환경변수에 입력하세요:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 입력
   - **Project API Key (anon, public)**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 입력
   - **Project API Key (service_role, secret)**: `SUPABASE_SERVICE_ROLE_KEY`에 입력

## 3. 데이터베이스 테이블 생성

1. Supabase 대시보드에서 "SQL Editor"를 클릭합니다.
2. `supabase-setup.sql` 파일의 내용을 복사하여 SQL 에디터에 붙여넣습니다.
3. "Run" 버튼을 클릭하여 테이블을 생성합니다.

## 4. RLS (Row Level Security) 확인

테이블 생성 후 다음을 확인하세요:

1. "Database" → "Tables"에서 `reservations` 테이블이 생성되었는지 확인
2. 테이블의 RLS가 활성화되어 있는지 확인
3. 정책(Policy)이 올바르게 설정되어 있는지 확인

## 5. 연동 테스트

1. 개발 서버를 시작합니다:
   ```bash
   npm run dev
   ```

2. 랜딩페이지에서 예약을 진행해봅니다.

3. Supabase 대시보드에서 "Database" → "Tables" → "reservations"를 확인하여 데이터가 저장되는지 확인합니다.

4. 어드민 페이지(`/admin/reservations`)에서 예약 목록이 표시되는지 확인합니다.

## 6. 배포 시 주의사항

### Vercel 배포 시:

1. Vercel 대시보드에서 프로젝트 설정으로 이동
2. "Environment Variables" 섹션에서 환경변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (배포된 도메인으로 설정)

3. 배포 후 재빌드

## 7. 보안 고려사항

- **Service Role Key는 절대 클라이언트 사이드에서 사용하지 마세요**
- RLS 정책을 적절히 설정하여 데이터 보안을 유지하세요
- API 키는 환경변수로만 관리하고 코드에 하드코딩하지 마세요

## 8. 문제 해결

### 연결 오류 시:
- 환경변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 네트워크 연결 상태 확인

### 권한 오류 시:
- RLS 정책이 올바르게 설정되었는지 확인
- Service Role Key가 올바른지 확인

### 데이터 저장 실패 시:
- 테이블 스키마가 올바르게 생성되었는지 확인
- 필수 필드가 누락되지 않았는지 확인

## 9. Authentication 설정

### Supabase Dashboard에서 Auth 설정:

1. **Authentication > Settings**에서:
   - Site URL: `http://localhost:3000` (개발용)
   - Redirect URLs: `http://localhost:3000/**`

2. **Authentication > Email Templates**에서 이메일 템플릿 한국어 설정 (선택사항)

### 이메일 인증 설정:
- **Confirm email**: 회원가입 시 이메일 인증 여부
- **Enable email confirmations**: 체크 해제 시 즉시 가입 가능

## 10. 관리자 계정 생성

### 방법 1: Supabase Dashboard에서 직접 생성
1. **Authentication > Users**에서 "Add user" 클릭
2. 이메일/비밀번호 입력하여 사용자 생성
3. SQL Editor에서 관리자 권한 부여:

```sql
-- 예시: admin@example.com 계정에 관리자 권한 부여
SELECT create_admin_user('admin@example.com', '관리자');
```

### 방법 2: 회원가입 후 수동으로 권한 부여
1. 일반 회원가입 진행
2. SQL Editor에서 권한 부여:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your_email@example.com';
```

## 11. RLS (Row Level Security) 정책

현재 설정된 보안 정책:
- **사용자**: 본인 프로필만 조회/수정 가능
- **예약**: 관리자만 모든 예약 조회/관리 가능
- **권한**: 슈퍼 관리자만 권한 관리 가능

## 12. 로그인 시스템 사용법

### 일반 사용자:
- **회원가입**: `/signup` - 이메일 인증 후 계정 활성화
- **로그인**: `/login` - 이메일/비밀번호로 로그인
- **프로필**: 네비게이션 메뉴에서 프로필 관리

### 관리자:
- **관리자 로그인**: `/admin/login` - 관리자 권한 필요
- **대시보드**: `/admin/dashboard` - 예약 관리, 사용자 관리
- **권한 관리**: 슈퍼 관리자만 가능

### 사용 가능한 컴포넌트:
- `useAuth()` 훅: 전역 인증 상태 관리
- `LoginForm`: 재사용 가능한 로그인 폼
- `SignupForm`: 재사용 가능한 회원가입 폼
- `AuthProvider`: 관리자 페이지 전용 인증 컨텍스트

## 13. 개발 시 유용한 SQL 쿼리

### 사용자 목록 조회:
```sql
SELECT 
  up.email, 
  up.full_name, 
  up.role, 
  up.created_at,
  au.email_confirmed_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC;
```

### 예약 통계:
```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(total_price) as total_revenue
FROM reservations 
GROUP BY status;
```

### 관리자 권한 조회:
```sql
SELECT 
  up.email,
  up.full_name,
  ap.permission_type,
  ap.can_read,
  ap.can_write,
  ap.can_delete
FROM user_profiles up
JOIN admin_permissions ap ON up.id = ap.user_id
WHERE up.role IN ('admin', 'super_admin');
```

---

문제가 발생하면 Supabase 콘솔의 로그를 확인하여 구체적인 오류 메시지를 확인하세요. 