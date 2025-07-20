-- ============================================================================
-- 달팽이 아지트 펜션 - 완벽한 인증 시스템 스키마
-- ============================================================================

-- 1. 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
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
  oauth_provider TEXT, -- google, kakao, etc
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

-- 2. 사용자 세션 로그 테이블 (선택적)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. RLS (Row Level Security) 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 4. user_profiles RLS 정책
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

-- 5. user_sessions RLS 정책
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions" ON user_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 6. 트리거 함수: 새 사용자 등록 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, username, full_name, oauth_provider, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. 프로필 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. updated_at 자동 갱신 트리거
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_oauth ON user_profiles(oauth_provider, oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active);

-- 11. 관리자 계정 생성 함수
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_username TEXT DEFAULT 'admin',
  admin_full_name TEXT DEFAULT '관리자'
)
RETURNS TEXT AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Supabase auth.users 테이블에 사용자 생성 (직접 삽입)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    format('{"username":"%s","full_name":"%s"}', admin_username, admin_full_name)::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- user_profiles에 관리자 프로필 생성
  INSERT INTO user_profiles (
    id, email, username, full_name, role, email_verified, is_active
  ) VALUES (
    new_user_id, admin_email, admin_username, admin_full_name, 'super_admin', TRUE, TRUE
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    email_verified = TRUE,
    is_active = TRUE,
    updated_at = NOW();

  RETURN format('관리자 계정이 생성되었습니다. ID: %s, Email: %s', new_user_id, admin_email);
EXCEPTION
  WHEN OTHERS THEN
    RETURN format('관리자 계정 생성 실패: %s', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 초기 관리자 계정 생성 (선택적)
-- SELECT create_admin_user('admin@snailpension.com', 'admin123!@#', 'admin', '달팽이 아지트 관리자');

-- ============================================================================
-- 완료! 이제 다음 기능들이 준비되었습니다:
-- ✅ 사용자 프로필 관리
-- ✅ OAuth 지원 (구글, 카카오 등)
-- ✅ 역할 기반 권한 관리 (user, admin, super_admin)
-- ✅ 세션 관리
-- ✅ 자동 프로필 생성
-- ✅ RLS 보안 정책
-- ✅ 성능 최적화 인덱스
-- ============================================================================ 