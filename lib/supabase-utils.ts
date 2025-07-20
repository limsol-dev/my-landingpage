import { ReservationRow, ReservationInsert } from '@/types/supabase'

// Supabase 데이터를 기존 형식으로 변환
export function formatReservationFromSupabase(supabaseReservation: ReservationRow) {
  return {
    id: supabaseReservation.id,
    customerName: supabaseReservation.customer_name,
    programType: supabaseReservation.program_type,
    startDate: supabaseReservation.start_date,
    endDate: supabaseReservation.end_date,
    status: supabaseReservation.status,
    totalPrice: supabaseReservation.total_price,
    participants: supabaseReservation.participants,
    phone: supabaseReservation.phone,
    email: supabaseReservation.customer_email,
    specialRequests: supabaseReservation.special_requests,
    paymentStatus: supabaseReservation.payment_status,
    referrer: supabaseReservation.referrer,
    confirmedDate: supabaseReservation.confirmed_date,
    createdAt: supabaseReservation.created_at,
    updatedAt: supabaseReservation.updated_at,
    adults: supabaseReservation.adults,
    children: supabaseReservation.children,
    // BBQ 옵션
    grillCount: supabaseReservation.bbq_grill_count,
    meatSetCount: supabaseReservation.bbq_meat_set_count,
    fullSetCount: supabaseReservation.bbq_full_set_count,
    // 식사 옵션
    breakfastCount: supabaseReservation.meal_breakfast_count,
    // 교통 옵션
    needsBus: supabaseReservation.transport_needs_bus,
    // 체험 옵션
    farmExperienceCount: supabaseReservation.experience_farm_count,
    // 추가 서비스
    laundryCount: supabaseReservation.extra_laundry_count
  }
}

// 랜딩페이지 폼 데이터를 Supabase 형식으로 변환
export function formatReservationForSupabase(formData: any): ReservationInsert {
  return {
    customer_name: formData.customerName,
    customer_email: formData.email,
    phone: formData.phone,
    program_type: formData.programType,
    start_date: formData.startDate,
    end_date: formData.endDate,
    adults: formData.adults,
    children: formData.children,
    participants: formData.participants,
    total_price: formData.totalPrice,
    status: formData.status || 'pending',
    payment_status: formData.paymentStatus || 'pending',
    confirmed_date: formData.confirmedDate || null,
    special_requests: formData.specialRequests || null,
    referrer: formData.referrer || null,
    // BBQ 옵션
    bbq_grill_count: formData.grillCount || null,
    bbq_meat_set_count: formData.meatSetCount || null,
    bbq_full_set_count: formData.fullSetCount || null,
    // 식사 옵션
    meal_breakfast_count: formData.breakfastCount || null,
    // 교통 옵션
    transport_needs_bus: formData.needsBus || null,
    // 체험 옵션
    experience_farm_count: formData.farmExperienceCount || null,
    // 추가 서비스
    extra_laundry_count: formData.laundryCount || null
  }
}

// 여러 예약 데이터 변환
export function formatReservationsFromSupabase(supabaseReservations: ReservationRow[]) {
  return supabaseReservations.map(formatReservationFromSupabase)
} 