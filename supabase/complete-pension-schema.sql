-- =============================================
-- T-023: Supabase 예약·매출 데이터 스키마 ERD 설계
-- 완전한 펜션 예약 시스템 스키마 (Extended)
-- =============================================

-- ===== 1. 펜션 정보 테이블 =====
CREATE TABLE IF NOT EXISTS pensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    
    -- 시설 정보
    amenities JSONB DEFAULT '[]'::jsonb, -- ["wifi", "parking", "bbq", "pool"]
    check_in_time TIME DEFAULT '15:00',
    check_out_time TIME DEFAULT '11:00',
    
    -- 운영 정보
    is_active BOOLEAN DEFAULT true,
    license_number TEXT, -- 사업자등록번호
    
    -- 위치 정보
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- 시스템 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 2. 객실 정보 테이블 =====
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pension_id UUID NOT NULL REFERENCES pensions(id) ON DELETE CASCADE,
    
    -- 기본 정보
    name TEXT NOT NULL, -- "디럭스룸", "스탠다드룸" 등
    room_number TEXT, -- "101", "A동-1호" 등
    type TEXT NOT NULL CHECK (type IN ('standard', 'deluxe', 'suite', 'villa')),
    
    -- 수용 정보
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    base_capacity INTEGER NOT NULL CHECK (base_capacity > 0 AND base_capacity <= max_capacity),
    extra_person_fee INTEGER DEFAULT 0, -- 추가인원 요금
    
    -- 가격 정보
    base_price INTEGER NOT NULL CHECK (base_price >= 0),
    weekend_price INTEGER, -- 주말 요금
    peak_season_price INTEGER, -- 성수기 요금
    
    -- 시설 정보
    amenities JSONB DEFAULT '[]'::jsonb, -- ["tv", "aircon", "minibar", "balcony"]
    room_size DECIMAL(5,2), -- 평수
    bed_count INTEGER DEFAULT 1,
    bathroom_count INTEGER DEFAULT 1,
    
    -- 운영 정보
    is_available BOOLEAN DEFAULT true,
    maintenance_mode BOOLEAN DEFAULT false,
    
    -- 시스템 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(pension_id, room_number)
);

-- ===== 3. 프로그램 정보 테이블 =====
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pension_id UUID NOT NULL REFERENCES pensions(id) ON DELETE CASCADE,
    
    -- 기본 정보
    name TEXT NOT NULL, -- "바베큐 세트", "조식 뷔페" 등
    category TEXT NOT NULL CHECK (category IN ('bbq', 'meal', 'transport', 'experience', 'facility')),
    description TEXT,
    
    -- 가격 정보
    price INTEGER NOT NULL CHECK (price >= 0),
    unit TEXT DEFAULT 'per_person', -- per_person, per_group, per_night
    
    -- 운영 정보
    max_participants INTEGER, -- 최대 참가자 수 (null = 무제한)
    min_participants INTEGER DEFAULT 1,
    duration_minutes INTEGER, -- 소요시간 (분)
    
    -- 예약 제약
    advance_booking_hours INTEGER DEFAULT 2, -- 사전 예약 필요 시간
    cancellation_hours INTEGER DEFAULT 24, -- 취소 가능 시간
    
    -- 서비스 시간
    available_times JSONB DEFAULT '[]'::jsonb, -- ["09:00", "12:00", "18:00"]
    available_days JSONB DEFAULT '[]'::jsonb, -- [1,2,3,4,5,6,7] (월~일)
    
    -- 요구사항
    requirements JSONB DEFAULT '{}'::jsonb, -- {"age_limit": 18, "equipment": ["swimming_suit"]}
    
    -- 운영 상태
    is_active BOOLEAN DEFAULT true,
    seasonal BOOLEAN DEFAULT false, -- 계절 한정 여부
    
    -- 시스템 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 4. 예약-프로그램 연결 테이블 (기존 reservation_options 대체/확장) =====
CREATE TABLE IF NOT EXISTS reservation_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
    
    -- 예약 상세
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    total_price INTEGER GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- 서비스 일정
    service_date DATE NOT NULL,
    service_time TIME,
    service_duration INTEGER, -- 실제 서비스 시간 (분)
    
    -- 상태 관리
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    
    -- 추가 정보
    special_requests TEXT,
    participant_names TEXT[], -- 참가자 명단
    
    -- 시스템 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 5. 결제 정보 테이블 =====
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
    
    -- 결제 기본 정보
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'cash', 'mobile', 'virtual_account')),
    payment_provider TEXT, -- "toss", "iamport", "nice_pay" 등
    transaction_id TEXT UNIQUE, -- 외부 결제 시스템 거래 ID
    
    -- 금액 정보
    amount INTEGER NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'KRW',
    fee INTEGER DEFAULT 0, -- 결제 수수료
    
    -- 결제 상태
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refunded')),
    
    -- 결제 상세 데이터
    payment_data JSONB DEFAULT '{}'::jsonb, -- 결제 시스템 응답 데이터
    failure_reason TEXT, -- 실패 사유
    
    -- 환불 정보
    refund_amount INTEGER DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- 시간 정보
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- 결제 만료 시간 (가상계좌 등)
    
    -- 시스템 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 6. 예약 이력 테이블 =====
