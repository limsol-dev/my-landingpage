-- =============================================
-- 🏠 달팽이 아지트 펜션 - 완전한 랜딩페이지 데이터베이스 DDL
-- =============================================
-- 📝 랜딩페이지의 모든 섹션과 기능을 반영한 완전한 데이터베이스 스키마
-- 📅 작성일: 2024년 1월
-- 🎯 포함 범위: 예약, 프로그램, 고객관리, 후기, FAQ, 알림, 분석 등 모든 기능

-- =============================================
-- 1. 기본 설정 및 확장
-- =============================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 암호화 확장 (개인정보 보호용)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- 전체 텍스트 검색 확장
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- 2. 기본 참조 테이블들
-- =============================================

-- 2.1 객실/공간 정보 테이블
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_code TEXT UNIQUE NOT NULL, -- 'room1', 'room2', 'living', 'kitchen'
  space_name TEXT NOT NULL, -- '방 1', '방 2', '거실', '부엌'
  space_type TEXT NOT NULL CHECK (space_type IN ('bedroom', 'living', 'kitchen', 'bathroom', 'outdoor')),
  subtitle TEXT, -- '아늑한 휴식 공간'
  description TEXT,
  capacity_min INTEGER NOT NULL DEFAULT 1,
  capacity_max INTEGER NOT NULL DEFAULT 4,
  base_price INTEGER NOT NULL DEFAULT 0, -- 기본 이용 요금
  hourly_price INTEGER DEFAULT 0, -- 시간당 요금
  image_url TEXT,
  amenities JSONB DEFAULT '[]'::jsonb, -- 시설 정보 JSON 배열
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 프로그램 카테고리 테이블
CREATE TABLE IF NOT EXISTS program_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_code TEXT UNIQUE NOT NULL, -- 'pension', 'healing', 'education', 'family', 'health'
  category_name TEXT NOT NULL, -- '펜션', '힐링', '교육', '가족', '건강'
  description TEXT,
  icon_name TEXT, -- Lucide 아이콘 이름
  color_code TEXT DEFAULT '#2F513F', -- 테마 색상
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 프로그램 메인 테이블
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_code TEXT UNIQUE NOT NULL, -- 'healing-camp', 'digital-detox' 등
  category_id UUID REFERENCES program_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  duration TEXT NOT NULL, -- '8시간', '1박 2일', '2박 3일'
  duration_hours INTEGER, -- 시간 단위로 계산된 값
  price INTEGER NOT NULL, -- 기본 가격
  discount_price INTEGER DEFAULT 0, -- 할인 가격
  min_participants INTEGER NOT NULL DEFAULT 1,
  max_participants INTEGER DEFAULT 20,
  image_url TEXT,
  thumbnail_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb, -- 태그 배열
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'soldout', 'suspended')),
  
  -- 프로그램 상세 정보 (JSONB)
  schedule JSONB DEFAULT '[]'::jsonb, -- 일정 배열
  includes JSONB DEFAULT '[]'::jsonb, -- 포함 사항 배열
  excludes JSONB DEFAULT '[]'::jsonb, -- 불포함 사항 배열
  notices JSONB DEFAULT '[]'::jsonb, -- 주의사항 배열
  requirements JSONB DEFAULT '[]'::jsonb, -- 준비물 배열
  
  -- SEO 및 메타데이터
  seo_title TEXT,
  seo_description TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 부가 서비스 테이블
CREATE TABLE IF NOT EXISTS additional_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_code TEXT UNIQUE NOT NULL, -- 'bbq_grill', 'meat_set', 'breakfast' 등
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL CHECK (service_category IN ('bbq', 'meal', 'transport', 'experience', 'accommodation', 'other')),
  description TEXT,
  unit_name TEXT NOT NULL DEFAULT '개', -- '개', '인분', '세트', '회'
  unit_price INTEGER NOT NULL,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  max_quantity INTEGER DEFAULT 999,
  is_required BOOLEAN NOT NULL DEFAULT false, -- 필수 선택 여부
  dependency_service_code TEXT, -- 의존 서비스 (예: 고기세트는 그릴이 있어야 함)
  
  -- 가격 정보
  price_per_person INTEGER DEFAULT 0, -- 1인당 가격
  price_per_set INTEGER DEFAULT 0, -- 세트당 가격 (5인 기준 등)
  set_size INTEGER DEFAULT 1, -- 세트 구성 인원
  
  -- 표시 정보
  icon_name TEXT,
  image_url TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. 고객 및 예약 관련 테이블
