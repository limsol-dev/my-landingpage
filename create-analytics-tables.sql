-- =============================================================================
-- 클릭/예약 시도 데이터 모델 및 Supabase 테이블 설계
-- =============================================================================

-- 1. 이벤트 타입 및 상태 ENUM 생성
CREATE TYPE event_type AS ENUM (
  'page_view',           -- 페이지 조회
  'room_view',          -- 객실 상세 조회
  'program_view',       -- 프로그램 상세 조회
  'date_select',        -- 날짜 선택
  'guest_count_change', -- 인원 수 변경
  'program_add',        -- 프로그램 추가
  'program_remove',     -- 프로그램 제거
  'price_check',        -- 가격 확인
  'reservation_start',  -- 예약 시작
  'reservation_submit', -- 예약 제출
  'payment_start',      -- 결제 시작
  'payment_complete',   -- 결제 완료
  'payment_fail',       -- 결제 실패
  'reservation_cancel', -- 예약 취소
  'booking_abandon'     -- 예약 중단
);

CREATE TYPE attempt_status AS ENUM (
  'in_progress',        -- 진행 중
  'completed',          -- 완료
  'abandoned',          -- 중단
  'cancelled',          -- 취소
  'failed'              -- 실패
);

-- 2. 세션 추적 테이블 (로그인하지 않은 사용자 포함)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. 클릭/예약 시도 메인 테이블
CREATE TABLE click_reservation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 사용자 식별 정보
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) REFERENCES user_sessions(session_id) ON DELETE CASCADE,
  
  -- 이벤트 정보
  event_type event_type NOT NULL,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_url TEXT,
  
  -- 예약 관련 정보
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  program_ids UUID[] DEFAULT '{}', -- 선택된 프로그램들의 배열
  check_in_date DATE,
  check_out_date DATE,
  adults_count INTEGER DEFAULT 0,
  children_count INTEGER DEFAULT 0,
  total_guests INTEGER GENERATED ALWAYS AS (adults_count + children_count) STORED,
  
  -- 금액 정보
  estimated_total_price DECIMAL(10,2),
  room_price DECIMAL(10,2),
  programs_price DECIMAL(10,2),
  
  -- 상태 및 메타데이터
  attempt_status attempt_status DEFAULT 'in_progress',
  conversion_funnel_step INTEGER DEFAULT 1, -- 전환 단계 (1: 조회, 2: 선택, 3: 예약시도, 4: 결제, 5: 완료)
  
  -- 기술적 정보
  device_type VARCHAR(50), -- mobile, tablet, desktop
  browser VARCHAR(100),
  os VARCHAR(100),
  
  -- 추가 데이터 (JSON)
  metadata JSONB DEFAULT '{}',
  
  -- 관련 예약 (완료된 경우)
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_click_attempts_user_id ON click_reservation_attempts(user_id);
CREATE INDEX idx_click_attempts_session_id ON click_reservation_attempts(session_id);
CREATE INDEX idx_click_attempts_event_type ON click_reservation_attempts(event_type);
CREATE INDEX idx_click_attempts_timestamp ON click_reservation_attempts(event_timestamp DESC);
CREATE INDEX idx_click_attempts_room_id ON click_reservation_attempts(room_id);
CREATE INDEX idx_click_attempts_status ON click_reservation_attempts(attempt_status);
CREATE INDEX idx_click_attempts_funnel_step ON click_reservation_attempts(conversion_funnel_step);
CREATE INDEX idx_click_attempts_date_range ON click_reservation_attempts(check_in_date, check_out_date);

-- 복합 인덱스
CREATE INDEX idx_click_attempts_user_timestamp ON click_reservation_attempts(user_id, event_timestamp DESC);
CREATE INDEX idx_click_attempts_session_timestamp ON click_reservation_attempts(session_id, event_timestamp DESC);

-- 세션 테이블 인덱스
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at DESC);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity_at DESC);

-- 5. 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 설정
CREATE TRIGGER update_click_attempts_updated_at
  BEFORE UPDATE ON click_reservation_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_last_activity
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS (Row Level Security) 정책 설정

-- 세션 테이블 RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 세션만 조회 가능
CREATE POLICY user_sessions_select_own ON user_sessions
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.current_session_id', true)
  );

-- 관리자는 모든 세션 조회 가능
CREATE POLICY user_sessions_admin_all ON user_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 클릭/예약 시도 테이블 RLS
ALTER TABLE click_reservation_attempts ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회 가능
CREATE POLICY click_attempts_select_own ON click_reservation_attempts
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.current_session_id', true)
  );

-- 관리자는 모든 데이터 조회/관리 가능
CREATE POLICY click_attempts_admin_all ON click_reservation_attempts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 인증된 사용자는 자신의 데이터 삽입 가능
CREATE POLICY click_attempts_insert_own ON click_reservation_attempts
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

-- 7. 분석용 뷰 생성

-- 전환 깔때기 분석 뷰
CREATE VIEW conversion_funnel_analysis AS
SELECT 
  conversion_funnel_step,
  COUNT(*) as attempts_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(estimated_total_price) as avg_order_value,
  DATE_TRUNC('day', event_timestamp) as event_date
FROM click_reservation_attempts
GROUP BY conversion_funnel_step, DATE_TRUNC('day', event_timestamp)
ORDER BY event_date DESC, conversion_funnel_step;