CREATE TABLE IF NOT EXISTS reservation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    
    -- 변경 정보
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'confirmed', 'cancelled', 'completed', 'payment_completed', 'refunded')),
    old_status TEXT,
    new_status TEXT,
    
    -- 변경 상세
    changes JSONB DEFAULT '{}'::jsonb, -- 변경된 필드들의 before/after
    reason TEXT, -- 변경/취소 사유
    
    -- 수행자 정보
    performed_by UUID, -- user_profiles.id 또는 NULL (시스템 자동)
    performed_by_type TEXT DEFAULT 'user' CHECK (performed_by_type IN ('user', 'admin', 'system', 'customer')),
    ip_address TEXT,
    user_agent TEXT,
    
    -- 시스템 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 7. 일일 매출 집계 테이블 =====
CREATE TABLE IF NOT EXISTS daily_revenue_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary_date DATE NOT NULL,
    pension_id UUID NOT NULL REFERENCES pensions(id) ON DELETE CASCADE,
    
    -- 예약 통계
    total_reservations INTEGER DEFAULT 0,
    new_reservations INTEGER DEFAULT 0,
    cancelled_reservations INTEGER DEFAULT 0,
    completed_reservations INTEGER DEFAULT 0,
    
    -- 매출 통계
    total_revenue INTEGER DEFAULT 0,
    room_revenue INTEGER DEFAULT 0,
    program_revenue INTEGER DEFAULT 0,
    payment_fees INTEGER DEFAULT 0,
    net_revenue INTEGER DEFAULT 0,
    
    -- 인원 통계
    total_participants INTEGER DEFAULT 0,
    avg_participants_per_reservation DECIMAL(5,2) DEFAULT 0,
    
    -- 객실 통계
    total_rooms INTEGER DEFAULT 0,
    occupied_rooms INTEGER DEFAULT 0,
    occupancy_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_rooms > 0 THEN (occupied_rooms::decimal / total_rooms) * 100 ELSE 0 END
    ) STORED,
    
    -- 시스템 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(summary_date, pension_id)
);

-- ===== 8. 월간 분석 테이블 =====
CREATE TABLE IF NOT EXISTS monthly_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    pension_id UUID NOT NULL REFERENCES pensions(id) ON DELETE CASCADE,
    
    -- 예약 분석
    total_reservations INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0,
    avg_revenue_per_reservation DECIMAL(10,2) DEFAULT 0,
    
    -- 고객 분석
    new_customers INTEGER DEFAULT 0,
    repeat_customers INTEGER DEFAULT 0,
    customer_retention_rate DECIMAL(5,2) DEFAULT 0,
    
    -- 마케팅 분석
    referrer_breakdown JSONB DEFAULT '{}'::jsonb, -- {"direct": 50, "google": 30, "instagram": 20}
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- 운영 분석
    avg_occupancy_rate DECIMAL(5,2) DEFAULT 0,
    peak_season_revenue INTEGER DEFAULT 0,
    off_season_revenue INTEGER DEFAULT 0,
    
    -- 프로그램 분석
    popular_programs JSONB DEFAULT '[]'::jsonb, -- [{"id": "uuid", "name": "BBQ", "count": 50}]
    program_revenue INTEGER DEFAULT 0,
    
    -- 시스템 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(year, month, pension_id)
);

-- ===== 9. 인덱스 생성 (성능 최적화) =====
-- 펜션 관련
CREATE INDEX IF NOT EXISTS idx_pensions_city ON pensions(city);
CREATE INDEX IF NOT EXISTS idx_pensions_is_active ON pensions(is_active);

-- 객실 관련  
CREATE INDEX IF NOT EXISTS idx_rooms_pension_id ON rooms(pension_id);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_is_available ON rooms(is_available);

-- 프로그램 관련
CREATE INDEX IF NOT EXISTS idx_programs_pension_id ON programs(pension_id);
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_is_active ON programs(is_active);

-- 예약-프로그램 관련
CREATE INDEX IF NOT EXISTS idx_reservation_programs_reservation_id ON reservation_programs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_programs_program_id ON reservation_programs(program_id);
CREATE INDEX IF NOT EXISTS idx_reservation_programs_service_date ON reservation_programs(service_date);

