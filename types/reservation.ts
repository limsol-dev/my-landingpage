// 예약 기본 정보 타입
export type ReservationBase = {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  adults: number;
  children: number;
  totalGuests: number;
}

// BBQ 옵션 타입
export type BBQOption = {
  grillCount: number;  // 그릴 대여 수량
  meatSetCount: number;  // 고기 세트 인원
  fullSetCount: number;  // 목살+식사 세트 인원
}

// 식사 옵션 타입
export type MealOption = {
  breakfastCount: number;  // 조식 인원
}

// 교통 옵션 타입
export type TransportOption = {
  needsBus: boolean;  // 버스 렌트 필요 여부
}

// 체험 프로그램 옵션 타입
export type ExperienceOption = {
  farmExperienceCount: number;  // 목공 체험 인원
}

// 그외 서비스 옵션 타입
export type ExtraOption = {
  laundryCount: number;  // 버스 대절 횟수
}

// 전체 예약 정보 타입
export type ReservationInfo = ReservationBase & {
  bbq: BBQOption;
  meal: MealOption;
  transport: TransportOption;
  experience: ExperienceOption;
  extra: ExtraOption;
}

// 가격 상수
export const PRICE_CONFIG = {
  BASE_PRICE: 0, // 기본 가격은 객실 타입별로 다르게 설정
  EXTRA_PERSON_FEE: 10000,
  BASE_CAPACITY: 15,
  BBQ: {
    GRILL_SET: 30000, // 그릴 대여 가격 1개당 3만원
    MEAT_SET: 10000,  // 1인당 고기 세트 (5인 기준 5만원)
    FULL_SET: 14000,  // 1인당 목살+식사 (5인 기준 7만원)
    MAX_GRILLS: 6
  },
  BREAKFAST: 15000,  // 1인당 조식
}

// 예약 유효성 검사 함수
export const validateReservation = (reservation: ReservationInfo): string[] => {
  const errors: string[] = [];

  // 날짜 체크
  if (!reservation.checkIn) {
    errors.push('체크인 날짜를 선택해주세요.');
  }
  if (!reservation.checkOut) {
    errors.push('체크아웃 날짜를 선택해주세요.');
  }
  if (reservation.checkIn && reservation.checkOut && reservation.checkIn >= reservation.checkOut) {
    errors.push('체크아웃 날짜는 체크인 날짜 이후여야 합니다.');
  }

  // 기본 인원 체크
  if (reservation.totalGuests < 1) {
    errors.push('최소 1명 이상의 투숙객이 필요합니다.');
  }

  // BBQ 그릴 수량 체크
  if (reservation.bbq.grillCount > PRICE_CONFIG.BBQ.MAX_GRILLS) {
    errors.push(`BBQ 그릴은 최대 ${PRICE_CONFIG.BBQ.MAX_GRILLS}개까지만 대여 가능합니다.`);
  }

  return errors;
}

// 총 가격 계산 함수
export const calculateTotalPrice = (
  reservation: ReservationInfo,
  basePrice: number,
  grillPrice: number
): number => {
  let total = basePrice;

  // 추가 인원 요금
  const extraGuests = Math.max(0, reservation.totalGuests - PRICE_CONFIG.BASE_CAPACITY);
  total += extraGuests * PRICE_CONFIG.EXTRA_PERSON_FEE;

  // BBQ 요금
  total += reservation.bbq.grillCount * grillPrice;
  total += reservation.bbq.meatSetCount * 50000; // 고기만 세트 5인 기준
  total += reservation.bbq.fullSetCount * 70000; // 고기+식사 세트 5인 기준

  // 조식 요금 (5인 세트 기준)
  total += reservation.meal.breakfastCount * 50000;

  // 체험 프로그램 요금
  total += reservation.experience.farmExperienceCount * 30000; // 목공 체험

  // 그외 항목 요금
  total += reservation.extra.laundryCount * 100000; // 버스 대절

  return total;
} 