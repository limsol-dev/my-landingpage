-- =============================================
-- 🏠 달팽이 아지트 펜션 - 랜딩페이지 기반 예약 시스템 DDL
-- =============================================
-- 📝 랜딩페이지 예약 폼에서 실제 수집하는 데이터를 기준으로 작성
-- 📅 작성일: 2024년 1월

-- =============================================
-- 1. 기본 설정
-- =============================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. 예약 테이블 (메인)
-- =============================================

CREATE TABLE IF NOT EXISTS reservations (
  -- 🔑 기본 식별자
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_number TEXT UNIQUE NOT NULL DEFAULT ('RES-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  
  -- 👤 예약자 정보 (랜딩페이지 모달에서 수집)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  
  -- 📅 예약 기간 정보
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INTEGER GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  
  -- 👥 인원 정보 (랜딩페이지 게스트 선택에서 수집)
  adults INTEGER NOT NULL DEFAULT 2 CHECK (adults > 0),
  children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
  total_guests INTEGER GENERATED ALWAYS AS (adults + children) STORED,
  
  -- 🍖 BBQ 옵션 (랜딩페이지에서 매우 상세하게 수집)
  bbq_grill_count INTEGER NOT NULL DEFAULT 0 CHECK (bbq_grill_count >= 0),
  bbq_meat_set_count INTEGER NOT NULL DEFAULT 0 CHECK (bbq_meat_set_count >= 0),
  bbq_full_set_count INTEGER NOT NULL DEFAULT 0 CHECK (bbq_full_set_count >= 0),
  
  -- 🍳 식사 옵션
  meal_breakfast_count INTEGER NOT NULL DEFAULT 0 CHECK (meal_breakfast_count >= 0),
  
  -- 🚌 교통 옵션
  transport_needs_bus BOOLEAN NOT NULL DEFAULT false,
  
  -- 🚜 체험 프로그램 옵션
  experience_farm_count INTEGER NOT NULL DEFAULT 0 CHECK (experience_farm_count >= 0),
  
  -- 🧺 기타 부가 서비스
  extra_laundry_count INTEGER NOT NULL DEFAULT 0 CHECK (extra_laundry_count >= 0),
  
  -- 🏷️ 프로그램 정보 (URL 파라미터에서 수집)
  program_type TEXT,
  program_id TEXT,
  program_name TEXT,
  
  -- 💰 가격 정보 (랜딩페이지에서 실시간 계산)
  base_price INTEGER NOT NULL DEFAULT 150000 CHECK (base_price >= 0), -- 기본 객실 가격
  grill_price INTEGER NOT NULL DEFAULT 30000 CHECK (grill_price >= 0), -- BBQ 그릴 대여 가격
  room_price INTEGER NOT NULL CHECK (room_price >= 0), -- 최종 객실 요금
  program_price INTEGER NOT NULL DEFAULT 0 CHECK (program_price >= 0), -- 프로그램 요금
  total_price INTEGER NOT NULL CHECK (total_price >= 0), -- 총 결제 금액
  
  -- 📋 상태 관리
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed', 'refunded', 'failed')),
  
  -- 📝 추가 정보
  special_requests TEXT, -- 특별 요청사항
  referrer TEXT DEFAULT 'website', -- 유입 경로 ('website', 'social', 'ad', etc.)
  
  -- ⏰ 시간 정보
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- ✅ 제약 조건
  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT valid_total_price CHECK (total_price = room_price + program_price),
  CONSTRAINT valid_bbq_logic CHECK (
    (bbq_meat_set_count > 0 OR bbq_full_set_count > 0) = (bbq_grill_count > 0)
  ), -- BBQ 세트가 있으면 그릴도 있어야 함
  CONSTRAINT valid_breakfast_count CHECK (meal_breakfast_count <= total_guests) -- 조식 인원은 총 인원을 초과할 수 없음
);

-- =============================================
-- 3. 결제 테이블
-- =============================================

CREATE TABLE IF NOT EXISTS payments (
  -- 🔑 기본 식별자
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  
  -- 💳 결제 정보
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'kakao_pay', 'naver_pay', 'toss_pay', 'paypal')),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  
  -- 📊 결제 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  
  -- 🏢 결제 게이트웨이 정보
  payment_gateway TEXT CHECK (payment_gateway IN ('iamport', 'toss', 'kakao', 'naver', 'stripe', 'paypal')),
  transaction_id TEXT UNIQUE,
  gateway_response JSONB,
  
  -- 💸 환불 정보
  refund_amount INTEGER DEFAULT 0 CHECK (refund_amount >= 0),
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- ⏰ 시간 정보
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- ✅ 제약 조건
  CONSTRAINT valid_refund_amount CHECK (refund_amount <= amount)
);

