# 🔥 Supabase MCP 연결 복구 가이드

## 📋 현재 상황
- MCP 설정 파일은 업데이트 완료 ✅
- .env.local 파일이 없어서 환경변수 누락 ❌

## 🛠️ 해결 단계

### 1단계: .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 복사하세요:

```env
# Supabase 설정 (기본 테스트 환경)
NEXT_PUBLIC_SUPABASE_URL=https://atxpuystwztisamzdybo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0eHB1eXN0d3p0aXNhbXpkeWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjg0MzAsImV4cCI6MjA2Njk0NDQzMH0.R7g6izi585ZP3GxJ613erWqdZJYzAXS-S2ID0ve1T14
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0eHB1eXN0d3p0aXNhbXpkeWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzY1NjU4NCwiZXhwIjoyMDQ5MjMyNTg0fQ.bj3JBQ9EwfBFTLGTdrnFTZfhWZfUw1gJkbJ2j9AUb5A

# JWT 설정
JWT_SECRET=snail-pension-jwt-secret-2024
JWT_EXPIRES_IN=7d

# 사이트 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# 카카오맵 API (선택적)
NEXT_PUBLIC_KAKAO_MAP_KEY=

# 이메일 설정 (선택적)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@snailpension.com
```

### 2단계: Cursor 재시작
1. Cursor를 완전히 종료하세요
2. Cursor를 다시 시작하세요
3. MCP 서버가 자동으로 연결됩니다

### 3단계: MCP 연결 확인
재시작 후 다음 명령어들이 작동하는지 테스트:
- `mcp_supabase_list_tables` 
- `mcp_supabase_execute_sql`

## 🔍 연결 확인 방법

### MCP 상태 확인
Cursor 우하단에서 MCP 서버 상태를 확인할 수 있습니다.
- 🟢 연결됨: Supabase MCP 사용 가능
- 🔴 연결 안됨: 환경변수 또는 설정 문제

### 테스트 쿼리
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

## ❗ 문제 해결

### 만약 여전히 연결이 안 된다면:
1. `.env.local` 파일 위치 확인 (프로젝트 루트)
2. 환경변수 값에 공백이나 따옴표 없는지 확인
3. Supabase 프로젝트가 활성화되어 있는지 확인

### MCP 재설치 (필요시)
```bash
npx -y @supabase/mcp-server-supabase@latest --version
```

## 📊 업데이트된 MCP 설정
```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c", "npx", "-y", 
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=atxpuystwztisamzdybo"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_...",
        "SUPABASE_URL": "https://atxpuystwztisamzdybo.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGci..."
      }
    }
  }
}
```

## ✅ 완료 체크리스트
- [ ] `.env.local` 파일 생성 및 환경변수 설정
- [ ] Cursor 재시작
- [ ] MCP 연결 상태 확인 (우하단)
- [ ] 테스트 쿼리 실행

---
**🎉 모든 단계 완료 후 Supabase MCP가 정상 작동합니다!** 