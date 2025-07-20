-- =============================================
-- 펜션 예약 시스템 - 샘플 데이터
-- =============================================

-- 1. 파트너 데이터
INSERT INTO partners (id, name, description, contact_name, contact_email, contact_phone, address, status, commission_rate) VALUES
('550e8400-e29b-41d4-a716-446655440001', '달팽이 아지트 펜션', '자연 속에서 힐링할 수 있는 펜션입니다.', '김펜션', 'pension@example.com', '010-1234-5678', '강원도 춘천시 남산면 자연로 123', 'active', 10.00),
('550e8400-e29b-41d4-a716-446655440002', '힐링 레저 파트너', '다양한 레저 프로그램을 제공합니다.', '이레저', 'leisure@example.com', '010-2345-6789', '강원도 춘천시 남산면 레저로 456', 'active', 15.00);

-- 2. 프로그램 카테고리 데이터
INSERT INTO program_categories (id, name, description, icon, sort_order, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440011', '바비큐', '야외에서 즐기는 바비큐 프로그램', '🍖', 1, true),
('550e8400-e29b-41d4-a716-446655440012', '조식', '건강한 아침 식사 프로그램', '🍳', 2, true),
('550e8400-e29b-41d4-a716-446655440013', '레저', '다양한 레저 활동 프로그램', '🏊', 3, true),
('550e8400-e29b-41d4-a716-446655440014', '체험', '자연 체험 프로그램', '🌿', 4, true);

-- 3. 객실 데이터
INSERT INTO rooms (id, partner_id, name, type, description, base_price, max_guests, amenities, images, is_available, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', '스탠다드 룸', 'standard', '기본적인 편의시설을 갖춘 아늑한 객실입니다.', 80000, 4, '["wifi", "tv", "aircon", "refrigerator"]', '["/images/room1.jpg", "/images/room1-2.jpg"]', true, 1),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440001', '디럭스 룸', 'deluxe', '넓은 공간과 고급 편의시설을 갖춘 객실입니다.', 120000, 6, '["wifi", "tv", "aircon", "refrigerator", "kitchen", "balcony"]', '["/images/room2.jpg", "/images/room2-2.jpg"]', true, 2),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440001', '패밀리 스위트', 'family', '가족 단위 투숙객을 위한 넓은 객실입니다.', 180000, 8, '["wifi", "tv", "aircon", "refrigerator", "kitchen", "balcony", "living_room"]', '["/images/suite.jpg", "/images/suite-2.jpg"]', true, 3);

-- 4. 프로그램 데이터
INSERT INTO programs (id, partner_id, category_id, name, description, price, unit, max_participants, duration_minutes, available_times, requirements, images, is_available, stock_quantity, sort_order) VALUES
-- 바비큐 프로그램
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '기본 바비큐 세트', '소고기, 돼지고기, 야채가 포함된 기본 바비큐 세트입니다.', 15000, 'per_person', 20, 180, '["17:00", "18:00", "19:00"]', '사전 예약 필수', '["/images/bbq-basic.jpg"]', true, 50, 1),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '프리미엄 바비큐 세트', '한우, 해산물, 프리미엄 야채가 포함된 고급 바비큐 세트입니다.', 25000, 'per_person', 15, 180, '["17:00", "18:00", "19:00"]', '사전 예약 필수', '["/images/bbq-premium.jpg"]', true, 30, 2),

-- 조식 프로그램
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', '한식 조식', '전통 한식으로 구성된 건강한 아침 식사입니다.', 12000, 'per_person', 30, 60, '["07:00", "08:00", "09:00"]', '전날 오후 6시까지 예약', '["/images/breakfast-korean.jpg"]', true, 40, 1),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', '양식 조식', '빵, 샐러드, 과일 등으로 구성된 서양식 아침 식사입니다.', 10000, 'per_person', 25, 60, '["07:00", "08:00", "09:00"]', '전날 오후 6시까지 예약', '["/images/breakfast-western.jpg"]', true, 35, 2),