-- 결제 관련
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);

-- 예약 이력 관련
CREATE INDEX IF NOT EXISTS idx_reservation_history_reservation_id ON reservation_history(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_history_action ON reservation_history(action);
CREATE INDEX IF NOT EXISTS idx_reservation_history_created_at ON reservation_history(created_at);

-- 집계 테이블 관련
CREATE INDEX IF NOT EXISTS idx_daily_revenue_summary_date_pension ON daily_revenue_summary(summary_date, pension_id);
CREATE INDEX IF NOT EXISTS idx_monthly_analytics_year_month_pension ON monthly_analytics(year, month, pension_id);

-- ===== 10. 기존 reservations 테이블 확장 =====
-- room_id 외래키 추가 (기존 테이블이 있다면)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'room_id'
    ) THEN
        ALTER TABLE reservations ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- pension_id 추가 (room을 통해 간접 참조되지만 직접 참조도 필요할 수 있음)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'pension_id'
    ) THEN
        ALTER TABLE reservations ADD COLUMN pension_id UUID REFERENCES pensions(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- ===== 11. 트리거 함수들 =====

-- 예약 상태 변경 히스토리 자동 기록
CREATE OR REPLACE FUNCTION track_reservation_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT의 경우
    IF TG_OP = 'INSERT' THEN
        INSERT INTO reservation_history (reservation_id, action, new_status, performed_by_type)
        VALUES (NEW.id, 'created', NEW.status, 'customer');
        RETURN NEW;
    END IF;
    
    -- UPDATE의 경우
    IF TG_OP = 'UPDATE' THEN
        -- 상태가 변경된 경우만 기록
        IF OLD.status != NEW.status THEN
            INSERT INTO reservation_history (
                reservation_id, action, old_status, new_status, 
                changes, performed_by_type
            ) VALUES (
                NEW.id, 
                CASE NEW.status
                    WHEN 'confirmed' THEN 'confirmed'
                    WHEN 'cancelled' THEN 'cancelled' 
                    WHEN 'completed' THEN 'completed'
                    ELSE 'updated'
                END,
                OLD.status, NEW.status,
                jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
                'system'
            );
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS reservation_history_trigger ON reservations;
CREATE TRIGGER reservation_history_trigger
    AFTER INSERT OR UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION track_reservation_changes();

-- 일일 집계 자동 업데이트
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
    target_date DATE;
    target_pension_id UUID;
BEGIN
    -- 타겟 날짜와 펜션 ID 결정
    IF TG_OP = 'DELETE' THEN
        target_date := OLD.start_date;
        target_pension_id := OLD.pension_id;
    ELSE
        target_date := NEW.start_date;
        target_pension_id := NEW.pension_id;
    END IF;
    
    -- 해당 날짜의 집계 업데이트
    INSERT INTO daily_revenue_summary (summary_date, pension_id, total_reservations, total_revenue, total_participants)
    SELECT 
        target_date,
        target_pension_id,
        COUNT(*),
        SUM(COALESCE(total_revenue, 0)),
        SUM(COALESCE(confirmed_participants, 0))
    FROM reservations 
    WHERE start_date = target_date 
      AND pension_id = target_pension_id
      AND status != 'cancelled'
    ON CONFLICT (summary_date, pension_id) DO UPDATE SET
        total_reservations = EXCLUDED.total_reservations,
        total_revenue = EXCLUDED.total_revenue,
        total_participants = EXCLUDED.total_participants,
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (reservations 테이블이 존재할 때만)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservations') THEN
        DROP TRIGGER IF EXISTS daily_summary_trigger ON reservations;
        CREATE TRIGGER daily_summary_trigger
            AFTER INSERT OR UPDATE OR DELETE ON reservations
            FOR EACH ROW EXECUTE FUNCTION update_daily_summary();
    END IF;
END $$;

-- ===== 12. 샘플 데이터 삽입 (테스트용) =====
INSERT INTO pensions (name, description, address, city, phone, email, amenities) VALUES
('달팽이 아지트 펜션', '자연과 함께하는 힐링 펜션', '강원도 춘천시 남산면 백양리 123', '춘천시', '033-123-4567', 'info@snail-pension.kr', 
 '["wifi", "parking", "bbq_area", "swimming_pool", "karaoke", "pension_cafe"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 완료 메시지
SELECT '🎉 T-023: Supabase 예약·매출 데이터 스키마 ERD 설계 완료!' as status;
SELECT '📋 포함된 테이블: pensions, rooms, programs, reservations, reservation_programs, payments, reservation_history, daily_revenue_summary, monthly_analytics' as included_tables;
SELECT '🔧 특징: 완전한 관계형 설계, 자동 집계, 이력 추적, 트랜잭션 안전성' as features; 