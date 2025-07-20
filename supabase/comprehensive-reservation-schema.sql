-- =============================================
-- 달팽이 아지트 펜션 - 완전한 예약 스키마 설계
-- 요청 필드: 예약날짜, 결제완료날짜, 이름/고객넘버링, 예약상태, 연락처, 예약목적, 확정인원, 기본인원, 추가인원, 버스매출, 조식매출, 고기매출, 총매출, 바베큐매출, 버너매출, 유입경로
-- =============================================

-- 1. 기존 테이블 백업 (필요시)
-- CREATE TABLE IF NOT EXISTS reservations_backup AS SELECT * FROM reservations;

-- 2. 메인 예약 테이블 (전체 필드 포함)
DROP TABLE IF EXISTS reservations CASCADE;

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ===== 기본 정보 =====
  customer_number SERIAL UNIQUE NOT NULL, -- 고객 넘버링 (자동증가)
  customer_name TEXT NOT NULL, -- 이름
  customer_email TEXT,
  phone TEXT NOT NULL, -- 연락처
  
  -- ===== 날짜 정보 =====
  reservation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 예약날짜
  payment_completed_date TIMESTAMP WITH TIME ZONE, -- 결제완료 날짜
  start_date DATE NOT NULL, -- 체크인 날짜
  end_date DATE NOT NULL, -- 체크아웃 날짜
  
  -- ===== 상태 관리 =====
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')), -- 예약상태
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed')),
  
  -- ===== 예약 목적 및 상세 =====
  reservation_purpose TEXT DEFAULT '휴양', -- 예약목적 (휴양, 워크샵, 모임, 가족여행, 회사워크샵, 동호회모임 등)
  special_requests TEXT, -- 특별요청사항
  
  -- ===== 인원 정보 =====
  basic_participants INTEGER DEFAULT 2 CHECK (basic_participants > 0), -- 기본인원
  additional_participants INTEGER DEFAULT 0 CHECK (additional_participants >= 0), -- 추가인원
  confirmed_participants INTEGER GENERATED ALWAYS AS (basic_participants + additional_participants) STORED, -- 확정인원 (자동계산)
  
  -- ===== 매출 정보 (원 단위) =====
  bus_revenue INTEGER DEFAULT 0 CHECK (bus_revenue >= 0), -- 버스매출
  breakfast_revenue INTEGER DEFAULT 0 CHECK (breakfast_revenue >= 0), -- 조식매출
  meat_revenue INTEGER DEFAULT 0 CHECK (meat_revenue >= 0), -- 고기매출
  bbq_revenue INTEGER DEFAULT 0 CHECK (bbq_revenue >= 0), -- 바베큐매출
  burner_revenue INTEGER DEFAULT 0 CHECK (burner_revenue >= 0), -- 버너매출
  room_revenue INTEGER DEFAULT 0 CHECK (room_revenue >= 0), -- 객실매출
  facility_revenue INTEGER DEFAULT 0 CHECK (facility_revenue >= 0), -- 시설이용료
  extra_revenue INTEGER DEFAULT 0 CHECK (extra_revenue >= 0), -- 기타매출
  total_revenue INTEGER GENERATED ALWAYS AS (
    bus_revenue + breakfast_revenue + meat_revenue + bbq_revenue + burner_revenue + room_revenue + facility_revenue + extra_revenue
  ) STORED, -- 총매출 (자동계산)
  
  -- ===== 마케팅 정보 =====
  referrer TEXT DEFAULT '직접방문', -- 유입경로 (직접방문, 네이버, 인스타그램, 카카오톡, 블로그, 지인추천, 광고, 검색 등)
  utm_source TEXT, -- UTM 소스 (google, naver, instagram, kakao)
  utm_medium TEXT, -- UTM 미디엄 (organic, cpc, social, email)
  utm_campaign TEXT, -- UTM 캠페인명
  marketing_channel TEXT, -- 마케팅 채널 분류
  
  -- ===== 시스템 정보 =====
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_date TIMESTAMP WITH TIME ZONE, -- 예약 확정일
  cancelled_date TIMESTAMP WITH TIME ZONE, -- 취소일
  
  -- ===== 추가 메타데이터 =====
  notes TEXT, -- 관리자 메모
  is_group_booking BOOLEAN DEFAULT FALSE, -- 단체예약 여부
  room_type TEXT DEFAULT 'standard', -- 객실타입
  nights INTEGER GENERATED ALWAYS AS (end_date - start_date) STORED, -- 숙박일수
  
  -- ===== 고객 만족도 =====
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 평점
  review_comment TEXT, -- 후기
  
  -- ===== 재무 정보 =====
  deposit_amount INTEGER DEFAULT 0, -- 예약금
  balance_amount INTEGER DEFAULT 0, -- 잔금
  refund_amount INTEGER DEFAULT 0, -- 환불금액
  commission_rate DECIMAL(5,2) DEFAULT 0.00, -- 수수료율
  net_revenue INTEGER GENERATED ALWAYS AS (total_revenue - refund_amount) STORED -- 순매출
);