-- =============================================

-- 3.1 고객 정보 테이블
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 기본 정보
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- 추가 정보
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address_full TEXT,
  address_city TEXT,
  address_district TEXT,
  
  -- 선호도 및 메모
  preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'sms', 'kakao')),
  allergies TEXT,
  dietary_restrictions TEXT,
  special_needs TEXT,
  memo TEXT,
  
  -- 마케팅 정보
  referral_source TEXT, -- '검색', '추천', '광고', '재방문' 등
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- 통계 정보
  total_reservations INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  last_visit_date TIMESTAMP WITH TIME ZONE,
  customer_grade TEXT DEFAULT 'bronze' CHECK (customer_grade IN ('bronze', 'silver', 'gold', 'vip')),
  
  -- 개인정보 보호
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  data_retention_consent BOOLEAN NOT NULL DEFAULT false,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 예약 메인 테이블
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 예약 식별자
  reservation_number TEXT UNIQUE NOT NULL DEFAULT ('RES-' || TO_CHAR(NOW(), 'YYYY') || '-' || TO_CHAR(NOW(), 'DDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  
  -- 고객 정보 (고객 테이블과 연결 + 중복 저장)
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- 예약 기간 정보
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INTEGER GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  
  -- 인원 정보
  adults INTEGER NOT NULL DEFAULT 2 CHECK (adults > 0),
  children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
  infants INTEGER NOT NULL DEFAULT 0 CHECK (infants >= 0),
  total_guests INTEGER GENERATED ALWAYS AS (adults + children + infants) STORED,
  
  -- 프로그램 정보
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  program_name TEXT, -- 예약 시점의 프로그램명 (변경 대응)
  program_price INTEGER NOT NULL DEFAULT 0,
  
  -- 객실/공간 정보
  primary_space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  selected_spaces JSONB DEFAULT '[]'::jsonb, -- 선택된 모든 공간 ID 배열
  
  -- 예약 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed', 'cancelled', 'refunded')),
  
  -- 특별 요청사항
  special_requests TEXT,
  internal_memo TEXT, -- 관리자 전용 메모
  
  -- 예약 경로 추적
  booking_source TEXT NOT NULL DEFAULT 'landing_page' CHECK (booking_source IN ('landing_page', 'phone', 'walk_in', 'partner', 'admin')),
  referrer_url TEXT,
  user_agent TEXT,
  
  -- 가격 정보
  base_price INTEGER NOT NULL DEFAULT 0,
  service_price INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL DEFAULT 0,
  
  -- 확인 정보
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by TEXT, -- 확인 처리자
  
  -- 체크인/아웃 실제 시간
  actual_check_in TIMESTAMP WITH TIME ZONE,
  actual_check_out TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 예약-부가서비스 연결 테이블
CREATE TABLE IF NOT EXISTS reservation_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES additional_services(id) ON DELETE RESTRICT,
  
  -- 수량 및 가격 정보
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit_price INTEGER NOT NULL, -- 예약 시점의 단가
  total_price INTEGER NOT NULL, -- quantity * unit_price
  
  -- 서비스별 추가 정보
  service_date DATE, -- 서비스 제공 날짜
  service_time TIME, -- 서비스 제공 시간
  special_instructions TEXT, -- 서비스별 특별 지시사항
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. 결제 및 정산 테이블
-- =============================================

-- 4.1 결제 정보 테이블
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  
  -- 결제 기본 정보
  payment_number TEXT UNIQUE NOT NULL DEFAULT ('PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'cash', 'mobile', 'kakao_pay', 'naver_pay')),
  payment_gateway TEXT, -- 'iamport', 'toss', 'kakao' 등
  
  -- 금액 정보
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KRW',
  
  -- 결제 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refunded')),
  
  -- 외부 결제 정보
  external_payment_id TEXT, -- 결제 게이트웨이의 결제 ID
  external_transaction_id TEXT, -- 거래 고유 번호
  
  -- 결제 상세 정보
  card_company TEXT,
  card_number_masked TEXT, -- 마스킹된 카드번호
  installment_months INTEGER DEFAULT 0,
  
  -- 시간 정보
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_amount INTEGER DEFAULT 0,
  refund_reason TEXT,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.2 쿠폰 테이블
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 쿠폰 기본 정보
  coupon_code TEXT UNIQUE NOT NULL,
  coupon_name TEXT NOT NULL,
  description TEXT,
  
  -- 할인 정보
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value INTEGER NOT NULL, -- 고정 할인: 원 단위, 비율 할인: 퍼센트
  max_discount_amount INTEGER, -- 최대 할인 금액 (비율 할인시)
  min_order_amount INTEGER DEFAULT 0, -- 최소 주문 금액
  
  -- 사용 조건
  usage_limit INTEGER, -- 전체 사용 한도 (NULL = 무제한)
  per_user_limit INTEGER DEFAULT 1, -- 사용자당 사용 한도
  usage_count INTEGER NOT NULL DEFAULT 0, -- 현재 사용 횟수
  
  -- 유효 기간
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- 적용 조건
  applicable_programs JSONB DEFAULT '[]'::jsonb, -- 적용 가능한 프로그램 ID 배열
  applicable_categories JSONB DEFAULT '[]'::jsonb, -- 적용 가능한 카테고리 배열
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.3 쿠폰 사용 이력 테이블
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

-- =============================================
-- 5. 콘텐츠 및 정보 테이블
-- =============================================

-- 5.1 고객 후기 테이블
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  
  -- 후기 내용
  title TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- 세부 평점
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- 추천 여부
  would_recommend BOOLEAN,
  
  -- 이미지
  images JSONB DEFAULT '[]'::jsonb, -- 후기 이미지 URL 배열
  
  -- 관리자 응답
  admin_reply TEXT,
  admin_reply_at TIMESTAMP WITH TIME ZONE,
  
  -- 상태 관리
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false, -- 추천 후기 여부
  is_public BOOLEAN NOT NULL DEFAULT true,
  
  -- 도움이 되었나요?
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.2 FAQ 테이블
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- FAQ 내용
  category TEXT NOT NULL, -- 'reservation', 'payment', 'facility', 'program', 'general'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  -- 관련 키워드
  keywords JSONB DEFAULT '[]'::jsonb,
  
  -- 표시 설정
  is_featured BOOLEAN NOT NULL DEFAULT false, -- 자주 묻는 질문
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- 통계
  view_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.3 블로그/스토리 테이블
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 스토리 기본 정보
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  excerpt TEXT, -- 요약문
  
  -- 분류
  category TEXT NOT NULL, -- 'experience', 'program', 'facility', 'event', 'news'
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
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  -- 통계
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  
  -- 시간
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. 알림 및 커뮤니케이션 테이블
-- =============================================

-- 6.1 알림 템플릿 테이블
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 템플릿 기본 정보
  template_code TEXT UNIQUE NOT NULL, -- 'reservation_confirmed', 'payment_completed' 등
  template_name TEXT NOT NULL,
  description TEXT,
  
  -- 발송 채널
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'kakao', 'push', 'in_app')),
  
  -- 메시지 내용
  subject TEXT, -- 이메일 제목 또는 푸시 제목
  message_template TEXT NOT NULL, -- 템플릿 변수 포함된 메시지
  
  -- 발송 조건
  trigger_event TEXT NOT NULL, -- 'reservation_created', 'payment_completed' 등
  send_delay_minutes INTEGER DEFAULT 0, -- 지연 발송 (분 단위)
  
  -- 설정
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_required BOOLEAN NOT NULL DEFAULT false, -- 필수 알림 여부
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.2 알림 발송 이력 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 수신자 정보
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
  related_entity_type TEXT, -- 'reservation', 'payment', 'review' 등
  related_entity_id UUID,
  
  -- 발송 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- 외부 서비스 정보
  external_message_id TEXT, -- 카카오, SMS 등의 메시지 ID
  failure_reason TEXT,
  
  -- 메타데이터
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. 분석 및 로그 테이블
-- =============================================

-- 7.1 고객 행동 분석 테이블
CREATE TABLE IF NOT EXISTS customer_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 세션 정보
  session_id TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- 액션 정보
  activity_type TEXT NOT NULL, -- 'page_view', 'button_click', 'form_submit', 'program_view' 등
  page_url TEXT,
  element_id TEXT, -- 클릭한 버튼이나 요소의 ID
  
  -- 상세 데이터
  activity_data JSONB DEFAULT '{}'::jsonb, -- 액션별 상세 정보
  
  -- 기술 정보
  user_agent TEXT,
  ip_address INET,
  referer_url TEXT,
  
  -- UTM 추적
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7.2 시스템 로그 테이블
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 로그 기본 정보
  log_level TEXT NOT NULL CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  log_category TEXT NOT NULL, -- 'reservation', 'payment', 'notification', 'auth' 등
  message TEXT NOT NULL,
  
  -- 관련 정보
  user_id UUID,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  
  -- 기술 정보
  request_id TEXT, -- 요청 추적용 ID
  ip_address INET,
  user_agent TEXT,
  
  -- 상세 데이터
  metadata JSONB DEFAULT '{}'::jsonb,
  error_stack TEXT, -- 에러 스택 트레이스
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. 설정 및 관리 테이블
-- =============================================

-- 8.1 사이트 설정 테이블
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 설정 정보
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  
  -- 설명
  display_name TEXT,
  description TEXT,
  category TEXT, -- 'general', 'booking', 'payment', 'notification' 등
  
  -- 제약사항
  is_required BOOLEAN NOT NULL DEFAULT false,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8.2 관리자 계정 테이블
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
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'manager', 'staff')),
  permissions JSONB DEFAULT '[]'::jsonb, -- 세부 권한 배열
  
  -- 상태
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. 인덱스 생성
-- =============================================