-- 일별 이벤트 통계 뷰
CREATE VIEW daily_event_stats AS
SELECT 
  DATE_TRUNC('day', event_timestamp) as event_date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users
FROM click_reservation_attempts
GROUP BY DATE_TRUNC('day', event_timestamp), event_type
ORDER BY event_date DESC, event_count DESC;

-- 객실별 관심도 분석 뷰
CREATE VIEW room_interest_analysis AS
SELECT 
  r.id as room_id,
  r.name as room_name,
  COUNT(cra.id) as total_interactions,
  COUNT(CASE WHEN cra.event_type = 'room_view' THEN 1 END) as views,
  COUNT(CASE WHEN cra.event_type = 'reservation_start' THEN 1 END) as reservation_starts,
  COUNT(CASE WHEN cra.event_type = 'reservation_submit' THEN 1 END) as reservation_submits,
  COUNT(CASE WHEN cra.attempt_status = 'completed' THEN 1 END) as completed_reservations,
  ROUND(
    COUNT(CASE WHEN cra.attempt_status = 'completed' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(CASE WHEN cra.event_type = 'room_view' THEN 1 END), 0) * 100, 2
  ) as conversion_rate_percent
FROM rooms r
LEFT JOIN click_reservation_attempts cra ON r.id = cra.room_id
GROUP BY r.id, r.name
ORDER BY total_interactions DESC;

-- 8. 샘플 데이터 삽입 함수
CREATE OR REPLACE FUNCTION insert_sample_analytics_data()
RETURNS VOID AS $$
DECLARE
  sample_session_id VARCHAR(255);
  sample_room_id UUID;
  sample_user_id UUID;
BEGIN
  -- 샘플 세션 생성
  sample_session_id := 'sess_' || gen_random_uuid()::text;
  
  -- 첫 번째 사용 가능한 객실 ID 가져오기
  SELECT id INTO sample_room_id FROM rooms LIMIT 1;
  
  -- 첫 번째 사용자 ID 가져오기 (있는 경우)
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  -- 세션 삽입
  INSERT INTO user_sessions (session_id, user_id, ip_address, user_agent, referrer)
  VALUES (
    sample_session_id,
    sample_user_id,
    '192.168.1.100'::INET,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'https://google.com'
  );
  
  -- 샘플 클릭/이벤트 데이터 삽입
  INSERT INTO click_reservation_attempts (
    session_id, user_id, event_type, room_id, 
    check_in_date, check_out_date, adults_count, children_count,
    estimated_total_price, conversion_funnel_step, attempt_status,
    device_type, browser, os, metadata
  ) VALUES 
  -- 페이지 조회
  (sample_session_id, sample_user_id, 'page_view', NULL, NULL, NULL, 0, 0, NULL, 1, 'in_progress', 'desktop', 'Chrome', 'Windows', '{"page": "landing"}'),
  
  -- 객실 조회
  (sample_session_id, sample_user_id, 'room_view', sample_room_id, NULL, NULL, 0, 0, NULL, 2, 'in_progress', 'desktop', 'Chrome', 'Windows', '{"room_name": "deluxe"}'),
  
  -- 날짜 선택
  (sample_session_id, sample_user_id, 'date_select', sample_room_id, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '8 days', 2, 0, 700000, 3, 'in_progress', 'desktop', 'Chrome', 'Windows', '{}'),
  
  -- 예약 시작
  (sample_session_id, sample_user_id, 'reservation_start', sample_room_id, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '8 days', 2, 0, 700000, 4, 'in_progress', 'desktop', 'Chrome', 'Windows', '{}'),
  
  -- 예약 제출
  (sample_session_id, sample_user_id, 'reservation_submit', sample_room_id, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '8 days', 2, 0, 700000, 5, 'completed', 'desktop', 'Chrome', 'Windows', '{}');
  
  RAISE NOTICE '샘플 분석 데이터가 성공적으로 삽입되었습니다.';
END;
$$ language 'plpgsql';

-- 9. 데이터 정리 함수 (오래된 데이터 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 지정된 일수보다 오래된 데이터 삭제
  DELETE FROM click_reservation_attempts 
  WHERE event_timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- 비활성 세션 정리
  DELETE FROM user_sessions 
  WHERE last_activity_at < NOW() - INTERVAL '1 day' * 30 
  AND is_active = FALSE;
  
  RETURN deleted_count;
END;
$$ language 'plpgsql';

-- 10. 코멘트 추가
COMMENT ON TABLE user_sessions IS '사용자 세션 추적 테이블 (로그인/비로그인 사용자 모두)';
COMMENT ON TABLE click_reservation_attempts IS '클릭 및 예약 시도 추적 메인 테이블';
COMMENT ON COLUMN click_reservation_attempts.conversion_funnel_step IS '전환 깔때기 단계: 1=조회, 2=선택, 3=예약시도, 4=결제, 5=완료';
COMMENT ON COLUMN click_reservation_attempts.program_ids IS '선택된 프로그램 UUID 배열';
COMMENT ON COLUMN click_reservation_attempts.metadata IS '추가 이벤트 데이터 (JSON 형태)';

-- 실행 완료 메시지
SELECT 'Analytics tables, indexes, RLS policies, and views created successfully!' as status; 