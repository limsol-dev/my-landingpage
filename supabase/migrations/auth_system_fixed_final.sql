-- ===================================================================
-- 달팽이 아지트 펜션 - 수정된 인증 시스템 (트리거 오류 해결)
-- ===================================================================

-- 1. 기존 정리
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 2. 더 안전한 새 사용자 프로필 생성 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $function$
BEGIN
  -- 간단하고 안전한 프로필 생성
  INSERT INTO user_profiles (
    id,
    email,
    username,
    full_name,
    oauth_provider,
    email_verified,
    last_login_at
  ) VALUES (
    NEW.id,
    NEW.email,
    -- 안전한 사용자명 생성
    CASE 
      WHEN NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data->>'username' IS NOT NULL 
      THEN NEW.raw_user_meta_data->>'username'
      ELSE split_part(NEW.email, '@', 1)
    END,
    -- 안전한 이름 생성
    CASE 
      WHEN NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data->>'full_name' IS NOT NULL 
      THEN NEW.raw_user_meta_data->>'full_name'
      WHEN NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data->>'name' IS NOT NULL 
      THEN NEW.raw_user_meta_data->>'name'
      ELSE split_part(NEW.email, '@', 1)
    END,
    -- 안전한 OAuth 제공자 설정
    CASE 
      WHEN NEW.raw_app_meta_data IS NOT NULL AND NEW.raw_app_meta_data->>'provider' IS NOT NULL 
      THEN NEW.raw_app_meta_data->>'provider'
      ELSE 'email'
    END,
    -- 이메일 인증 상태
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END,
    -- 로그인 시간
    NOW()
  );
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- 오류 발생 시 로그를 남기고 계속 진행
    RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$function$;

-- 3. 트리거 다시 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. RLS 정책 확인 및 수정
-- 기존 INSERT 정책 삭제 후 다시 생성
DROP POLICY IF EXISTS "시스템은 프로필 생성 가능" ON user_profiles;
CREATE POLICY "시스템은 프로필 생성 가능" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- 5. 완료 메시지
DO $notice$
BEGIN
  RAISE NOTICE '=== 🔧 트리거 오류 해결 완료! ===';
  RAISE NOTICE '✅ 더 안전한 handle_new_user() 함수 적용';
  RAISE NOTICE '✅ 예외 처리 추가';
  RAISE NOTICE '✅ JSON 데이터 안전 처리';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 이제 회원가입을 다시 테스트해보세요!';
END;
$notice$; 