-- 성능 최적화를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_program ON reservations(program_id);
CREATE INDEX IF NOT EXISTS idx_reservations_created ON reservations(created_at);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(customer_phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(customer_email);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at);

CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category_id);
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active);
CREATE INDEX IF NOT EXISTS idx_programs_recommended ON programs(is_recommended);

CREATE INDEX IF NOT EXISTS idx_reviews_program ON reviews(program_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured);

CREATE INDEX IF NOT EXISTS idx_payments_reservation ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

CREATE INDEX IF NOT EXISTS idx_activities_customer ON customer_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON customer_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON customer_activities(created_at);

-- 전체 텍스트 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_programs_search ON programs USING gin(to_tsvector('korean', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_faqs_search ON faqs USING gin(to_tsvector('korean', question || ' ' || answer));
CREATE INDEX IF NOT EXISTS idx_stories_search ON stories USING gin(to_tsvector('korean', title || ' ' || content));

-- =============================================
-- 10. RLS (Row Level Security) 정책
-- =============================================

-- RLS 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_activities ENABLE ROW LEVEL SECURITY;

-- 고객은 자신의 데이터만 조회 가능
CREATE POLICY customers_self_access ON customers
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY reservations_customer_access ON reservations
  FOR ALL USING (auth.uid()::text = customer_id::text);

CREATE POLICY payments_customer_access ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reservations r 
      WHERE r.id = payments.reservation_id 
      AND auth.uid()::text = r.customer_id::text
    )
  );

