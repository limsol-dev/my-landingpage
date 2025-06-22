-- ===================================
-- 🚀 이메일 확인 완전 비활성화 스크립트
-- ===================================

-- 1. 기존 사용자들의 이메일을 모두 확인됨으로 설정
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. 새 사용자 가입 시 자동으로 이메일 확인됨으로 설정하는 트리거
CREATE OR REPLACE FUNCTION public.confirm_email_on_signup() 
RETURNS trigger AS $$
BEGIN
  -- 새 사용자의 이메일을 즉시 확인됨으로 설정
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 트리거 생성 (이메일 자동 확인)
DROP TRIGGER IF EXISTS auto_confirm_email ON auth.users;
CREATE TRIGGER auto_confirm_email
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.confirm_email_on_signup();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 이메일 확인이 완전히 비활성화되었습니다!';
  RAISE NOTICE '📧 모든 기존 사용자의 이메일이 확인됨으로 설정되었습니다.';
  RAISE NOTICE '🆕 새 사용자는 가입 즉시 이메일이 확인됩니다.';
END $$; 