-- =============================================
-- 4. 객실 정보 테이블 (랜딩페이지에서 선택)
-- =============================================

CREATE TABLE IF NOT EXISTS rooms (
  -- 🔑 기본 식별자
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 🏠 객실 정보
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('standard', 'deluxe', 'suite', 'family')),
  description TEXT,
  
  -- 💰 가격 정보
  base_price INTEGER NOT NULL CHECK (base_price >= 0),
  weekend_price INTEGER CHECK (weekend_price >= base_price),
  holiday_price INTEGER CHECK (holiday_price >= base_price),
  
  -- 👥 수용 정보
  max_guests INTEGER NOT NULL CHECK (max_guests > 0),
  max_adults INTEGER NOT NULL CHECK (max_adults > 0),
  max_children INTEGER NOT NULL DEFAULT 0,
  
  -- 🏠 시설 정보
  amenities JSONB DEFAULT '[]'::jsonb, -- ["wifi", "tv", "kitchen", "parking"]
  images JSONB DEFAULT '[]'::jsonb, -- 이미지 URL 배열
  
  -- 📊 상태 정보
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- ⏰ 시간 정보
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- 5. 프로그램 테이블 (랜딩페이지에서 선택)
-- =============================================

CREATE TABLE IF NOT EXISTS programs (
  -- 🔑 기본 식별자
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 🎯 프로그램 정보
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('bbq', 'meal', 'experience', 'transport', 'extra')),
  
  -- 💰 가격 정보
  price INTEGER NOT NULL CHECK (price >= 0),
  unit TEXT NOT NULL CHECK (unit IN ('per_person', 'per_group', 'fixed', 'per_set')),
  
  -- 👥 참여 정보
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER,
  
  -- ⏱️ 운영 정보
  duration_minutes INTEGER,
  available_times JSONB DEFAULT '[]'::jsonb, -- ["09:00", "14:00", "18:00"]
  operating_days JSONB DEFAULT '["mon","tue","wed","thu","fri","sat","sun"]'::jsonb,
  
  -- 📝 추가 정보
  requirements TEXT, -- 참여 조건/준비물 등
  images JSONB DEFAULT '[]'::jsonb,
  
  -- 📊 상태 정보
  is_available BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER DEFAULT 0, -- 재고 (그릴 등)
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- ⏰ 시간 정보
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- 6. 예약-프로그램 연결 테이블 (N:M 관계)
-- =============================================

CREATE TABLE IF NOT EXISTS reservation_programs (
  -- 🔑 기본 식별자
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- 📊 수량/가격 정보
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  
  -- ⏰ 스케줄 정보
  scheduled_date DATE,
  scheduled_time TIME,
  
  -- 📝 추가 정보
  notes TEXT,
  
  -- ⏰ 시간 정보
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- ✅ 제약 조건
  CONSTRAINT valid_program_total CHECK (total_price = quantity * unit_price),
  UNIQUE(reservation_id, program_id, scheduled_date, scheduled_time)
);

-- =============================================
-- 7. 쿠폰 테이블 (미래 확장용)
-- =============================================

CREATE TABLE IF NOT EXISTS coupons (
  -- 🔑 기본 식별자
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 🎫 쿠폰 정보
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- 💰 할인 정보
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER,
  
  -- 📊 사용 제한
  usage_limit INTEGER, -- NULL이면 무제한
  used_count INTEGER NOT NULL DEFAULT 0,
  
  -- 📅 유효 기간
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  
  -- 📊 상태 정보
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- ⏰ 시간 정보
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- ✅ 제약 조건
  CONSTRAINT valid_usage_count CHECK (used_count <= COALESCE(usage_limit, used_count)),
  CONSTRAINT valid_date_range CHECK (valid_until >= valid_from)
);

-- =============================================
-- 8. 쿠폰 사용 이력 테이블
-- =============================================

CREATE TABLE IF NOT EXISTS coupon_usages (
  -- 🔑 기본 식별자
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  
  -- 💰 할인 정보
  discount_amount INTEGER NOT NULL CHECK (discount_amount >= 0),
  
  -- ⏰ 시간 정보
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- ✅ 제약 조건
  UNIQUE(coupon_id, reservation_id)
);

-- =============================================
-- 9. 시스템 로그 테이블 (운영 관리용)
-- =============================================

CREATE TABLE IF NOT EXISTS reservation_logs (
  -- 🔑 기본 식별자
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  
  -- 📋 로그 정보
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'confirmed', 'cancelled', 'payment_completed', 'refunded')),
  description TEXT,
  
  -- 👤 사용자 정보
  user_id UUID, -- 작업을 수행한 사용자 (관리자 등)
  user_type TEXT CHECK (user_type IN ('customer', 'admin', 'system')),
  
  -- 📊 변경 내용
  old_data JSONB,
  new_data JSONB,
  
  -- 🌐 요청 정보
  ip_address INET,
  user_agent TEXT,
  
  -- ⏰ 시간 정보
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- 10. 인덱스 생성 (성능 최적화)
-- =============================================