-- 관리자는 모든 데이터 접근 가능
CREATE POLICY admin_full_access ON customers
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.id::text = auth.uid()::text 
      AND au.is_active = true
    )
  );

-- 공개 데이터 (비로그인 사용자도 접근 가능)
CREATE POLICY public_programs_access ON programs
  FOR SELECT USING (is_active = true);

CREATE POLICY public_reviews_access ON reviews
  FOR SELECT USING (is_approved = true AND is_public = true);

CREATE POLICY public_faqs_access ON faqs
  FOR SELECT USING (is_active = true);

CREATE POLICY public_stories_access ON stories
  FOR SELECT USING (status = 'published');

-- =============================================
-- 11. 트리거 함수 정의
-- =============================================

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 업데이트 트리거 적용
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 고객 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE customers SET
            total_reservations = (
                SELECT COUNT(*) FROM reservations 
                WHERE customer_id = NEW.customer_id 
                AND status IN ('confirmed', 'completed')
            ),
            total_spent = (
                SELECT COALESCE(SUM(total_price), 0) FROM reservations 
                WHERE customer_id = NEW.customer_id 
                AND status IN ('confirmed', 'completed')
            ),
            last_visit_date = (
                SELECT MAX(actual_check_in) FROM reservations 
                WHERE customer_id = NEW.customer_id 
                AND actual_check_in IS NOT NULL
            )
        WHERE id = NEW.customer_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_stats_trigger 
    AFTER INSERT OR UPDATE ON reservations 
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- =============================================
-- 12. 기본 데이터 삽입
-- =============================================