-- 레저 프로그램
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440013', '카약 체험', '맑은 호수에서 즐기는 카약 체험입니다.', 20000, 'per_person', 10, 120, '["09:00", "14:00", "16:00"]', '수영 가능자만 참여', '["/images/kayak.jpg"]', true, 20, 1),
('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440013', '산악자전거', '자연 속에서 즐기는 산악자전거 체험입니다.', 18000, 'per_person', 8, 150, '["09:00", "14:00"]', '자전거 운전 가능자만 참여', '["/images/mountain-bike.jpg"]', true, 15, 2),

-- 체험 프로그램
('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440014', '농장 체험', '직접 야채를 수확하고 요리하는 체험입니다.', 15000, 'per_person', 12, 180, '["10:00", "14:00"]', '어린이 포함 가능', '["/images/farm-experience.jpg"]', true, 25, 1),
('550e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440014', '천연 비누 만들기', '천연 재료로 비누를 만드는 체험입니다.', 12000, 'per_person', 15, 90, '["10:00", "14:00", "16:00"]', '6세 이상 참여 가능', '["/images/soap-making.jpg"]', true, 30, 2);

-- 5. 쿠폰 데이터
INSERT INTO coupons (id, code, name, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, valid_from, valid_until, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'WELCOME10', '신규 회원 10% 할인', '신규 회원 가입 시 10% 할인 쿠폰', 'percentage', 10, 100000, 50000, 100, 0, '2024-01-01', '2024-12-31', true),
('550e8400-e29b-41d4-a716-446655440042', 'SUMMER2024', '여름 시즌 할인', '여름 시즌 특별 할인 쿠폰', 'fixed_amount', 30000, 200000, 30000, 50, 0, '2024-06-01', '2024-08-31', true),
('550e8400-e29b-41d4-a716-446655440043', 'FAMILY20', '가족 단위 20% 할인', '4인 이상 가족 단위 예약 시 20% 할인', 'percentage', 20, 150000, 100000, 30, 0, '2024-01-01', '2024-12-31', true);

-- 6. 샘플 예약 데이터 (테스트용)
INSERT INTO reservations (id, room_id, customer_name, customer_email, customer_phone, check_in_date, check_out_date, adults, children, room_price, program_price, total_price, status, payment_status, special_requests) VALUES
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440021', '김철수', 'kim@example.com', '010-1111-2222', '2024-08-15', '2024-08-17', 2, 1, 160000, 45000, 205000, 'confirmed', 'completed', '늦은 체크인 희망'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440022', '이영희', 'lee@example.com', '010-3333-4444', '2024-08-20', '2024-08-22', 4, 2, 240000, 90000, 330000, 'pending', 'pending', '바비큐 시설 사용 예정');

-- 7. 예약-프로그램 연결 데이터
INSERT INTO reservation_programs (id, reservation_id, program_id, quantity, unit_price, total_price, scheduled_date, scheduled_time) VALUES
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440031', 3, 15000, 45000, '2024-08-15', '18:00'),
('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440032', 6, 25000, 150000, '2024-08-20', '19:00'),
('550e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440033', 6, 12000, 72000, '2024-08-21', '08:00');

-- 8. 결제 데이터
INSERT INTO payments (id, reservation_id, payment_method, amount, status, payment_gateway, transaction_id, paid_at) VALUES
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440051', 'card', 205000, 'completed', 'iamport', 'imp_123456789', '2024-07-15 14:30:00+09'),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440052', 'kakao_pay', 330000, 'pending', 'iamport', 'imp_987654321', NULL);

-- 완료 메시지
SELECT '🎉 샘플 데이터가 성공적으로 삽입되었습니다!' as message;
SELECT '📊 삽입된 데이터:' as info;
SELECT '   - 파트너: 2개' as partners;
SELECT '   - 프로그램 카테고리: 4개' as categories;
SELECT '   - 객실: 3개' as rooms;
SELECT '   - 프로그램: 8개' as programs;
SELECT '   - 쿠폰: 3개' as coupons;
SELECT '   - 예약: 2개' as reservations;
SELECT '   - 결제: 2개' as payments;
SELECT '📋 이제 API를 통해 데이터를 조회하고 테스트할 수 있습니다!' as next_step; 