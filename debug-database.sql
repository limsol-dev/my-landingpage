-- ===================================
-- 🔍 데이터베이스 상태 확인 스크립트
-- ===================================

-- 1. user_profiles 테이블 존재 여부 확인
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. 현재 저장된 사용자 데이터 확인
SELECT 
  id,
  username,
  email,
  full_name,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. auth.users 테이블의 사용자 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. 트리거 함수 존재 여부 확인
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 5. 트리거 존재 여부 확인
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ===================================
-- 결과 해석:
-- - user_profiles 테이블에 username 컬럼이 있어야 함
-- - auth.users에는 있지만 user_profiles에 없다면 트리거 문제
-- - 트리거 함수나 트리거가 없다면 설치 필요
-- =================================== 