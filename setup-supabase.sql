-- =============================================
-- 달팽이 아지트 펜션 - Supabase 데이터베이스 설정
-- =============================================

-- 1. 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  birth_date DATE,
  profile_image TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0
);

-- 2. 예약 테이블 생성
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  program_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  adults INTEGER DEFAULT 1 CHECK (adults > 0),
  children INTEGER DEFAULT 0 CHECK (children >= 0),
  participants INTEGER GENERATED ALWAYS AS (adults + children) STORED,
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed')),
  confirmed_date TIMESTAMP WITH TIME ZONE,
  special_requests TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- BBQ 옵션
  bbq_grill_count INTEGER DEFAULT 0 CHECK (bbq_grill_count >= 0),
  bbq_meat_set_count INTEGER DEFAULT 0 CHECK (bbq_meat_set_count >= 0),
  bbq_full_set_count INTEGER DEFAULT 0 CHECK (bbq_full_set_count >= 0),
  
  -- 식사 옵션
  meal_breakfast_count INTEGER DEFAULT 0 CHECK (meal_breakfast_count >= 0),
  
  -- 교통 옵션
  transport_needs_bus BOOLEAN DEFAULT false,
  
  -- 체험 옵션
  experience_farm_count INTEGER DEFAULT 0 CHECK (experience_farm_count >= 0),
  
  -- 추가 서비스
  extra_laundry_count INTEGER DEFAULT 0 CHECK (extra_laundry_count >= 0)
);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);

-- 4. 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security) 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 사용자 프로필 정책
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- 예약 정책 (관리자만 접근 가능)
CREATE POLICY "Admins can view all reservations" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert reservations" ON reservations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update reservations" ON reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- 6. 기본 관리자 계정 생성 함수
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
  -- 이미 존재하는 이메일인지 확인
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    RETURN '이미 존재하는 이메일입니다: ' || admin_email;
  END IF;

  -- 사용자 생성 (Supabase Auth에서 수동으로 해야 함)
  RETURN '관리자 계정을 수동으로 생성해주세요. 이메일: ' || admin_email || ', 사용자명: ' || admin_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 관리자 프로필 생성 함수 (Auth 사용자가 이미 존재할 때)
CREATE OR REPLACE FUNCTION setup_admin_profile(
  user_id UUID,
  admin_username TEXT,
  admin_email TEXT,
  admin_full_name TEXT DEFAULT '관리자'
)
RETURNS TEXT AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    username,
    email,
    full_name,
    role,
    is_active,
    email_verified
  ) VALUES (
    user_id,
    admin_username,
    admin_email,
    admin_full_name,
    'admin',
    true,
    true
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_active = true,
    email_verified = true,
    updated_at = NOW();

  RETURN '관리자 프로필이 성공적으로 설정되었습니다: ' || admin_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 완료 메시지
SELECT '🎉 Supabase 데이터베이스 설정이 완료되었습니다!' as message;
SELECT '📋 다음 단계: Supabase Dashboard에서 관리자 계정을 생성하고 setup_admin_profile 함수를 호출하세요.' as next_step; 