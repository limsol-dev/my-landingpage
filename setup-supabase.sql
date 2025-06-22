-- ===================================
-- 🚀 완전한 Supabase 로그인 시스템 설정
-- ===================================

-- 1. 예약 테이블 생성
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  program_type TEXT NOT NULL DEFAULT '일반 예약',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  total_price INTEGER NOT NULL DEFAULT 0,
  participants INTEGER NOT NULL DEFAULT 1,
  phone TEXT NOT NULL,
  email TEXT,
  special_requests TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'completed')) DEFAULT 'pending',
  referrer TEXT DEFAULT '웹사이트',
  confirmed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인원 구성
  adults INTEGER,
  children INTEGER,
  
  -- BBQ 서비스
  bbq_grill_count INTEGER DEFAULT 0,
  bbq_meat_set_count INTEGER DEFAULT 0,
  bbq_full_set_count INTEGER DEFAULT 0,
  
  -- 식사 서비스
  meal_breakfast_count INTEGER DEFAULT 0,
  
  -- 교통 서비스
  transport_needs_bus BOOLEAN DEFAULT false,
  
  -- 체험 서비스
  experience_farm_count INTEGER DEFAULT 0,
  
  -- 기타 서비스
  extra_laundry_count INTEGER DEFAULT 0
);

-- 2. 사용자 프로필 테이블 생성 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL, -- 아이디 (중복 불가)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  role TEXT CHECK (role IN ('user', 'admin', 'super_admin')) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 관리자 권한 테이블 생성
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL, -- 'reservations', 'users', 'settings', 'all'
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_type)
);

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_start_date ON reservations(start_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_name ON reservations(customer_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 5. Row Level Security 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- 6. 사용자 프로필 정책 (인증된 사용자 접근 허용)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON user_profiles;

CREATE POLICY "Allow authenticated users to view profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. 예약 정책 (관리자는 모든 예약 조회 가능, 일반 사용자는 본인 예약만)
DROP POLICY IF EXISTS "Admin can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Admin can manage reservations" ON reservations;

CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (
    auth.uid()::text = email OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin can manage all reservations" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Anyone can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- 8. 관리자 권한 정책
DROP POLICY IF EXISTS "Only super admin can manage permissions" ON admin_permissions;

CREATE POLICY "Admin can view permissions" ON admin_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admin can manage permissions" ON admin_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 9. 트리거: 새 사용자 등록 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email), 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 적용
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 11. 관리자 계정 생성 함수
CREATE OR REPLACE FUNCTION create_admin_user(admin_email TEXT, admin_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- 이미 존재하는 사용자 찾기
  SELECT id INTO user_id FROM user_profiles WHERE email = admin_email;
  
  IF user_id IS NULL THEN
    RETURN '사용자를 찾을 수 없습니다. 먼저 회원가입을 진행해주세요.';
  END IF;
  
  -- 관리자 권한 부여
  UPDATE user_profiles 
  SET role = 'admin', 
      full_name = COALESCE(admin_name, full_name),
      updated_at = NOW()
  WHERE id = user_id;
  
  -- 기본 관리자 권한 추가
  INSERT INTO admin_permissions (user_id, permission_type, can_read, can_write, can_delete)
  VALUES 
    (user_id, 'reservations', true, true, true),
    (user_id, 'users', true, true, false),
    (user_id, 'settings', true, true, false)
  ON CONFLICT (user_id, permission_type) DO UPDATE SET
    can_read = EXCLUDED.can_read,
    can_write = EXCLUDED.can_write,
    can_delete = EXCLUDED.can_delete;
  
  RETURN '관리자 권한이 성공적으로 부여되었습니다: ' || admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 테스트용 데이터 (선택사항)
-- INSERT INTO reservations (customer_name, phone, email, start_date, end_date, total_price) 
-- VALUES ('테스트 사용자', '010-1234-5678', 'test@example.com', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', 100000);

-- ===================================
-- ✅ 설정 완료 메시지
-- ===================================
DO $$
BEGIN
  RAISE NOTICE '🚀 Supabase 로그인 시스템 설정이 완료되었습니다!';
  RAISE NOTICE '✅ 테이블: user_profiles, reservations, admin_permissions';
  RAISE NOTICE '✅ RLS 정책: 사용자 인증 및 권한 관리';
  RAISE NOTICE '✅ 트리거: 자동 프로필 생성';
  RAISE NOTICE '📋 관리자 계정 생성: SELECT create_admin_user(''your-email@example.com'', ''관리자명'');';
END $$;

-- ===================================
-- 🚀 완전한 Supabase 아이디/비밀번호 로그인 시스템 설정
-- ===================================

-- 0. 기존 테이블에 username 컬럼 추가 (마이그레이션)
DO $$ 
BEGIN
  -- user_profiles 테이블에 username 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username TEXT;
    
    -- 기존 사용자들에게 임시 username 생성 (email 앞부분 사용)
    UPDATE user_profiles 
    SET username = CONCAT(split_part(email, '@', 1), '_', EXTRACT(EPOCH FROM created_at)::INTEGER)
    WHERE username IS NULL;
    
    -- username을 NOT NULL과 UNIQUE로 설정
    ALTER TABLE user_profiles ALTER COLUMN username SET NOT NULL;
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_unique UNIQUE (username);
    
    RAISE NOTICE '✅ user_profiles 테이블에 username 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE '⚠️ username 컬럼이 이미 존재합니다.';
  END IF;
END $$; 