-- =============================================
-- 🏠 달팽이 아지트 펜션 - 간단하고 안전한 랜딩페이지 DDL
-- =============================================
-- 📝 Supabase에서 안전하게 실행되는 버전
-- 📅 작성일: 2024년 1월
-- ⚠️  RLS, 복잡한 트리거, 권한 문제 등을 제거한 실용적 버전

-- =============================================
-- 1. 기본 확장 (Supabase 기본 제공만)
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. 핵심 테이블 생성
-- =============================================

-- 2.1 프로그램 카테고리
CREATE TABLE IF NOT EXISTS program_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_code TEXT UNIQUE NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 공간/객실 정보
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_code TEXT UNIQUE NOT NULL,
  space_name TEXT NOT NULL,
  space_type TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  capacity_min INTEGER NOT NULL DEFAULT 1,
  capacity_max INTEGER NOT NULL DEFAULT 4,
  base_price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 프로그램 테이블
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_code TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES program_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  duration_hours INTEGER,
  price INTEGER NOT NULL,
  discount_price INTEGER DEFAULT 0,
  min_participants INTEGER NOT NULL DEFAULT 1,
  max_participants INTEGER DEFAULT 20,
  image_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  availability_status TEXT DEFAULT 'available',
  
  -- 프로그램 상세 정보
  schedule JSONB DEFAULT '[]'::jsonb,
  includes JSONB DEFAULT '[]'::jsonb,
  excludes JSONB DEFAULT '[]'::jsonb,
  notices JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 부가 서비스
CREATE TABLE IF NOT EXISTS additional_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_code TEXT UNIQUE NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL,
  description TEXT,
  unit_name TEXT NOT NULL DEFAULT '개',
  unit_price INTEGER NOT NULL,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  max_quantity INTEGER DEFAULT 999,
  is_required BOOLEAN NOT NULL DEFAULT false,
  
  -- 가격 정보
  price_per_person INTEGER DEFAULT 0,
  price_per_set INTEGER DEFAULT 0,
  set_size INTEGER DEFAULT 1,
  
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 고객 정보
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- 추가 정보
  birth_date DATE,
  gender TEXT,
  address_full TEXT,
  
  -- 선호도
  preferred_contact_method TEXT DEFAULT 'phone',
  allergies TEXT,
  special_needs TEXT,
  memo TEXT,
  
  -- 마케팅 정보
  referral_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- 통계 정보
  total_reservations INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  last_visit_date TIMESTAMP WITH TIME ZONE,
  customer_grade TEXT DEFAULT 'bronze',
  
  -- 개인정보 보호
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 예약 메인 테이블
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 예약 번호
  reservation_number TEXT UNIQUE NOT NULL,
  
  -- 고객 정보
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- 예약 기간
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INTEGER,
  
  -- 인원 정보
  adults INTEGER NOT NULL DEFAULT 2,
  children INTEGER NOT NULL DEFAULT 0,
  infants INTEGER NOT NULL DEFAULT 0,
  total_guests INTEGER,
  
  -- 프로그램 정보
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  program_name TEXT,
  program_price INTEGER NOT NULL DEFAULT 0,
  
  -- 공간 정보
  primary_space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  selected_spaces JSONB DEFAULT '[]'::jsonb,
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  
  -- 요청사항
  special_requests TEXT,
  internal_memo TEXT,
  
  -- 예약 경로
  booking_source TEXT NOT NULL DEFAULT 'landing_page',
  referrer_url TEXT,
  
  -- 가격 정보
  base_price INTEGER NOT NULL DEFAULT 0,
  service_price INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL DEFAULT 0,
  
  -- 확인 정보
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by TEXT,
  
  -- 실제 체크인/아웃
  actual_check_in TIMESTAMP WITH TIME ZONE,
  actual_check_out TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 예약-서비스 연결
