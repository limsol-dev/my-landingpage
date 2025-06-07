// 예약 기본 정보 타입
export type ReservationInfo = {
  checkIn: any;
  checkOut: any;
  adults: number;
  children: number;
  totalGuests: number;
  extraGuests: number;  // 추가 인원 수
  bbq: {
    grillCount: number;
    meatSetCount: number;
    fullSetCount: number;
  };
  meal: {
    breakfastCount: number;
  };
  transport: {
    needsBus: boolean;
  };
}

// 가격 상수
export const PRICE_CONFIG = {
  BASE_CAPACITY: 15,  // 기본 인원
  EXTRA_PERSON_FEE: 10000,  // 추가 인원 1인당 요금
  BBQ: {
    GRILL_RENTAL: 50000,  // 그릴 대여 가격 (8인 1세트)
    MEAT_SET: 10000,  // 1인당 고기만 세트
    FULL_SET: 15000,  // 1인당 저녁 식사 제공 (고기+밥+채소)
    MAX_GRILLS: 6,  // 최대 그릴 수량
    RECOMMENDED_CAPACITY: 8  // 1세트당 추천 인원
  },
  BREAKFAST: 15000,  // 1인당 조식
}

// 예약 유효성 검사 함수
export const validateReservation = (reservation: ReservationInfo): string[] => {
  const errors: string[] = [];

  // 날짜 체크
  if (!reservation.checkIn || !reservation.checkOut) {
    errors.push('체크인/체크아웃 날짜를 선택해주세요.');
  }

  // 인원 체크
  if (reservation.totalGuests < 1) {
    errors.push('최소 1명 이상의 투숙객이 필요합니다.');
  }

  // BBQ 그릴 수량 체크
  if (reservation.bbq.grillCount > PRICE_CONFIG.BBQ.MAX_GRILLS) {
    errors.push(`바베큐 그릴은 최대 ${PRICE_CONFIG.BBQ.MAX_GRILLS}개까지만 대여 가능합니다.`);
  }

  // BBQ 인원 체크
  const totalBBQGuests = reservation.bbq.meatSetCount + reservation.bbq.fullSetCount;
  if (totalBBQGuests > 0 && reservation.bbq.grillCount === 0) {
    errors.push('저녁 준비 서비스 이용 시 그릴 대여가 필요합니다.');
  }

  // 조식 인원 체크
  if (reservation.meal.breakfastCount > reservation.totalGuests) {
    errors.push('조식 신청 인원이 총 투숙객 수를 초과할 수 없습니다.');
  }

  return errors;
}

// 총 가격 계산 함수
export const calculateTotalPrice = (reservation: ReservationInfo): number => {
  let total = 0;

  // 추가 인원 요금
  if (reservation.extraGuests > 0) {
    total += reservation.extraGuests * PRICE_CONFIG.EXTRA_PERSON_FEE;
  }

  // BBQ 요금
  total += reservation.bbq.grillCount * PRICE_CONFIG.BBQ.GRILL_RENTAL;
  total += reservation.bbq.meatSetCount * PRICE_CONFIG.BBQ.MEAT_SET;
  total += reservation.bbq.fullSetCount * PRICE_CONFIG.BBQ.FULL_SET;

  // 조식 요금
  total += reservation.meal.breakfastCount * PRICE_CONFIG.BREAKFAST;

  return total;
}

// 날짜 포맷 함수
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
} 