-- 3. 예약 상세 옵션 테이블 (상품별 세부 정보)
CREATE TABLE reservation_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  
  -- 옵션 정보
  option_type TEXT NOT NULL CHECK (option_type IN ('bbq', 'meal', 'transport', 'experience', 'extra', 'room')),
  option_name TEXT NOT NULL, -- 바베큐 그릴, 고기세트, 조식, 버스, 체험프로그램 등
  option_description TEXT, -- 옵션 설명
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  total_price INTEGER GENERATED ALWAYS AS (quantity * unit_price) STORED,
  
  -- 시간/날짜 정보
  service_date DATE,
  service_time TIME,
  service_duration INTEGER, -- 서비스 시간(분)
  
  -- 상태 정보
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 고객 정보 테이블 (고객 관리 및 CRM)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_number INTEGER UNIQUE NOT NULL,
  
  -- 기본 정보
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT NOT NULL,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  
  -- 주소 정보
  address TEXT,
  city TEXT,
  postal_code TEXT,
  
  -- 통계 정보
  total_reservations INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  average_spending INTEGER DEFAULT 0,
  last_visit_date DATE,
  first_visit_date DATE,
  
  -- 고객 분류
  customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'group', 'corporate')),
  vip_level TEXT DEFAULT 'bronze' CHECK (vip_level IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- 선호도 정보
  preferred_room_type TEXT,
  preferred_services TEXT[], -- 선호 서비스 배열
  
  -- 마케팅 동의
  marketing_consent BOOLEAN DEFAULT FALSE,
  sms_consent BOOLEAN DEFAULT FALSE,
  email_consent BOOLEAN DEFAULT FALSE,
  
  -- 시스템 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 메모
  notes TEXT -- 고객 관련 메모
);

