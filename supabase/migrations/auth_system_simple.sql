-- =======================================================================
-- 달팽이 아지트 펜션 - 간단한 인증 시스템 (확실히 작동하는 버전)
-- =======================================================================

-- 1. 기존 정리
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- 2. 사용자 프로필 테이블
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  oauth_provider TEXT DEFAULT 'email',
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  preferences JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. 기본 RLS 정책들
CREATE POLICY "사용자는 자신의 프로필 조회 가능" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필 수정 가능" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "관리자는 모든 프로필 조회 가능" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "시스템은 프로필 생성 가능" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- 5. 새 사용자 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO user_profiles (
    id,
    email,
    username,
    full_name,
    oauth_provider,
    email_verified,
    avatar_url,
    last_login_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END,
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  RETURN NEW;
END;
$function$;

-- 6. 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 8. 업데이트 시간 트리거
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 10. 관리자 역할 변경 함수 (간단 버전)
CREATE OR REPLACE FUNCTION set_user_role(user_email TEXT, new_role TEXT)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE user_profiles 
  SET role = new_role 
  WHERE email = user_email;
  
  IF FOUND THEN
    RETURN '역할이 ' || new_role || '로 변경되었습니다.';
  ELSE
    RETURN '사용자를 찾을 수 없습니다.';
  END IF;
END;
$function$;

-- 11. 완료 알림
DO $notice$
BEGIN
  RAISE NOTICE '=== 인증 시스템 설치 완료! ===';
  RAISE NOTICE '✅ user_profiles 테이블 생성됨';
  RAISE NOTICE '✅ RLS 정책 적용됨';
  RAISE NOTICE '✅ 자동 프로필 생성 트리거 설정됨';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 관리자 역할 부여하기:';
  RAISE NOTICE '   SELECT set_user_role(''your-email@example.com'', ''admin'');';
  RAISE NOTICE '';
  RAISE NOTICE '📋 다음 단계:';
  RAISE NOTICE '   1. Google OAuth 설정 (Supabase Dashboard)';
  RAISE NOTICE '   2. .env.local 파일 확인';
  RAISE NOTICE '   3. 앱에서 로그인/회원가입 테스트';
END;
$notice$; 