-- 예약 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_number ON reservations(reservation_number);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email ON reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_phone ON reservations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_payment_status ON reservations(payment_status);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_program_type ON reservations(program_type);

-- 결제 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- 객실 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_is_available ON rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_rooms_sort_order ON rooms(sort_order);

-- 프로그램 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_is_available ON programs(is_available);
CREATE INDEX IF NOT EXISTS idx_programs_sort_order ON programs(sort_order);

-- 쿠폰 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

-- 로그 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_reservation_logs_reservation_id ON reservation_logs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_logs_action ON reservation_logs(action);
CREATE INDEX IF NOT EXISTS idx_reservation_logs_created_at ON reservation_logs(created_at);

-- =============================================
-- 11. 트리거 함수 생성
-- =============================================

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 예약 로그 자동 생성 함수
CREATE OR REPLACE FUNCTION log_reservation_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO reservation_logs (reservation_id, action, description, new_data)
    VALUES (NEW.id, 'created', '새 예약이 생성되었습니다.', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- 상태 변경 감지
    IF OLD.status != NEW.status THEN
      INSERT INTO reservation_logs (reservation_id, action, description, old_data, new_data)
      VALUES (NEW.id, 
              CASE NEW.status 
                WHEN 'confirmed' THEN 'confirmed'
                WHEN 'cancelled' THEN 'cancelled'
                ELSE 'updated'
              END,
              '예약 상태가 ' || OLD.status || '에서 ' || NEW.status || '로 변경되었습니다.',
              to_jsonb(OLD), 
              to_jsonb(NEW));
    END IF;
    
    -- 결제 상태 변경 감지
    IF OLD.payment_status != NEW.payment_status THEN
      INSERT INTO reservation_logs (reservation_id, action, description, old_data, new_data)
      VALUES (NEW.id, 'payment_' || NEW.payment_status,
              '결제 상태가 ' || OLD.payment_status || '에서 ' || NEW.payment_status || '로 변경되었습니다.',
              to_jsonb(OLD), 
              to_jsonb(NEW));
    END IF;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 12. 트리거 적용
-- =============================================

-- 업데이트 시간 자동 갱신 트리거
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 예약 로그 자동 생성 트리거
DROP TRIGGER IF EXISTS log_reservation_changes_trigger ON reservations;
CREATE TRIGGER log_reservation_changes_trigger
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION log_reservation_changes();

-- =============================================
-- 13. 유틸리티 함수들
-- =============================================

-- 예약 가능 여부 확인 함수
CREATE OR REPLACE FUNCTION check_room_availability(
  room_id_param UUID,
  check_in_param DATE,
  check_out_param DATE,
  exclude_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM reservations r
    JOIN rooms rm ON rm.id = room_id_param
    WHERE r.status IN ('confirmed', 'pending')
    AND (exclude_reservation_id IS NULL OR r.id != exclude_reservation_id)
    AND (
      -- 겹치는 날짜 확인
      (check_in_param >= r.check_in_date AND check_in_param < r.check_out_date) OR
      (check_out_param > r.check_in_date AND check_out_param <= r.check_out_date) OR
      (check_in_param <= r.check_in_date AND check_out_param >= r.check_out_date)
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 예약 총 가격 계산 함수
CREATE OR REPLACE FUNCTION calculate_reservation_total(
  reservation_id_param UUID
)
RETURNS INTEGER AS $$
DECLARE
  total_amount INTEGER := 0;
  program_total INTEGER := 0;
BEGIN
  -- 기본 예약 가격
  SELECT 
    r.room_price + 
    COALESCE(
      (r.bbq_grill_count * r.grill_price) +
      (r.meal_breakfast_count * 10000) + -- 조식 1만원/인
      (CASE WHEN r.transport_needs_bus THEN 20000 ELSE 0 END) + -- 버스 2만원
      (r.experience_farm_count * 15000) + -- 농장체험 1.5만원/인
      (r.extra_laundry_count * 5000), -- 세탁 5천원/회
      0
    )
  INTO total_amount
  FROM reservations r
  WHERE r.id = reservation_id_param;
  
  -- 추가 프로그램 가격
  SELECT COALESCE(SUM(rp.total_price), 0)
  INTO program_total
  FROM reservation_programs rp
  WHERE rp.reservation_id = reservation_id_param;
  
  RETURN total_amount + program_total;
END;
$$ LANGUAGE plpgsql;

-- 예약 번호 생성 함수 (커스텀)
CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  day_part TEXT;
  sequence_part TEXT;
  random_part TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  day_part := LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0');
  random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  RETURN 'RES-' || year_part || '-' || day_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 14. 기본 데이터 삽입
-- =============================================

-- 기본 객실 정보 삽입
INSERT INTO rooms (name, type, base_price, max_guests, max_adults, max_children, amenities, is_available, sort_order) VALUES
('스탠다드룸', 'standard', 150000, 4, 2, 2, '["wifi", "tv", "parking", "kitchen"]', true, 1),
('디럭스룸', 'deluxe', 200000, 6, 4, 2, '["wifi", "tv", "parking", "kitchen", "balcony"]', true, 2),
('패밀리룸', 'family', 250000, 8, 6, 2, '["wifi", "tv", "parking", "kitchen", "balcony", "living_room"]', true, 3),
('스위트룸', 'suite', 300000, 6, 4, 2, '["wifi", "tv", "parking", "kitchen", "balcony", "living_room", "jacuzzi"]', true, 4)
ON CONFLICT DO NOTHING;

-- 기본 프로그램 정보 삽입
INSERT INTO programs (name, description, category, price, unit, max_participants, duration_minutes, is_available, sort_order) VALUES
('BBQ 그릴 대여', '바베큐용 그릴 대여 서비스', 'bbq', 30000, 'per_set', 20, 180, true, 1),
('고기 세트', '바베큐용 고기 세트 (2-3인분)', 'bbq', 50000, 'per_set', 6, 0, true, 2),
('BBQ 풀세트', '그릴 + 고기 + 야채 + 도구 전체 세트', 'bbq', 80000, 'per_set', 8, 180, true, 3),
('조식 서비스', '한식 조식 제공', 'meal', 10000, 'per_person', 20, 60, true, 4),
('셔틀버스', '터미널/역 픽업 서비스', 'transport', 20000, 'per_group', 8, 60, true, 5),
('농장 체험', '계절별 농장 체험 프로그램', 'experience', 15000, 'per_person', 15, 120, true, 6),
('세탁 서비스', '의류 세탁 서비스', 'extra', 5000, 'per_set', 50, 0, true, 7)
ON CONFLICT DO NOTHING;

-- 기본 쿠폰 정보 삽입 (예시)
INSERT INTO coupons (code, name, description, discount_type, discount_value, min_order_amount, valid_from, valid_until, is_active) VALUES
('WELCOME10', '신규 고객 10% 할인', '첫 예약 고객 대상 10% 할인 쿠폰', 'percentage', 10, 100000, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true),
('FAMILY20', '가족 여행 2만원 할인', '4인 이상 예약 시 2만원 할인', 'fixed_amount', 20000, 200000, CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', true),
('WEEKEND15', '주말 예약 15% 할인', '금-토 예약 시 15% 할인', 'percentage', 15, 150000, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 15. 권한 설정 (Supabase RLS 호환)
-- =============================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_logs ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (객실, 프로그램)
CREATE POLICY "Anyone can view available rooms" ON rooms
  FOR SELECT USING (is_available = true);

CREATE POLICY "Anyone can view available programs" ON programs
  FOR SELECT USING (is_available = true);

CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (is_active = true AND valid_from <= CURRENT_DATE AND valid_until >= CURRENT_DATE);

-- 예약 생성 정책 (누구나 예약 가능)
CREATE POLICY "Anyone can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- 관리자 전체 접근 정책
CREATE POLICY "Admins can manage all data" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- 결제 정책 (관리자만 관리)
CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 🎉 완료 메시지
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🎉 달팽이 아지트 펜션 예약 시스템 DDL 생성 완료!';
  RAISE NOTICE '📋 생성된 테이블: reservations, payments, rooms, programs, reservation_programs, coupons, coupon_usages, reservation_logs';
  RAISE NOTICE '⚡ 생성된 인덱스: 성능 최적화를 위한 주요 필드 인덱스';
  RAISE NOTICE '🔒 생성된 정책: RLS 보안 정책';
  RAISE NOTICE '🚀 생성된 함수: 예약 가능성 확인, 가격 계산, 로그 관리';
  RAISE NOTICE '📝 기본 데이터: 4개 객실, 7개 프로그램, 3개 쿠폰 샘플';
  RAISE NOTICE '';
  RAISE NOTICE '✅ 다음 단계:';
  RAISE NOTICE '1. Supabase에서 이 DDL 실행';
  RAISE NOTICE '2. API 엔드포인트 연결 테스트';
  RAISE NOTICE '3. 랜딩페이지 예약 폼 연동 확인';
END $$; 