-- 5. 유입경로 마스터 테이블
CREATE TABLE referrer_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT UNIQUE NOT NULL, -- 유입경로명
  source_type TEXT NOT NULL CHECK (source_type IN ('direct', 'search', 'social', 'referral', 'paid', 'email')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  tracking_code TEXT, -- 추적코드
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 매출 분석 뷰 생성
CREATE VIEW revenue_analysis AS
SELECT 
  DATE_TRUNC('month', reservation_date) as month,
  COUNT(*) as total_reservations,
  SUM(total_revenue) as total_revenue,
  SUM(bus_revenue) as total_bus_revenue,
  SUM(breakfast_revenue) as total_breakfast_revenue,
  SUM(meat_revenue) as total_meat_revenue,
  SUM(bbq_revenue) as total_bbq_revenue,
  SUM(burner_revenue) as total_burner_revenue,
  SUM(room_revenue) as total_room_revenue,
  AVG(total_revenue) as avg_revenue_per_reservation,
  AVG(confirmed_participants) as avg_participants
FROM reservations
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('month', reservation_date)
ORDER BY month DESC;

-- 7. 유입경로 분석 뷰
CREATE VIEW referrer_analysis AS
SELECT 
  referrer,
  COUNT(*) as reservation_count,
  SUM(total_revenue) as total_revenue,
  AVG(total_revenue) as avg_revenue,
  SUM(confirmed_participants) as total_participants,
  AVG(confirmed_participants) as avg_participants
FROM reservations
WHERE status != 'cancelled'
GROUP BY referrer
ORDER BY reservation_count DESC;

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_reservations_customer_number ON reservations(customer_number);
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_payment_status ON reservations(payment_status);
CREATE INDEX idx_reservations_referrer ON reservations(referrer);
CREATE INDEX idx_reservations_created_at ON reservations(created_at);
CREATE INDEX idx_reservations_reservation_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_payment_completed_date ON reservations(payment_completed_date);
CREATE INDEX idx_reservations_purpose ON reservations(reservation_purpose);

CREATE INDEX idx_reservation_options_reservation_id ON reservation_options(reservation_id);
CREATE INDEX idx_reservation_options_type ON reservation_options(option_type);
CREATE INDEX idx_reservation_options_service_date ON reservation_options(service_date);

CREATE INDEX idx_customers_customer_number ON customers(customer_number);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_vip_level ON customers(vip_level);

CREATE INDEX idx_referrer_sources_name ON referrer_sources(source_name);
CREATE INDEX idx_referrer_sources_type ON referrer_sources(source_type);

-- 9. 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservation_options_updated_at
  BEFORE UPDATE ON reservation_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. 결제 완료 시 자동 업데이트 함수
CREATE OR REPLACE FUNCTION handle_payment_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    NEW.payment_completed_date = NOW();
    NEW.status = 'confirmed';
    NEW.confirmed_date = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_completion_trigger
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_completion();

-- 11. 고객 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO customers (customer_number, name, email, phone, total_reservations, total_spent, last_visit_date, first_visit_date)
    VALUES (NEW.customer_number, NEW.customer_name, NEW.customer_email, NEW.phone, 1, NEW.total_revenue, NEW.start_date, NEW.created_at::date)
    ON CONFLICT (customer_number) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      total_reservations = customers.total_reservations + 1,
      total_spent = customers.total_spent + NEW.total_revenue,
      last_visit_date = GREATEST(customers.last_visit_date, NEW.start_date),
      updated_at = NOW();
    
    UPDATE customers SET
      average_spending = total_spent / GREATEST(total_reservations, 1)
    WHERE customer_number = NEW.customer_number;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_stats_trigger
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();

-- 12. 기본 유입경로 데이터 삽입
INSERT INTO referrer_sources (source_name, source_type, description) VALUES
('직접방문', 'direct', '직접 웹사이트 방문'),
('네이버', 'search', '네이버 검색'),
('구글', 'search', '구글 검색'),
('인스타그램', 'social', '인스타그램 소셜미디어'),
('카카오톡', 'social', '카카오톡 공유'),
('블로그', 'referral', '블로그 추천'),
('지인추천', 'referral', '지인 추천'),
('광고', 'paid', '유료 광고'),
('이메일', 'email', '이메일 마케팅'),
('유튜브', 'social', '유튜브 소셜미디어'),
('페이스북', 'social', '페이스북 소셜미디어');

-- 13. RLS (Row Level Security) 정책 설정
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrer_sources ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 데이터에 접근 가능
CREATE POLICY "Admin access to reservations" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin access to reservation_options" ON reservation_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin access to customers" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin access to referrer_sources" ON referrer_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- 완료 메시지
SELECT '🎉 달팽이 아지트 펜션 - 완전한 예약 스키마 설계 완료!' as message;
SELECT '📋 포함된 주요 필드: 예약날짜, 결제완료날짜, 고객넘버링, 예약상태, 연락처, 예약목적, 확정인원, 기본/추가인원, 각종매출, 유입경로' as included_fields;
SELECT '🔧 추가 기능: 자동 통계 업데이트, 매출 분석 뷰, 고객 관리 시스템, 유입경로 분석' as additional_features; 

-- 기존 데이터 백업
CREATE TABLE IF NOT EXISTS reservations_backup AS SELECT * FROM reservations;

-- 새로운 예약 테이블 생성
DROP TABLE IF EXISTS reservations CASCADE;

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 기본 정보
  customer_number SERIAL UNIQUE NOT NULL, -- 고객 넘버링
  customer_name TEXT NOT NULL, -- 이름
  customer_email TEXT,
  phone TEXT NOT NULL, -- 연락처
  
  -- 날짜 정보
  reservation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 예약날짜
  payment_completed_date TIMESTAMP WITH TIME ZONE, -- 결제완료 날짜
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- 상태 관리
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')), -- 예약상태
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed')),
  
  -- 예약 목적
  reservation_purpose TEXT DEFAULT '휴양', -- 예약목적
  special_requests TEXT,
  
  -- 인원 정보
  basic_participants INTEGER DEFAULT 2 CHECK (basic_participants > 0), -- 기본인원
  additional_participants INTEGER DEFAULT 0 CHECK (additional_participants >= 0), -- 추가인원
  confirmed_participants INTEGER GENERATED ALWAYS AS (basic_participants + additional_participants) STORED, -- 확정인원
  
  -- 매출 정보
  bus_revenue INTEGER DEFAULT 0 CHECK (bus_revenue >= 0), -- 버스매출
  breakfast_revenue INTEGER DEFAULT 0 CHECK (breakfast_revenue >= 0), -- 조식매출
  meat_revenue INTEGER DEFAULT 0 CHECK (meat_revenue >= 0), -- 고기매출
  bbq_revenue INTEGER DEFAULT 0 CHECK (bbq_revenue >= 0), -- 바베큐매출
  burner_revenue INTEGER DEFAULT 0 CHECK (burner_revenue >= 0), -- 버너매출
  room_revenue INTEGER DEFAULT 0 CHECK (room_revenue >= 0), -- 객실매출
  facility_revenue INTEGER DEFAULT 0 CHECK (facility_revenue >= 0), -- 시설이용료
  extra_revenue INTEGER DEFAULT 0 CHECK (extra_revenue >= 0), -- 기타매출
  total_revenue INTEGER GENERATED ALWAYS AS (
    bus_revenue + breakfast_revenue + meat_revenue + bbq_revenue + burner_revenue + room_revenue + facility_revenue + extra_revenue
  ) STORED, -- 총매출
  
  -- 마케팅 정보
  referrer TEXT DEFAULT '직접방문', -- 유입경로
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- 시스템 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_date TIMESTAMP WITH TIME ZONE,
  cancelled_date TIMESTAMP WITH TIME ZONE,
  
  -- 추가 정보
  notes TEXT,
  is_group_booking BOOLEAN DEFAULT FALSE,
  room_type TEXT DEFAULT 'standard',
  nights INTEGER GENERATED ALWAYS AS (end_date - start_date) STORED,
  
  -- 재무 정보
  deposit_amount INTEGER DEFAULT 0,
  balance_amount INTEGER DEFAULT 0,
  refund_amount INTEGER DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  net_revenue INTEGER GENERATED ALWAYS AS (total_revenue - refund_amount) STORED
);