-- 프로그램 카테고리 기본 데이터
INSERT INTO program_categories (category_code, category_name, description, display_order) VALUES
('pension', '펜션', '편안한 숙박을 위한 펜션 프로그램', 1),
('healing', '힐링', '마음과 몸의 치유를 위한 힐링 프로그램', 2),
('education', '교육', '학습과 성장을 위한 교육 프로그램', 3),
('family', '가족', '가족과 함께하는 특별한 프로그램', 4),
('health', '건강', '건강한 삶을 위한 웰니스 프로그램', 5)
ON CONFLICT (category_code) DO NOTHING;

-- 공간 정보 기본 데이터
INSERT INTO spaces (space_code, space_name, space_type, subtitle, capacity_min, capacity_max, base_price, display_order) VALUES
('room1', '방 1', 'bedroom', '아늑한 휴식 공간', 1, 3, 150000, 1),
('room2', '방 2', 'bedroom', '편안한 휴식 공간', 1, 3, 150000, 2),
('living', '거실', 'living', '편안한 휴식과 대화의 공간', 1, 15, 0, 3),
('kitchen', '부엌', 'kitchen', '요리와 식사를 위한 공간', 1, 15, 0, 4)
ON CONFLICT (space_code) DO NOTHING;

-- 부가 서비스 기본 데이터
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
('facility', '주차는 가능한가요?', '네, 무료 주차가 가능합니다. 주차는 100m위에 파란 창고 앞쪽에 넓은 공터에도 주차가능합니다.', true, 4)
ON CONFLICT DO NOTHING;

-- 사이트 설정 기본 데이터
INSERT INTO site_settings (setting_key, setting_value, setting_type, display_name, category) VALUES
('site_name', '달팽이 아지트 펜션', 'string', '사이트명', 'general'),
('max_booking_days', '365', 'number', '최대 예약 가능 일수', 'booking'),
('min_booking_days', '1', 'number', '최소 예약 일수', 'booking'),
('default_language', 'ko', 'string', '기본 언어', 'general'),
('enable_notifications', 'true', 'boolean', '알림 활성화', 'notification')
ON CONFLICT (setting_key) DO NOTHING;

-- 알림 템플릿 기본 데이터
INSERT INTO notification_templates (template_code, template_name, channel, subject, message_template, trigger_event) VALUES
('reservation_confirmed', '예약 확정 알림', 'sms', '예약 확정', '[달팽이 아지트] 예약이 확정되었습니다. 예약번호: {{reservation_number}}', 'reservation_confirmed'),
('payment_completed', '결제 완료 알림', 'sms', '결제 완료', '[달팽이 아지트] 결제가 완료되었습니다. 금액: {{amount}}원', 'payment_completed'),
('checkin_reminder', '체크인 안내', 'sms', '체크인 안내', '[달팽이 아지트] 내일이 체크인 날입니다. 체크인 시간: 15:00', 'checkin_reminder')
ON CONFLICT (template_code) DO NOTHING;

-- =============================================
-- 13. 뷰(View) 생성
-- =============================================

-- 예약 요약 뷰
CREATE OR REPLACE VIEW reservation_summary AS
SELECT 
    r.id,
    r.reservation_number,
    r.customer_name,
    r.customer_phone,
    r.check_in_date,
    r.check_out_date,
    r.nights,
    r.total_guests,
    r.status,
    r.total_price,
    p.title as program_title,
    p.category_id,
    pc.category_name,
    r.created_at
