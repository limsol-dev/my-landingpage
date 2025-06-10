export interface ReservationInfo {
  checkIn: Date
  checkOut: Date
  adults: number
  children: number
  totalGuests: number
  bbq: {
    grillCount: number
    meatSetCount: number
    fullSetCount: number
  }
  meal: {
    breakfastCount: number
  }
  transport: {
    needsBus: boolean
  }
}

export const PRICE_CONFIG = {
  BASE_CAPACITY: 2,
  EXTRA_PERSON_FEE: 20000,
  BBQ: {
    MAX_GRILLS: 3,
    GRILL_RENTAL: 50000,
    MEAT_SET: 25000,
    FULL_SET: 35000
  },
  BREAKFAST: 15000
}

export function validateReservation(reservation: ReservationInfo): string[] {
  const errors: string[] = []

  if (reservation.checkOut <= reservation.checkIn) {
    errors.push('체크아웃 날짜는 체크인 날짜 이후여야 합니다.')
  }

  if (reservation.adults < 1) {
    errors.push('성인은 최소 1명 이상이어야 합니다.')
  }

  if (reservation.children < 0) {
    errors.push('아동 인원은 0명 이상이어야 합니다.')
  }

  if (reservation.bbq.grillCount > PRICE_CONFIG.BBQ.MAX_GRILLS) {
    errors.push(`BBQ 그릴은 최대 ${PRICE_CONFIG.BBQ.MAX_GRILLS}개까지만 대여 가능합니다.`)
  }

  return errors
}

export function calculateTotalPrice(
  reservation: ReservationInfo,
  basePrice: number,
  grillPrice: number
): number {
  // 기본 숙박료
  let total = basePrice

  // 추가 인원 요금
  const extraGuests = Math.max(0, reservation.totalGuests - PRICE_CONFIG.BASE_CAPACITY)
  total += extraGuests * PRICE_CONFIG.EXTRA_PERSON_FEE

  // BBQ 요금
  total += reservation.bbq.grillCount * grillPrice
  total += reservation.bbq.meatSetCount * PRICE_CONFIG.BBQ.MEAT_SET
  total += reservation.bbq.fullSetCount * PRICE_CONFIG.BBQ.FULL_SET

  // 조식 요금
  total += reservation.meal.breakfastCount * PRICE_CONFIG.BREAKFAST

  return total
} 