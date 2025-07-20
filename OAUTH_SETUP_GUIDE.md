# 🔐 소셜 로그인 OAuth 설정 가이드

## 📋 개요
이 가이드는 달팽이 아지트 펜션 예약 사이트에서 Google과 Kakao 소셜 로그인을 설정하는 방법을 설명합니다.

## 🌟 1. Supabase OAuth Provider 활성화

### 1.1 Supabase Dashboard 접속
1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. 프로젝트 선택: `snail-pension` (또는 해당 프로젝트명)
3. 좌측 메뉴에서 **Authentication** > **Providers** 클릭

### 1.2 Redirect URLs 설정
먼저 아래 URL들을 허용된 리디렉트 URL에 추가해야 합니다:

**Development (로컬):**
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3000/admin/auth/callback
http://localhost:3001/admin/auth/callback
```

**Production (배포):**
```
https://your-domain.com/auth/callback
https://your-domain.com/admin/auth/callback
```

## 🔵 2. Google OAuth 설정

### 2.1 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스** > **사용자 인증 정보** 이동

### 2.2 OAuth 2.0 클라이언트 ID 생성
1. **+ 사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 클릭
2. 애플리케이션 유형: **웹 애플리케이션** 선택
3. 이름: `snail-pension-oauth` (또는 원하는 이름)

### 2.3 승인된 리디렉트 URI 설정
아래 URL들을 **승인된 리디렉트 URI**에 추가:

**Development:**
```
https://atxpuystwztisamzdybo.supabase.co/auth/v1/callback
```

**Production (배포 시):**
```
https://your-project-id.supabase.co/auth/v1/callback
```

### 2.4 클라이언트 정보 복사
1. **클라이언트 ID** 복사
2. **클라이언트 보안 비밀번호** 복사

### 2.5 Supabase에 Google 설정
1. Supabase Dashboard > Authentication > Providers
2. **Google** 찾아서 **Enable** 토글
3. 복사한 정보 입력:
   - **Client ID**: Google에서 복사한 클라이언트 ID
   - **Client Secret**: Google에서 복사한 클라이언트 보안 비밀번호
4. **Save** 클릭

## 🟡 3. Kakao OAuth 설정

### 3.1 Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com/) 접속 및 로그인
2. **내 애플리케이션** > **애플리케이션 추가하기** 클릭
3. 앱 정보 입력:
   - **앱 이름**: `달팽이 아지트 펜션`
   - **회사명**: `달팽이 아지트`
   - **카테고리**: `여행`

### 3.2 플랫폼 설정
1. 생성된 앱 클릭 > **플랫폼** 탭
2. **Web 플랫폼 등록** 클릭
3. **사이트 도메인** 입력:
   ```
   http://localhost:3000
   http://localhost:3001
   https://your-domain.com (배포 시)
   ```

### 3.3 카카오 로그인 활성화
1. **제품 설정** > **카카오 로그인** 클릭
2. **활성화 설정** 토글 ON
3. **Redirect URI** 등록:

**Development:**
```
https://atxpuystwztisamzdybo.supabase.co/auth/v1/callback
```

**Production (배포 시):**
```
https://your-project-id.supabase.co/auth/v1/callback
```

### 3.4 동의 항목 설정
1. **제품 설정** > **카카오 로그인** > **동의항목** 클릭
2. 필수 동의항목 설정:
   - **닉네임**: 필수 동의
   - **이메일**: 필수 동의 (필요 시)
   - **프로필 사진**: 선택 동의

### 3.5 앱 키 복사
1. **앱 설정** > **요약 정보** 또는 **앱 키** 탭
2. **REST API 키** 복사 (Client ID로 사용)
3. **앱 설정** > **보안** > **Client Secret** 생성 및 복사

### 3.6 Supabase에 Kakao 설정
1. Supabase Dashboard > Authentication > Providers
2. **Kakao** 찾아서 **Enable** 토글
3. 복사한 정보 입력:
   - **Client ID**: Kakao REST API 키
   - **Client Secret**: Kakao Client Secret
4. **Save** 클릭

## 🔧 4. 환경변수 업데이트 (선택사항)

필요한 경우 추가 설정을 위해 `.env.local`에 OAuth 관련 설정 추가:

```env
# OAuth 설정 (Supabase에서 자동 처리되므로 일반적으로 불필요)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
KAKAO_CLIENT_ID=your-kakao-rest-api-key
KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

## ✅ 5. 테스트

### 5.1 개발 서버 재시작
```bash
npm run dev
```

### 5.2 테스트 시나리오

**고객용 로그인 테스트:**
1. http://localhost:3001/login 접속
2. "Google로 로그인" 버튼 클릭
3. Google 인증 완료 후 메인 페이지로 리디렉트 확인
4. "카카오로 로그인" 버튼 클릭
5. Kakao 인증 완료 후 메인 페이지로 리디렉트 확인

**관리자용 로그인 테스트:**
1. http://localhost:3001/admin/login 접속
2. Google/Kakao 로그인 버튼 클릭
3. 소셜 로그인 완료 후 관리자 권한 확인
4. 일반 사용자의 경우 권한 오류 메시지 표시 확인

**회원가입 테스트:**
1. http://localhost:3001/signup 접속
2. Google/Kakao 회원가입 버튼 클릭
3. 소셜 계정으로 회원가입 완료 확인
4. user_profiles 테이블에 사용자 정보 저장 확인

## 🚨 6. 문제 해결

### 6.1 일반적인 오류

**"Invalid redirect URI" 오류:**
- Google Cloud Console 또는 Kakao Developers의 리디렉트 URI 설정 확인
- Supabase 프로젝트 URL이 정확한지 확인

**"Provider not enabled" 오류:**
- Supabase Dashboard에서 해당 Provider가 활성화되어 있는지 확인
- Client ID/Secret이 정확히 입력되었는지 확인

**권한 오류 (관리자 로그인):**
- 해당 소셜 계정이 user_profiles 테이블에 admin 또는 super_admin 역할로 설정되어 있는지 확인

### 6.2 디버깅 팁

**브라우저 개발자 도구 확인:**
- Network 탭에서 OAuth 요청/응답 확인
- Console 탭에서 에러 메시지 확인

**Supabase 로그 확인:**
- Supabase Dashboard > Logs에서 인증 관련 로그 확인

**데이터베이스 확인:**
```sql
-- 사용자 프로필 확인
SELECT * FROM user_profiles WHERE email = 'your-social-email@gmail.com';

-- 관리자 권한 부여 (필요 시)
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-social-email@gmail.com';
```

## 🎯 7. 보안 고려사항

### 7.1 Production 배포 시 주의사항
1. **HTTPS 필수**: 모든 OAuth 리디렉트는 HTTPS에서만 작동
2. **도메인 화이트리스트**: 정확한 도메인만 리디렉트 URI에 추가
3. **Client Secret 보안**: 환경변수로 관리하고 절대 노출 금지
4. **CORS 설정**: Supabase에서 허용된 도메인만 API 접근 허용

### 7.2 권장사항
- 정기적인 OAuth 앱 보안 검토
- 불필요한 권한 요청 최소화
- 사용자 동의 항목 명확히 설명
- 로그인 실패 시 적절한 에러 처리

---

## 📞 추가 도움

문제가 지속되는 경우:
1. [Supabase 공식 문서](https://supabase.com/docs/guides/auth/social-login)
2. [Google OAuth 문서](https://developers.google.com/identity/protocols/oauth2)
3. [Kakao Login 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)

모든 설정이 완료되면 사용자들이 간편하게 Google과 Kakao 계정으로 로그인할 수 있습니다! 🎉 