-- ===================================
-- 🚀 Username 컬럼 추가 마이그레이션
-- ===================================

-- 1. user_profiles 테이블에 username 컬럼 추가
DO $$ 
BEGIN
  -- username 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username TEXT;
    RAISE NOTICE '✅ username 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE '⚠️ username 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 2. 기존 사용자들에게 임시 username 생성 (email 앞부분 + 타임스탬프)
UPDATE user_profiles 
SET username = CONCAT(split_part(email, '@', 1), '_', EXTRACT(EPOCH FROM created_at)::INTEGER)
WHERE username IS NULL OR username = '';

-- 3. username을 NOT NULL과 UNIQUE로 설정
ALTER TABLE user_profiles ALTER COLUMN username SET NOT NULL;

-- 4. UNIQUE 제약조건 추가 (이미 있으면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_username_unique'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_unique UNIQUE (username);
    RAISE NOTICE '✅ username UNIQUE 제약조건이 추가되었습니다.';
  ELSE
    RAISE NOTICE '⚠️ username UNIQUE 제약조건이 이미 존재합니다.';
  END IF;
END $$;

-- 5. username 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 6. 새 사용자 등록 시 프로필 자동 생성 함수 업데이트
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '🎉 Username 시스템 설정이 완료되었습니다!';
  RAISE NOTICE '📋 이제 아이디/비밀번호로 로그인할 수 있습니다.';
END $$; 