FROM reservations r
LEFT JOIN programs p ON r.program_id = p.id
LEFT JOIN program_categories pc ON p.category_id = pc.id;

-- 인기 프로그램 뷰
CREATE OR REPLACE VIEW popular_programs AS
SELECT 
    p.*,
    pc.category_name,
    COUNT(r.id) as reservation_count,
    AVG(rev.rating) as average_rating,
    COUNT(rev.id) as review_count
FROM programs p
LEFT JOIN program_categories pc ON p.category_id = pc.id
LEFT JOIN reservations r ON p.id = r.program_id AND r.status IN ('confirmed', 'completed')
LEFT JOIN reviews rev ON p.id = rev.program_id AND rev.is_approved = true
WHERE p.is_active = true
GROUP BY p.id, pc.category_name
ORDER BY reservation_count DESC, average_rating DESC;

-- 고객 통계 뷰
CREATE OR REPLACE VIEW customer_stats AS
SELECT 
    c.*,
    COUNT(r.id) as total_reservations,
    SUM(CASE WHEN r.status IN ('confirmed', 'completed') THEN r.total_price ELSE 0 END) as total_spent,
    MAX(r.check_in_date) as last_visit_date,
    COUNT(rev.id) as review_count
FROM customers c
LEFT JOIN reservations r ON c.id = r.customer_id
LEFT JOIN reviews rev ON c.id = rev.customer_id
GROUP BY c.id;

-- =============================================
-- 14. 함수 정의
-- =============================================

-- 예약 가능 여부 확인 함수
CREATE OR REPLACE FUNCTION check_reservation_availability(
    p_program_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_guests INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    program_max_participants INTEGER;
    current_bookings INTEGER;
BEGIN
    -- 프로그램 최대 인원 확인
    SELECT max_participants INTO program_max_participants
    FROM programs WHERE id = p_program_id AND is_active = true;
    
    IF program_max_participants IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 해당 기간 예약 인원 확인
    SELECT COALESCE(SUM(total_guests), 0) INTO current_bookings
    FROM reservations
    WHERE program_id = p_program_id
    AND status IN ('confirmed', 'pending')
    AND check_in_date < p_check_out
    AND check_out_date > p_check_in;
    
    RETURN (current_bookings + p_guests) <= program_max_participants;
END;
$$ LANGUAGE plpgsql;

-- 총 예약 금액 계산 함수
CREATE OR REPLACE FUNCTION calculate_total_price(
    p_reservation_id UUID
) RETURNS INTEGER AS $$
DECLARE
    total_amount INTEGER := 0;
    program_price INTEGER := 0;
    service_total INTEGER := 0;
BEGIN
    -- 프로그램 기본 가격
    SELECT COALESCE(r.program_price, 0) INTO program_price
    FROM reservations r
    WHERE r.id = p_reservation_id;
    
    -- 부가 서비스 총액
    SELECT COALESCE(SUM(rs.total_price), 0) INTO service_total
    FROM reservation_services rs
    WHERE rs.reservation_id = p_reservation_id;
    
    total_amount := program_price + service_total;
    
    RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 15. 완료 메시지
-- =============================================

-- 스키마 생성 완료 로그
INSERT INTO system_logs (log_level, log_category, message, metadata) VALUES 
('info', 'system', '완전한 랜딩페이지 데이터베이스 스키마 생성 완료', 
 json_build_object(
   'tables_created', 20,
   'indexes_created', 15,
   'views_created', 3,
   'functions_created', 3,
   'version', '1.0.0',
   'created_at', NOW()
 )::jsonb);

-- 생성 완료 확인
SELECT 
  'DDL 실행 완료: ' || COUNT(*) || '개 테이블 생성됨' as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'customers', 'reservations', 'programs', 'program_categories', 
  'spaces', 'additional_services', 'reservation_services',
  'payments', 'coupons', 'coupon_usages', 'reviews', 'faqs', 
  'stories', 'notifications', 'notification_templates',
  'customer_activities', 'system_logs', 'site_settings', 'admin_users'
); 