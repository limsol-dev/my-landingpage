-- =============================================
-- 관리자 계정 생성 스크립트
-- =============================================

-- 1. 관리자 프로필 생성 (Supabase Auth에서 사용자 생성 후 실행)
-- 
-- 사용법:
-- 1. Supabase Dashboard > Authentication > Users에서 관리자 계정 생성
-- 2. 생성된 사용자의 UUID를 복사
-- 3. 아래 함수 호출 시 UUID를 입력

-- 예시: 관리자 프로필 설정
-- SELECT setup_admin_profile(
--   'your-user-uuid-here'::UUID,
--   'admin',
--   'admin@example.com',
--   '시스템 관리자'
-- );

-- 2. 테스트용 관리자 프로필 (실제 UUID로 교체 필요)
-- 주의: 실제 환경에서는 반드시 실제 UUID를 사용하세요
INSERT INTO user_profiles (
  id,
  username,
  email,
  full_name,
  role,
  is_active,
  email_verified,
  phone_verified
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'admin',
  'admin@pension.com',
  '펜션 관리자',
  'admin',
  true,
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  email_verified = true,
  phone_verified = true,
  updated_at = NOW();

-- 3. 일반 사용자 프로필 예시
INSERT INTO user_profiles (
  id,
  username,
  email,
  full_name,
  role,
  is_active,
  email_verified
) VALUES (
  '550e8400-e29b-41d4-a716-446655440100'::UUID,
  'user1',
  'user1@example.com',
  '김고객',
  'user',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  email_verified = true,
  updated_at = NOW();

-- 4. 모임장 사용자 프로필 예시
INSERT INTO user_profiles (
  id,
  username,
  email,
  full_name,
  role,
  is_active,
  email_verified
) VALUES (
  '550e8400-e29b-41d4-a716-446655440101'::UUID,
  'group_leader1',
  'leader@example.com',
  '이모임장',
  'group_leader',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  role = 'group_leader',
  is_active = true,
  email_verified = true,
  updated_at = NOW();

-- 완료 메시지
SELECT '🎉 관리자 계정이 성공적으로 생성되었습니다!' as message;
SELECT '👤 생성된 계정:' as info;
SELECT '   - 관리자: admin@pension.com (admin)' as admin_account;
SELECT '   - 일반 사용자: user1@example.com (user1)' as user_account;
SELECT '   - 모임장: leader@example.com (group_leader1)' as leader_account;
SELECT '⚠️  실제 운영 환경에서는 Supabase Auth를 통해 실제 사용자를 생성하세요!' as warning; 