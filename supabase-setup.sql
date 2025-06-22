-- 예약 테이블 생성
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

-- 사용자 프로필 테이블 생성 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

-- 관리자 권한 테이블 생성
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_start_date ON reservations(start_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_name ON reservations(customer_name);

-- Row Level Security 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- 사용자 프로필 정책
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 예약 정책 (관리자는 모든 예약 조회 가능)
CREATE POLICY "Admin can view all reservations" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin can manage reservations" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 관리자 권한 정책
CREATE POLICY "Only super admin can manage permissions" ON admin_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 트리거: 새 사용자 등록 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 기본 관리자 계정 생성을 위한 함수 (수동 실행)
-- 실제 사용 시에는 Supabase Dashboard에서 사용자를 생성하고 이 함수로 관리자 권한을 부여합니다.
CREATE OR REPLACE FUNCTION create_admin_user(admin_email TEXT, admin_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- 이미 존재하는 사용자 찾기
  SELECT id INTO user_id FROM user_profiles WHERE email = admin_email;
  
  IF user_id IS NULL THEN
    RETURN '사용자를 찾을 수 없습니다. 먼저 Supabase Auth에서 사용자를 생성해주세요.';
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
  
  RETURN '관리자 권한이 성공적으로 부여되었습니다.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 예제: 관리자 계정 생성 (실제 사용 시 주석 해제하고 실행)
-- SELECT create_admin_user('admin@example.com', '관리자');

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 적용
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE reservations IS '예약 정보를 저장하는 테이블';
COMMENT ON COLUMN reservations.id IS '예약 고유 ID (UUID)';
COMMENT ON COLUMN reservations.customer_name IS '예약자 성명';
COMMENT ON COLUMN reservations.program_type IS '프로그램 유형';
COMMENT ON COLUMN reservations.start_date IS '시작일';
COMMENT ON COLUMN reservations.end_date IS '종료일';
COMMENT ON COLUMN reservations.status IS '예약 상태 (pending, confirmed, cancelled, completed)';
COMMENT ON COLUMN reservations.total_price IS '총 결제 금액';
COMMENT ON COLUMN reservations.participants IS '총 참가자 수';
COMMENT ON COLUMN reservations.phone IS '연락처';
COMMENT ON COLUMN reservations.email IS '이메일 주소';
COMMENT ON COLUMN reservations.special_requests IS '특별 요청사항';
COMMENT ON COLUMN reservations.payment_status IS '결제 상태 (pending, partial, completed)';
COMMENT ON COLUMN reservations.referrer IS '추천인/예약 경로';
COMMENT ON COLUMN reservations.confirmed_date IS '예약 확정일';
COMMENT ON COLUMN reservations.created_at IS '예약 생성일시';
COMMENT ON COLUMN reservations.updated_at IS '최종 수정일시'; 