CREATE TABLE IF NOT EXISTS reservation_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES additional_services(id) ON DELETE RESTRICT,
  
  -- 수량 및 가격
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  
  -- 서비스 정보
  service_date DATE,
  service_time TIME,
  special_instructions TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.8 결제 정보
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  
  -- 결제 기본 정보
  payment_number TEXT UNIQUE NOT NULL,
  payment_method TEXT NOT NULL,
  payment_gateway TEXT,
  
  -- 금액
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KRW',
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- 외부 결제 정보
  external_payment_id TEXT,
  external_transaction_id TEXT,
  
  -- 카드 정보
  card_company TEXT,
  card_number_masked TEXT,
  installment_months INTEGER DEFAULT 0,
  
  -- 시간 정보
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_amount INTEGER DEFAULT 0,
  refund_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.9 쿠폰
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 쿠폰 정보
  coupon_code TEXT UNIQUE NOT NULL,
  coupon_name TEXT NOT NULL,
  description TEXT,
  
  -- 할인 정보
  discount_type TEXT NOT NULL, -- 'fixed' 또는 'percentage'
  discount_value INTEGER NOT NULL,
  max_discount_amount INTEGER,
  min_order_amount INTEGER DEFAULT 0,
  
  -- 사용 조건
  usage_limit INTEGER,
  per_user_limit INTEGER DEFAULT 1,
  usage_count INTEGER NOT NULL DEFAULT 0,
  
  -- 기간
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- 적용 조건
  applicable_programs JSONB DEFAULT '[]'::jsonb,
  applicable_categories JSONB DEFAULT '[]'::jsonb,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.10 쿠폰 사용 이력
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- 할인 정보
  discount_amount INTEGER NOT NULL,
  original_amount INTEGER NOT NULL,
  final_amount INTEGER NOT NULL,
  
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.11 고객 후기
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  
  -- 후기 내용
  title TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL,
  
  -- 세부 평점
  cleanliness_rating INTEGER,
  service_rating INTEGER,
  location_rating INTEGER,
  value_rating INTEGER,
  
  -- 추천 여부
  would_recommend BOOLEAN,
  
  -- 이미지
  images JSONB DEFAULT '[]'::jsonb,
  
  -- 관리자 응답
  admin_reply TEXT,
  admin_reply_at TIMESTAMP WITH TIME ZONE,
  
  -- 상태
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  
  -- 도움 정보
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.12 FAQ
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- FAQ 내용
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  -- 키워드
  keywords JSONB DEFAULT '[]'::jsonb,
  
  -- 표시 설정
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- 통계
  view_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.13 스토리/블로그
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 스토리 정보
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- 분류
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- 이미지
  featured_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  
  -- SEO
  slug TEXT UNIQUE,
  seo_title TEXT,
  seo_description TEXT,
  
  -- 관련 정보
  related_program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT '달팽이 아지트',
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  -- 통계
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  
  -- 시간
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.14 알림 템플릿
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 템플릿 정보
  template_code TEXT UNIQUE NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,
  
  -- 발송 채널
  channel TEXT NOT NULL,
  
  -- 메시지 내용
  subject TEXT,
  message_template TEXT NOT NULL,
  
  -- 발송 조건
  trigger_event TEXT NOT NULL,
  send_delay_minutes INTEGER DEFAULT 0,
  
  -- 설정
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_required BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.15 알림 발송 이력
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 수신자
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  recipient_phone TEXT,
  recipient_email TEXT,
  
  -- 알림 정보
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  
  -- 관련 정보
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  
  -- 발송 상태
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- 외부 서비스
  external_message_id TEXT,
  failure_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.16 고객 활동 로그
