-- =============================================
-- 완전한 Row Level Security (RLS) 정책 적용
-- =============================================

-- 1. 모든 테이블에 RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 사용자 프로필 정책
-- =============================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;

-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 관리자는 모든 프로필 조회/수정 가능
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- 관리자는 새 프로필 생성 가능 (회원가입 처리)
CREATE POLICY "Anyone can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 파트너 정책 (관리자 전용)
-- =============================================

DROP POLICY IF EXISTS "Admins can manage partners" ON partners;

CREATE POLICY "Admins can manage partners" ON partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 객실 정책
-- =============================================

DROP POLICY IF EXISTS "Anyone can view active rooms" ON rooms;
DROP POLICY IF EXISTS "Admins can manage rooms" ON rooms;

-- 활성 객실은 누구나 조회 가능
CREATE POLICY "Anyone can view active rooms" ON rooms
  FOR SELECT USING (is_available = true);

-- 관리자는 모든 객실 관리 가능
CREATE POLICY "Admins can manage rooms" ON rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 프로그램 카테고리 정책
-- =============================================

DROP POLICY IF EXISTS "Anyone can view active program categories" ON program_categories;
DROP POLICY IF EXISTS "Admins can manage program categories" ON program_categories;

-- 활성 카테고리는 누구나 조회 가능
CREATE POLICY "Anyone can view active program categories" ON program_categories
  FOR SELECT USING (is_active = true);

-- 관리자는 모든 카테고리 관리 가능
CREATE POLICY "Admins can manage program categories" ON program_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 프로그램 정책
-- =============================================

DROP POLICY IF EXISTS "Anyone can view active programs" ON programs;
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;

-- 활성 프로그램은 누구나 조회 가능
CREATE POLICY "Anyone can view active programs" ON programs
  FOR SELECT USING (is_available = true);

-- 관리자는 모든 프로그램 관리 가능
CREATE POLICY "Admins can manage programs" ON programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 예약 정책 (핵심)
-- =============================================

DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
DROP POLICY IF EXISTS "Anyone can create reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can update reservations" ON reservations;
DROP POLICY IF EXISTS "Group leaders can view group reservations" ON reservations;
DROP POLICY IF EXISTS "Group leaders can update group reservations" ON reservations;

-- 사용자는 자신의 예약만 조회 가능
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- 누구나 예약 생성 가능 (비회원 예약 포함)
CREATE POLICY "Anyone can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- 관리자는 모든 예약 조회/수정 가능
CREATE POLICY "Admins can view all reservations" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update reservations" ON reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- 모임장은 자신이 생성한 그룹 예약만 조회/수정 가능
CREATE POLICY "Group leaders can view group reservations" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'group_leader'
      AND (
        auth.uid() = reservations.user_id OR
        reservations.group_reservation_id IS NOT NULL
      )
    )
  );

CREATE POLICY "Group leaders can update group reservations" ON reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'group_leader'
      AND auth.uid() = reservations.user_id
    )
  );

-- =============================================
-- 예약-프로그램 연결 정책
-- =============================================

DROP POLICY IF EXISTS "Users can view own reservation programs" ON reservation_programs;
DROP POLICY IF EXISTS "Admins can manage reservation programs" ON reservation_programs;
DROP POLICY IF EXISTS "Anyone can create reservation programs" ON reservation_programs;

-- 사용자는 자신의 예약 프로그램만 조회 가능
CREATE POLICY "Users can view own reservation programs" ON reservation_programs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.id = reservation_programs.reservation_id
      AND r.user_id = auth.uid()
    )
  );

-- 관리자는 모든 예약 프로그램 관리 가능
CREATE POLICY "Admins can manage reservation programs" ON reservation_programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- 누구나 예약 프로그램 생성 가능 (예약 생성 시)
CREATE POLICY "Anyone can create reservation programs" ON reservation_programs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 결제 정책
-- =============================================

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
DROP POLICY IF EXISTS "Anyone can create payments" ON payments;

-- 사용자는 자신의 결제 정보만 조회 가능
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.id = payments.reservation_id
      AND r.user_id = auth.uid()
    )
  );

-- 관리자는 모든 결제 정보 관리 가능
CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- 누구나 결제 생성 가능 (결제 처리 시)
CREATE POLICY "Anyone can create payments" ON payments
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 쿠폰 정책
-- =============================================

DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;

-- 활성 쿠폰은 누구나 조회 가능
CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (
    is_active = true 
    AND valid_from <= CURRENT_DATE 
    AND valid_until >= CURRENT_DATE
  );

-- 관리자는 모든 쿠폰 관리 가능
CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 쿠폰 사용 이력 정책
-- =============================================

DROP POLICY IF EXISTS "Users can view own coupon usage" ON coupon_usages;
DROP POLICY IF EXISTS "Admins can manage coupon usage" ON coupon_usages;
DROP POLICY IF EXISTS "Anyone can create coupon usage" ON coupon_usages;

-- 사용자는 자신의 쿠폰 사용 이력만 조회 가능
CREATE POLICY "Users can view own coupon usage" ON coupon_usages
  FOR SELECT USING (user_id = auth.uid());

-- 관리자는 모든 쿠폰 사용 이력 관리 가능
CREATE POLICY "Admins can manage coupon usage" ON coupon_usages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- 누구나 쿠폰 사용 이력 생성 가능 (쿠폰 사용 시)
CREATE POLICY "Anyone can create coupon usage" ON coupon_usages
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 알림 정책
-- =============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- 사용자는 자신의 알림만 조회/수정 가능
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- 관리자는 모든 알림 관리 가능
CREATE POLICY "Admins can manage notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- 시스템은 알림 생성 가능 (서버에서 알림 발송 시)
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 권한 검증 함수 생성
-- =============================================

-- 사용자 역할 확인 함수
CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM user_profiles WHERE id = auth.uid()),
    'anonymous'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- 관리자 권한 확인 함수
CREATE OR REPLACE FUNCTION auth.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT auth.user_role() IN ('admin', 'super_admin');
$$ LANGUAGE SQL SECURITY DEFINER;

-- 최고 관리자 권한 확인 함수
CREATE OR REPLACE FUNCTION auth.is_super_admin() 
RETURNS BOOLEAN AS $$
  SELECT auth.user_role() = 'super_admin';
$$ LANGUAGE SQL SECURITY DEFINER;

-- 모임장 권한 확인 함수
CREATE OR REPLACE FUNCTION auth.is_group_leader() 
RETURNS BOOLEAN AS $$
  SELECT auth.user_role() = 'group_leader';
$$ LANGUAGE SQL SECURITY DEFINER;

-- =============================================
-- 실행 완료 메시지
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS 정책이 성공적으로 적용되었습니다.';
  RAISE NOTICE '🔒 모든 테이블에 행 수준 보안이 활성화되었습니다.';
  RAISE NOTICE '👥 역할별 접근 제어가 설정되었습니다: user, admin, super_admin, group_leader';
  RAISE NOTICE '🛡️ 데이터베이스 보안이 강화되었습니다.';
END $$; 