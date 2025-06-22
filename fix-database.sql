-- ===================================
-- 🔧 완전한 데이터베이스 문제 해결 스크립트
-- ===================================

-- 1. user_profiles 테이블 생성 (없으면)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
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

-- 2. username 컬럼 추가 (없으면)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username TEXT;
    RAISE NOTICE '✅ username 컬럼이 추가되었습니다.';
  END IF;
END $$;

-- 3. 기존 사용자들에게 임시 username 생성
UPDATE user_profiles 
SET username = CONCAT(split_part(email, '@', 1), '_', EXTRACT(EPOCH FROM created_at)::INTEGER)
WHERE username IS NULL OR username = '';

-- 4. username 제약조건 설정
ALTER TABLE user_profiles ALTER COLUMN username SET NOT NULL;

-- 5. UNIQUE 제약조건 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_username_unique'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_unique UNIQUE (username);
    RAISE NOTICE '✅ username UNIQUE 제약조건이 추가되었습니다.';
  END IF;
END $$;

-- 6. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 7. RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. RLS 정책 생성
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Allow authenticated users to view profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. 새 사용자 등록 시 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email, full_name, phone, birth_date)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || EXTRACT(EPOCH FROM NOW())::INTEGER), 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 이미 존재하는 경우 무시
    RETURN NEW;
  WHEN OTHERS THEN
    -- 다른 오류 발생 시 로그 남기고 계속 진행
    RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. 기존 auth.users에 있지만 user_profiles에 없는 사용자들 처리
INSERT INTO user_profiles (id, username, email, full_name, phone, birth_date)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1) || '_' || EXTRACT(EPOCH FROM au.created_at)::INTEGER),
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'phone',
  CASE 
    WHEN au.raw_user_meta_data->>'birth_date' IS NOT NULL 
    THEN (au.raw_user_meta_data->>'birth_date')::DATE 
    ELSE NULL 
  END
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 12. 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. 업데이트 트리거 적용
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '🎉 데이터베이스 문제 해결 완료!';
  RAISE NOTICE '✅ user_profiles 테이블 설정 완료';
  RAISE NOTICE '✅ username 시스템 설정 완료';
  RAISE NOTICE '✅ 자동 프로필 생성 트리거 설정 완료';
  RAISE NOTICE '✅ 기존 사용자 데이터 마이그레이션 완료';
  RAISE NOTICE '🔐 이제 회원가입과 로그인이 정상 작동합니다!';
END $$; 