CREATE TABLE IF NOT EXISTS customer_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 세션 정보
  session_id TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- 활동 정보
  activity_type TEXT NOT NULL,
  page_url TEXT,
  element_id TEXT,
  
  -- 상세 데이터
  activity_data JSONB DEFAULT '{}'::jsonb,
  
  -- 기술 정보
  user_agent TEXT,
  ip_address INET,
  referer_url TEXT,
  
  -- UTM 정보
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.17 시스템 로그
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 로그 정보
  log_level TEXT NOT NULL,
  log_category TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- 관련 정보
  user_id UUID,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  
  -- 기술 정보
  request_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- 상세 데이터
  metadata JSONB DEFAULT '{}'::jsonb,
  error_stack TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.18 사이트 설정
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 설정 정보
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT NOT NULL,
  
  -- 설명
  display_name TEXT,
  description TEXT,
  category TEXT,
  
  -- 제약사항
  is_required BOOLEAN NOT NULL DEFAULT false,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.19 관리자 계정
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 계정 정보
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  
  -- 개인 정보
  full_name TEXT NOT NULL,
  phone TEXT,
  
  -- 권한
  role TEXT NOT NULL DEFAULT 'staff',
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- 상태
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. 기본 인덱스 생성
-- =============================================

-- 예약 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_program ON reservations(program_id);

-- 고객 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(customer_phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(customer_email);

-- 프로그램 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category_id);
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active);

