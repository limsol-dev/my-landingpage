# 달팽이 아지트 펜션 랜딩 페이지

## 🏠 프로젝트 개요

달팽이 아지트 펜션의 공식 웹사이트입니다. 예약 시스템, 관리자 페이지, 사용자 인증 등 완전한 펜션 관리 솔루션을 제공합니다.

## ✨ 주요 기능

### 🎯 사용자 기능
- **반응형 랜딩 페이지**: 모든 디바이스에서 최적화된 UI/UX
- **실시간 예약 시스템**: 직관적인 예약 프로세스
- **사용자 인증**: 회원가입, 로그인, 이메일 인증
- **프로필 관리**: 개인정보 수정 및 예약 내역 조회
- **프로그램 매칭**: AI 기반 개인 맞춤 프로그램 추천

### 🔧 관리자 기능
- **통합 대시보드**: 예약 현황, 통계 한눈에 보기
- **예약 관리**: 예약 승인/거절, 일정 관리
- **회원 관리**: 사용자 정보 관리, 권한 설정
- **설정 관리**: 사이트 설정, 프로그램 관리

### 🚀 성능 최적화
- **코드 스플리팅**: 번들 크기 최적화
- **이미지 최적화**: WebP, AVIF 포맷 지원
- **캐싱 전략**: 정적 리소스 캐싱
- **디바운스/쓰로틀**: 성능 향상을 위한 이벤트 최적화

## 🛠 기술 스택

### Frontend
- **Next.js 15**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Radix UI**: 접근성 우선 컴포넌트 라이브러리
- **Lucide React**: 아이콘 라이브러리

### Backend & Database
- **Supabase**: 백엔드 서비스 (인증, 데이터베이스)
- **Prisma**: 타입 안전 ORM
- **PostgreSQL**: 관계형 데이터베이스

### 상태 관리 & 유틸리티
- **Zustand**: 경량 상태 관리
- **React Hook Form**: 폼 관리
- **Date-fns**: 날짜 처리
- **Zod**: 스키마 검증

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/my-landingpage.git
cd my-landingpage
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_database_url

# SendGrid (이메일 발송)
SENDGRID_API_KEY=your_sendgrid_api_key
```

### 4. 데이터베이스 설정
```bash
# Prisma 마이그레이션
npx prisma migrate dev

