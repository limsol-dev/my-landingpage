// 예약 기본 정보 타입
export type ReservationBase = {
  checkIn: Date;
  checkOut: Date;
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

// 전체 예약 정보 타입
export type ReservationInfo = ReservationBase & {
  bbq: BBQOption;
  meal: MealOption;
  transport: TransportOption;
}

// 가격 상수
export const PRICE_CONFIG = {
  BASE_PRICE: 0, // 기본 가격은 객실 타입별로 다르게 설정
  EXTRA_PERSON_FEE: 10000,
  BASE_CAPACITY: 15,
  BBQ: {
    GRILL_SET: 0, // 그릴 대여 가격은 관리자 설정
    MEAT_SET: 10000,  // 1인당 고기 세트
    FULL_SET: 15000,  // 1인당 목살+식사
    MAX_GRILLS: 6
  },
  BREAKFAST: 15000,  // 1인당 조식
}

// 예약 유효성 검사 함수
export const validateReservation = (reservation: ReservationInfo): string[] => {
  const errors: string[] = [];

  // 기본 인원 체크
  if (reservation.totalGuests < 1) {
    errors.push('최소 1명 이상의 투숙객이 필요합니다.');
  }

  // BBQ 그릴 수량 체크
  if (reservation.bbq.grillCount > PRICE_CONFIG.BBQ.MAX_GRILLS) {
    errors.push(`BBQ 그릴은 최대 ${PRICE_CONFIG.BBQ.MAX_GRILLS}개까지만 대여 가능합니다.`);
  }

  // 날짜 체크
  if (reservation.checkIn >= reservation.checkOut) {
    errors.push('체크아웃 날짜는 체크인 날짜 이후여야 합니다.');
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
  total += reservation.bbq.meatSetCount * PRICE_CONFIG.BBQ.MEAT_SET;
  total += reservation.bbq.fullSetCount * PRICE_CONFIG.BBQ.FULL_SET;

  // 조식 요금
  total += reservation.meal.breakfastCount * PRICE_CONFIG.BREAKFAST;

  return total;
} 