-- 후기 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_reviews_program ON reviews(program_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- 결제 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_reservation ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =============================================
-- 4. 간단한 트리거 함수
-- =============================================

-- 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 예약 번호 자동 생성
CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reservation_number IS NULL OR NEW.reservation_number = '' THEN
        NEW.reservation_number := 'RES-' || TO_CHAR(NOW(), 'YYYY') || '-' || TO_CHAR(NOW(), 'DDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 결제 번호 자동 생성
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        NEW.payment_number := 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 계산 필드 자동 업데이트
CREATE OR REPLACE FUNCTION update_calculated_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- 예약 일수 계산
    IF NEW.check_out_date IS NOT NULL AND NEW.check_in_date IS NOT NULL THEN
        NEW.nights := NEW.check_out_date - NEW.check_in_date;
    END IF;
    
    -- 총 인원 계산
    NEW.total_guests := COALESCE(NEW.adults, 0) + COALESCE(NEW.children, 0) + COALESCE(NEW.infants, 0);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- 5. 트리거 적용
-- =============================================

-- 업데이트 시간 트리거
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 예약 번호 생성 트리거
CREATE TRIGGER generate_reservation_number_trigger BEFORE INSERT ON reservations FOR EACH ROW EXECUTE FUNCTION generate_reservation_number();

-- 결제 번호 생성 트리거
CREATE TRIGGER generate_payment_number_trigger BEFORE INSERT ON payments FOR EACH ROW EXECUTE FUNCTION generate_payment_number();

-- 계산 필드 트리거
CREATE TRIGGER update_reservation_calculated_fields BEFORE INSERT OR UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_calculated_fields();

-- =============================================
-- 6. 기본 데이터 삽입
-- =============================================

-- 프로그램 카테고리
INSERT INTO program_categories (category_code, category_name, description, display_order) VALUES
('pension', '펜션', '편안한 숙박을 위한 펜션 프로그램', 1),
('healing', '힐링', '마음과 몸의 치유를 위한 힐링 프로그램', 2),
('education', '교육', '학습과 성장을 위한 교육 프로그램', 3),
('family', '가족', '가족과 함께하는 특별한 프로그램', 4),
('health', '건강', '건강한 삶을 위한 웰니스 프로그램', 5)
ON CONFLICT (category_code) DO NOTHING;

-- 공간 정보
INSERT INTO spaces (space_code, space_name, space_type, subtitle, capacity_min, capacity_max, base_price, display_order) VALUES
('room1', '방 1', 'bedroom', '아늑한 휴식 공간', 1, 3, 150000, 1),
('room2', '방 2', 'bedroom', '편안한 휴식 공간', 1, 3, 150000, 2),
('living', '거실', 'living', '편안한 휴식과 대화의 공간', 1, 15, 0, 3),
('kitchen', '부엌', 'kitchen', '요리와 식사를 위한 공간', 1, 15, 0, 4)
ON CONFLICT (space_code) DO NOTHING;

-- 부가 서비스
INSERT INTO additional_services (service_code, service_name, service_category, unit_name, unit_price, description, price_per_set, set_size, display_order) VALUES
('bbq_grill', 'BBQ 그릴 대여', 'bbq', '개', 30000, '바베큐 그릴 1개당 30,000원', 30000, 1, 1),
('meat_set', '고기만 세트', 'bbq', '세트', 50000, '5인 기준 고기만 세트', 50000, 5, 2),
('full_bbq_set', '고기+식사 세트', 'bbq', '세트', 70000, '5인 기준 고기+식사 풀세트', 70000, 5, 3),
('breakfast_set', '보리밥 정식', 'meal', '세트', 50000, '5인 기준 보리밥 정식', 50000, 5, 4),
('bus_charter', '버스 대절', 'transport', '회', 100000, '버스 대절 서비스', 100000, 1, 5),
('woodwork_experience', '목공 체험', 'experience', '명', 30000, '목공 체험 프로그램 1인당', 30000, 1, 6)
ON CONFLICT (service_code) DO NOTHING;

-- FAQ 기본 데이터
INSERT INTO faqs (category, question, answer, is_featured, display_order) VALUES
('reservation', '체크인/체크아웃 시간은 언제인가요?', '체크인은 오후 3시부터, 체크아웃은 오전 11시까지입니다.', true, 1),
('reservation', '예약 취소는 언제까지 가능한가요?', '체크인 14일 전까지 100% 환불이 가능합니다!', true, 2),
('program', '프로그램은 어떻게 신청하나요?', '예약 시 원하시는 프로그램을 선택하실 수 있습니다!', true, 3),
('facility', '주차는 가능한가요?', '네, 무료 주차가 가능합니다. 주차는 100m위에 파란 창고 앞쪽에 넓은 공터에도 주차가능합니다.', true, 4);

-- 사이트 설정
INSERT INTO site_settings (setting_key, setting_value, setting_type, display_name, category) VALUES
('site_name', '달팽이 아지트 펜션', 'string', '사이트명', 'general'),
('max_booking_days', '365', 'number', '최대 예약 가능 일수', 'booking'),
('min_booking_days', '1', 'number', '최소 예약 일수', 'booking'),
('default_language', 'ko', 'string', '기본 언어', 'general'),
('enable_notifications', 'true', 'boolean', '알림 활성화', 'notification')
ON CONFLICT (setting_key) DO NOTHING;

-- 알림 템플릿
INSERT INTO notification_templates (template_code, template_name, channel, subject, message_template, trigger_event) VALUES
('reservation_confirmed', '예약 확정 알림', 'sms', '예약 확정', '[달팽이 아지트] 예약이 확정되었습니다. 예약번호: {{reservation_number}}', 'reservation_confirmed'),
('payment_completed', '결제 완료 알림', 'sms', '결제 완료', '[달팽이 아지트] 결제가 완료되었습니다. 금액: {{amount}}원', 'payment_completed'),
('checkin_reminder', '체크인 안내', 'sms', '체크인 안내', '[달팽이 아지트] 내일이 체크인 날입니다. 체크인 시간: 15:00', 'checkin_reminder')
ON CONFLICT (template_code) DO NOTHING;

-- =============================================
-- 7. 완료 확인
-- =============================================

-- 테이블 생성 확인
SELECT 
  '🎉 DDL 실행 완료: ' || COUNT(*) || '개 테이블 생성됨' as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'customers', 'reservations', 'programs', 'program_categories', 
  'spaces', 'additional_services', 'reservation_services',
  'payments', 'coupons', 'coupon_usages', 'reviews', 'faqs', 
  'stories', 'notifications', 'notification_templates',
  'customer_activities', 'system_logs', 'site_settings', 'admin_users'
);

-- 기본 데이터 확인
SELECT 
  '✅ 기본 데이터 삽입 완료' as message,
  'Categories: ' || (SELECT COUNT(*) FROM program_categories) || ', ' ||
  'Spaces: ' || (SELECT COUNT(*) FROM spaces) || ', ' ||
  'Services: ' || (SELECT COUNT(*) FROM additional_services) || ', ' ||
  'FAQs: ' || (SELECT COUNT(*) FROM faqs) as counts; 