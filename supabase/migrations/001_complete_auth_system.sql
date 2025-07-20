-- ============================================================================
-- 달팽이 아지트 펜션 - 완벽한 인증 시스템 스키마
-- Supabase PostgreSQL with RLS
-- ============================================================================

-- 1. 기존 테이블 정리 (안전하게)
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 2. 사용자 프로필 테이블 생성
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  
  -- OAuth 정보
  oauth_provider TEXT DEFAULT 'email', -- email, google, kakao, etc
  oauth_provider_id TEXT,
  
  -- 프로필 상태
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 메타데이터
  preferences JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS (Row Level Security) 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책들
-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능  
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 관리자는 모든 사용자 프로필 조회 가능
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 관리자는 모든 사용자 프로필 수정 가능 (자신의 역할은 변경 불가)
CREATE POLICY "Admins can update profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
    AND (
      -- 자신이 아니거나, 자신이면서 역할 변경이 아닌 경우
      auth.uid() != user_profiles.id 
      OR (auth.uid() = user_profiles.id AND NEW.role = OLD.role)
    )
  );

-- 5. 트리거 함수: 새 사용자 등록 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    id, 
    email, 
    username, 
    full_name, 
    oauth_provider, 
    oauth_provider_id,
    email_verified,
    avatar_url,
    last_login_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NEW.raw_user_meta_data->>'provider_id',
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END,
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 트리거 생성: auth.users에 새 사용자 생성 시 프로필 자동 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. 프로필 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. updated_at 자동 갱신 트리거
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_oauth ON user_profiles(oauth_provider, oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_created ON user_profiles(created_at);

-- 10. 관리자 계정 생성 함수
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT DEFAULT 'Admin User'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- 이미 존재하는 이메일인지 확인
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    result = json_build_object('success', false, 'message', '이미 존재하는 이메일입니다.');
    RETURN result;
  END IF;

  -- 관리자 계정 생성 (이 함수는 실제로는 애플리케이션 레벨에서 처리해야 함)
  result = json_build_object(
    'success', true, 
    'message', '관리자 계정 생성 요청이 접수되었습니다. Supabase Auth를 통해 수동으로 생성해주세요.',
    'instructions', json_build_object(
      'email', admin_email,
      'password', admin_password,
      'role', 'admin',
      'sql_update', format('UPDATE user_profiles SET role = ''admin'', full_name = ''%s'' WHERE email = ''%s'';', admin_name, admin_email)
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 사용자 역할 업데이트 함수 (관리자용)
CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS JSON AS $$
DECLARE
  current_user_role TEXT;
  result JSON;
BEGIN
  -- 현재 사용자의 역할 확인
  SELECT role INTO current_user_role 
  FROM user_profiles 
  WHERE id = auth.uid();

  -- 관리자 권한 확인
  IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'super_admin') THEN
    result = json_build_object('success', false, 'message', '권한이 없습니다.');
    RETURN result;
  END IF;

  -- 역할 유효성 검사
  IF new_role NOT IN ('user', 'admin', 'super_admin') THEN
    result = json_build_object('success', false, 'message', '유효하지 않은 역할입니다.');
    RETURN result;
  END IF;

  -- 슈퍼 관리자만 다른 관리자의 역할 변경 가능
  IF new_role IN ('admin', 'super_admin') AND current_user_role != 'super_admin' THEN
    result = json_build_object('success', false, 'message', '슈퍼 관리자만 관리자 역할을 부여할 수 있습니다.');
    RETURN result;
  END IF;

  -- 역할 업데이트
  UPDATE user_profiles 
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;

  IF FOUND THEN
    result = json_build_object('success', true, 'message', '사용자 역할이 업데이트되었습니다.');
  ELSE
    result = json_build_object('success', false, 'message', '사용자를 찾을 수 없습니다.');
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 사용자 통계 뷰 생성 (관리자용)
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_users,
  COUNT(*) FILTER (WHERE email_verified = true) as verified_users,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
  COUNT(*) FILTER (WHERE oauth_provider != 'email') as oauth_users,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_7d
FROM user_profiles;

-- 13. 권한 확인: 관리자만 뷰 조회 가능
ALTER VIEW user_stats OWNER TO postgres;

-- 14. 샘플 데이터 (개발용) - 주석 처리됨
-- 운영 환경에서는 아래 주석을 유지하세요.
-- INSERT INTO user_profiles (
--   id, email, username, full_name, role, email_verified, is_active, oauth_provider
-- ) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440000', 'admin@snailpension.com', 'admin', '관리자', 'admin', true, true, 'email')
-- ON CONFLICT (id) DO NOTHING;

-- 15. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 달팽이 아지트 펜션 인증 시스템 스키마 설치 완료!';
  RAISE NOTICE '📋 다음 단계:';
  RAISE NOTICE '   1. Supabase Auth에서 Google OAuth 설정';
  RAISE NOTICE '   2. 환경변수 설정 확인 (.env.local)';
  RAISE NOTICE '   3. 관리자 계정 생성 후 역할 업데이트';
  RAISE NOTICE '   4. 애플리케이션에서 로그인/회원가입 테스트';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 관리자 역할 부여 명령어:';
  RAISE NOTICE '   UPDATE user_profiles SET role = ''admin'' WHERE email = ''your-admin@email.com'';';
END $$; 