# 데이터베이스 시드 (선택사항)
npx prisma db seed
```

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속

## 🏗 프로젝트 구조

```
my-landingpage/
├── app/                      # Next.js 13+ App Router
│   ├── admin/               # 관리자 페이지
│   ├── api/                 # API 라우트
│   ├── booking/             # 예약 관련 페이지
│   ├── components/          # 페이지별 컴포넌트
│   └── ...
├── components/              # 공통 컴포넌트
│   ├── ui/                 # UI 컴포넌트 라이브러리
│   ├── sections/           # 섹션 컴포넌트
│   └── ...
├── hooks/                   # 커스텀 훅
├── lib/                     # 유틸리티 함수
├── store/                   # 상태 관리
├── types/                   # TypeScript 타입 정의
└── prisma/                  # 데이터베이스 스키마
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Blue (#3B82F6)
- **Secondary**: Green (#10B981)
- **Accent**: Orange (#F59E0B)
- **Neutral**: Gray (#6B7280)

### 컴포넌트 사용법
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// 기본 사용법
<Button variant="default" size="lg">
  예약하기
</Button>

<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
</Card>
```

## 🔐 인증 시스템

### 사용자 인증
- **회원가입**: 이메일 인증 필수
- **로그인**: 이메일/비밀번호 또는 소셜 로그인
- **비밀번호 재설정**: 이메일 링크를 통한 재설정

### 관리자 인증
- **하드코딩된 관리자 계정** (개발용)
  - 관리자: `admin` / `admin123`
  - 매니저: `manager` / `manager123`

## 📱 반응형 디자인

- **Mobile First**: 모바일 우선 디자인
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

## 🚀 배포

### Vercel 배포
```bash
npm run build
npm run start
```

### 환경별 설정
- **Development**: 개발 환경 설정
- **Production**: 프로덕션 최적화 설정

## 🧪 테스트

```bash
# 타입 체크
npm run type-check

# 빌드 테스트
npm run build

# 린트 체크
npm run lint
```

## 📊 성능 최적화

### 빌드 최적화
- **번들 분석**: 벤더 청크 분리
- **이미지 최적화**: Next.js Image 컴포넌트
- **코드 스플리팅**: 동적 임포트

### 런타임 최적화
- **메모이제이션**: React.memo, useMemo, useCallback
- **디바운스/쓰로틀**: 이벤트 최적화
- **지연 로딩**: 컴포넌트 지연 로딩

## 🐛 문제 해결

### 일반적인 문제
1. **빌드 에러**: 타입스크립트 에러 확인
2. **Hydration 에러**: SSR/CSR 불일치 확인
3. **환경 변수**: `.env.local` 파일 확인

### 디버깅 팁
- 브라우저 개발자 도구 활용
- Next.js 개발 모드에서 상세 에러 메시지 확인
- 콘솔 로그 활용

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **이메일**: contact@snail-hideout.com
- **전화**: 010-1234-5678
- **주소**: 경기도 어딘가 달팽이 아지트

---

**달팽이 아지트 펜션**에서 특별한 힐링 경험을 만나보세요! 🐌✨

## 🎉 완성된 기능들

### ✅ 로그인/로그아웃 시스템 (완료!)
- **이메일 인증 없음**: 회원가입 즉시 로그인 가능
- **아이디 & 이메일 로그인**: 두 가지 방식 모두 지원
- **관리자 시스템**: 별도 관리자 로그인 페이지
- **자동 리다이렉트**: 로그인 상태에 따른 자동 페이지 이동

### 🚀 사용 방법

#### 1. 일반 사용자 로그인
```
http://localhost:3000/login
- 아이디 또는 이메일로 로그인
- 비밀번호 표시/숨기기 기능
- 자동 사용자명 중복 체크
```

#### 2. 회원가입
```
http://localhost:3000/signup
- 아이디 중복 체크 (실시간)
- 이메일 인증 없음 (즉시 가입 완료)
- 선택 정보: 이름, 전화번호, 생년월일
```

#### 3. 관리자 로그인
```
http://localhost:3000/admin/login
- 아이디 또는 이메일 선택 로그인
- 관리자 권한 자동 확인
- 관리자가 아닌 경우 접근 차단
```

#### 4. 네비게이션 바
- **로그인 전**: 로그인/회원가입 버튼 표시
- **로그인 후**: 사용자 프로필 드롭다운 메뉴
- **관리자**: 관리자 버튼 추가 표시

## 🎯 테스트 방법

### 1. 회원가입 테스트
```bash
1. http://localhost:3000/signup 접속
2. 아이디: testuser123 (실시간 중복 체크)
3. 이메일: test@test.com
4. 비밀번호: 12345678
5. 가입 완료 → 자동 로그인
```

### 2. 로그인 테스트
```bash
1. http://localhost:3000/login 접속
2. 아이디: testuser123 (또는 이메일: test@test.com)
3. 비밀번호: 12345678
4. 로그인 성공 → 메인 페이지 이동
```

### 3. 관리자 로그인 테스트
```bash
1. Supabase Dashboard에서 관리자 계정 생성
2. SQL Editor에서 권한 부여:
   UPDATE user_profiles SET role = 'admin' WHERE username = 'admin';
3. http://localhost:3000/admin/login에서 로그인
```

### 4. 네비게이션 테스트
- 로그인 전/후 버튼 변화 확인
- 사용자 드롭다운 메뉴 동작 확인
- 관리자 버튼 표시 확인

## 🔍 현재 상태 확인

### ✅ 완료된 기능
- [x] Supabase 클라이언트 설정
- [x] 이메일 인증 비활성화
- [x] 아이디 기반 로그인
- [x] 실시간 아이디 중복 체크
- [x] 관리자 권한 시스템
- [x] 자동 프로필 생성
- [x] 네비게이션 바 통합
- [x] 에러 처리 및 한국어화

### 🔧 설정 필요 (선택사항)
- [ ] .env.local 파일 (Supabase 키 설정)
- [ ] 데이터베이스 테이블 생성 (setup-supabase.sql)
- [ ] 관리자 계정 생성

### 💡 개발 모드
환경변수가 설정되지 않아도 기본 동작 가능:
- 폴백 클라이언트 사용
- 친절한 오류 메시지 표시
- 개발 중단 없음

## 🎊 결론

**완벽한 로그인/로그아웃 시스템이 완성되었습니다!**

- ✅ 이메일 인증 완전 제거
- ✅ 아이디 & 이메일 로그인 지원
- ✅ 관리자 시스템 통합
- ✅ 한국어 완벽 지원
- ✅ 모바일 반응형 디자인

이제 바로 사용할 수 있습니다! 🚀
