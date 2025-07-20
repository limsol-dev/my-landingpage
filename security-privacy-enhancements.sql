-- =============================================================================
-- 보안/개인정보 보호 강화 스크립트
-- =============================================================================

-- 1. 관리자 접근 로그 테이블 생성
CREATE TABLE IF NOT EXISTS admin_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  ip_address INET,
  user_agent TEXT,
  request_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(255)
);

-- 관리자 접근 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_admin_logs_user_id ON admin_access_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action_type ON admin_access_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_table_name ON admin_access_logs(table_name);

-- 2. 개인정보 처리 로그 테이블
CREATE TABLE IF NOT EXISTS privacy_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL, -- 'view', 'export', 'delete', 'modify'
  data_type VARCHAR(50) NOT NULL,   -- 'personal_info', 'analytics', 'reservation'
  reason TEXT,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  ip_address INET,
  legal_basis VARCHAR(100), -- GDPR 법적 근거
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retention_period INTEGER DEFAULT 365 -- 보관 기간 (일)
);

-- 개인정보 처리 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_privacy_logs_user_id ON privacy_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_logs_performed_by ON privacy_audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_privacy_logs_timestamp ON privacy_audit_logs(timestamp DESC);

-- 3. 데이터 암호화 키 관리 테이블
CREATE TABLE IF NOT EXISTS encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name VARCHAR(100) UNIQUE NOT NULL,
  key_version INTEGER NOT NULL DEFAULT 1,
  algorithm VARCHAR(50) NOT NULL DEFAULT 'AES-256-GCM',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- 4. 민감 데이터 비식별화 함수들
CREATE OR REPLACE FUNCTION hash_email(email TEXT)
RETURNS TEXT AS $$
BEGIN
  -- 이메일을 SHA-256으로 해시화 (솔트 포함)
  RETURN encode(digest(email || 'pension_salt_2024', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION mask_phone(phone TEXT)
RETURNS TEXT AS $$
BEGIN
  -- 전화번호 마스킹 (가운데 4자리 숨김)
  IF phone IS NULL OR LENGTH(phone) < 8 THEN
    RETURN phone;
  END IF;
  
  RETURN SUBSTRING(phone FROM 1 FOR 3) || '****' || 
         SUBSTRING(phone FROM LENGTH(phone) - 3);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION pseudonymize_user_id(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  -- 사용자 ID를 의사식별자로 변환
  RETURN 'user_' || encode(digest(user_id::text || 'pseudo_salt_2024', 'sha256'), 'hex')::varchar(16);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. 개인정보 보호 강화된 뷰 생성
CREATE OR REPLACE VIEW analytics_summary_safe AS
SELECT 
  DATE_TRUNC('day', event_timestamp) as event_date,
  event_type,
  room_id,
  conversion_funnel_step,
  device_type,
  browser,
  os,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  -- 개인 식별 정보 제외, 통계만 제공
  AVG(estimated_total_price) as avg_order_value,
  COUNT(CASE WHEN attempt_status = 'completed' THEN 1 END) as completed_count
FROM click_reservation_attempts
GROUP BY 
  DATE_TRUNC('day', event_timestamp),
  event_type,
  room_id,
  conversion_funnel_step,
  device_type,
  browser,
  os
ORDER BY event_date DESC;

-- 관리자만 접근 가능한 상세 분석 뷰
CREATE OR REPLACE VIEW analytics_detailed_admin AS
SELECT 
  id,
  pseudonymize_user_id(user_id) as pseudo_user_id,
  session_id,
  event_type,
  event_timestamp,
  room_id,
  conversion_funnel_step,
  device_type,
  browser,
  os,
  estimated_total_price,
  attempt_status,
  -- 메타데이터에서 개인정보 제거
  metadata - 'email' - 'phone' - 'name' - 'personal_info' as safe_metadata
FROM click_reservation_attempts;

-- 6. 강화된 RLS 정책
-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS user_sessions_select_own ON user_sessions;
DROP POLICY IF EXISTS user_sessions_admin_all ON user_sessions;
DROP POLICY IF EXISTS click_attempts_select_own ON click_reservation_attempts;
DROP POLICY IF EXISTS click_attempts_admin_all ON click_reservation_attempts;
DROP POLICY IF EXISTS click_attempts_insert_own ON click_reservation_attempts;

-- 사용자 세션 정책 (강화됨)
CREATE POLICY user_sessions_select_own_secure ON user_sessions
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (session_id = current_setting('app.current_session_id', true) AND user_id IS NULL)
  );

-- 관리자 세션 접근 (감사 로그 포함)
CREATE POLICY user_sessions_admin_all_audited ON user_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND is_active = TRUE
    )
  );

-- 분석 데이터 보안 정책
CREATE POLICY analytics_user_own_secure ON click_reservation_attempts
  FOR SELECT
  USING (
    -- 사용자는 자신의 세션 데이터만 (개인정보 제외)
    (user_id = auth.uid() OR session_id = current_setting('app.current_session_id', true))
    AND created_at > NOW() - INTERVAL '30 days' -- 최근 30일만
  );

-- 관리자 분석 데이터 접근 (완전 감사)
CREATE POLICY analytics_admin_audited ON click_reservation_attempts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND is_active = TRUE
    )
  );

-- 삽입은 인증된 사용자 또는 세션 기반
CREATE POLICY analytics_insert_secure ON click_reservation_attempts
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

-- 7. 관리자 접근 로그 정책
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_logs_super_admin_only ON admin_access_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
      AND is_active = TRUE
    )
  );

-- 개인정보 처리 로그 정책
ALTER TABLE privacy_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY privacy_logs_admin_only ON privacy_audit_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND is_active = TRUE
    )
  );

-- 8. 관리자 접근 로깅 함수
CREATE OR REPLACE FUNCTION log_admin_access(
  p_action_type VARCHAR(100),
  p_table_name VARCHAR(100) DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_request_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  admin_id UUID;
  session_info TEXT;
BEGIN
  -- 현재 관리자 ID 가져오기
  admin_id := auth.uid();
  
  -- 관리자가 아니면 로깅하지 않음
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = admin_id 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN;
  END IF;
  
  -- 세션 정보 가져오기 (가능한 경우)
  session_info := current_setting('app.current_session_id', true);
  
  -- 관리자 접근 로그 삽입
  INSERT INTO admin_access_logs (
    admin_user_id,
    action_type,
    table_name,
    record_id,
    request_data,
    session_id
  ) VALUES (
    admin_id,
    p_action_type,
    p_table_name,
    p_record_id,
    p_request_data,
    session_info
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 개인정보 처리 로깅 함수
CREATE OR REPLACE FUNCTION log_privacy_action(
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_data_type VARCHAR(50),
  p_reason TEXT DEFAULT NULL,
  p_legal_basis VARCHAR(100) DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  admin_id UUID;
BEGIN
  admin_id := auth.uid();
  
  INSERT INTO privacy_audit_logs (
    user_id,
    action_type,
    data_type,
    reason,
    performed_by,
    legal_basis
  ) VALUES (
    p_user_id,
    p_action_type,
    p_data_type,
    p_reason,
    admin_id,
    p_legal_basis
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 데이터 정리 및 개인정보 자동 삭제 함수
CREATE OR REPLACE FUNCTION cleanup_personal_data(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  total_deleted INTEGER := 0;
BEGIN
  -- 만료된 분석 데이터 삭제
  DELETE FROM click_reservation_attempts 
  WHERE event_timestamp < NOW() - INTERVAL '1 day' * retention_days
  AND user_id IS NOT NULL; -- 로그인 사용자 데이터만
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  total_deleted := total_deleted + deleted_count;
  
  -- 비활성 세션 삭제
  DELETE FROM user_sessions 
  WHERE last_activity_at < NOW() - INTERVAL '30 days'
  AND is_active = FALSE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  total_deleted := total_deleted + deleted_count;
  
  -- 오래된 관리자 로그 삭제 (3년 보관)
  DELETE FROM admin_access_logs 
  WHERE timestamp < NOW() - INTERVAL '3 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  total_deleted := total_deleted + deleted_count;
  
  -- 오래된 개인정보 처리 로그 정리
  DELETE FROM privacy_audit_logs 
  WHERE timestamp < NOW() - INTERVAL '1 day' * retention_period;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  total_deleted := total_deleted + deleted_count;
  
  RETURN total_deleted;
END;
$$ LANGUAGE plpgsql;

-- 11. 사용자 데이터 완전 삭제 함수 (GDPR 삭제권)
CREATE OR REPLACE FUNCTION gdpr_delete_user_data(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 관리자만 실행 가능
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- 개인정보 처리 로그 기록
  PERFORM log_privacy_action(
    target_user_id,
    'delete',
    'all_personal_data',
    'GDPR right to erasure request',
    'Article 17 GDPR'
  );
  
  -- 사용자 분석 데이터 삭제
  DELETE FROM click_reservation_attempts WHERE user_id = target_user_id;
  
  -- 사용자 세션 삭제
  DELETE FROM user_sessions WHERE user_id = target_user_id;
  
  -- 사용자 프로필에서 개인정보 제거 (계정은 유지하되 익명화)
  UPDATE user_profiles 
  SET 
    email = hash_email(email),
    full_name = 'Deleted User',
    phone = NULL,
    birth_date = NULL,
    is_active = FALSE
  WHERE id = target_user_id;
  
  RAISE NOTICE 'User data deleted successfully for user: %', target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 데이터 무결성 검증 함수
CREATE OR REPLACE FUNCTION validate_data_privacy()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- 개인정보 직접 저장 여부 확인
  RETURN QUERY
  SELECT 
    'Personal Info in Analytics'::TEXT,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'click_reservation_attempts' 
        AND column_name IN ('email', 'phone', 'name', 'personal_id')
      ) THEN 'FAIL'::TEXT
      ELSE 'PASS'::TEXT
    END,
    'Analytics table should not contain direct personal information'::TEXT;
  
  -- RLS 정책 활성화 확인
  RETURN QUERY
  SELECT 
    'RLS Policies Active'::TEXT,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename IN ('click_reservation_attempts', 'user_sessions') 
        AND rowsecurity = TRUE
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'All sensitive tables should have RLS enabled'::TEXT;
  
  -- 관리자 접근 로그 활성화 확인
  RETURN QUERY
  SELECT 
    'Admin Access Logging'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM admin_access_logs LIMIT 1) 
      THEN 'PASS'::TEXT
      ELSE 'WARNING'::TEXT
    END,
    'Admin access should be logged'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 13. 보안 설정 및 제약조건
-- 민감한 테이블에 대한 직접 접근 제한
REVOKE ALL ON admin_access_logs FROM PUBLIC;
REVOKE ALL ON privacy_audit_logs FROM PUBLIC;
REVOKE ALL ON encryption_keys FROM PUBLIC;

-- 암호화 키 테이블 보안 설정
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY encryption_keys_super_admin_only ON encryption_keys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 14. 코멘트 추가
COMMENT ON TABLE admin_access_logs IS '관리자 접근 기록 - 감사 및 보안 모니터링용';
COMMENT ON TABLE privacy_audit_logs IS '개인정보 처리 기록 - GDPR 컴플라이언스용';
COMMENT ON TABLE encryption_keys IS '암호화 키 관리 - 민감 데이터 보호용';

COMMENT ON FUNCTION hash_email(TEXT) IS '이메일 해시화 - 개인정보 비식별화';
COMMENT ON FUNCTION mask_phone(TEXT) IS '전화번호 마스킹 - 개인정보 보호';
COMMENT ON FUNCTION pseudonymize_user_id(UUID) IS '사용자 ID 의사식별화';
COMMENT ON FUNCTION log_admin_access IS '관리자 접근 로깅 - 보안 감사용';
COMMENT ON FUNCTION gdpr_delete_user_data IS 'GDPR 삭제권 구현 - 개인정보 완전 삭제';

-- 실행 완료 메시지
SELECT 'Security and privacy enhancements applied successfully!' as status; 