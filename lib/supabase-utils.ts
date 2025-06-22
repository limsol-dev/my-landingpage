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
    email: supabaseReservation.email,
    specialRequests: supabaseReservation.special_requests,
    paymentStatus: supabaseReservation.payment_status,
    referrer: supabaseReservation.referrer,
    confirmedDate: supabaseReservation.confirmed_date,
    createdAt: supabaseReservation.created_at,
    updatedAt: supabaseReservation.updated_at,
    adults: supabaseReservation.adults,
    children: supabaseReservation.children,
    bbq: {
      grillCount: supabaseReservation.bbq_grill_count,
      meatSetCount: supabaseReservation.bbq_meat_set_count,
      fullSetCount: supabaseReservation.bbq_full_set_count
    },
    meal: {
      breakfastCount: supabaseReservation.meal_breakfast_count
    },
    transport: {
      needsBus: supabaseReservation.transport_needs_bus
    },
    experience: {
      farmExperienceCount: supabaseReservation.experience_farm_count
    },
    extra: {
      laundryCount: supabaseReservation.extra_laundry_count
    }
  }
}

// 랜딩페이지 폼 데이터를 Supabase 형식으로 변환
export function formatReservationForSupabase(formData: any): ReservationInsert {
  return {
    customer_name: formData.customerName || '',
    program_type: formData.programType || '일반 예약',
    start_date: formData.checkIn || '',
    end_date: formData.checkOut || '',
    status: 'pending',
    total_price: formData.totalPrice || 0,
    participants: formData.totalGuests || 0,
    phone: formData.customerPhone || '',
    email: formData.customerEmail || null,
    special_requests: formData.specialRequests || null,
    payment_status: 'pending',
    referrer: formData.referrer || '웹사이트',
    confirmed_date: null,
    created_at: new Date().toISOString(),
    adults: formData.adults || null,
    children: formData.children || null,
    bbq_grill_count: formData.bbq?.grillCount || null,
    bbq_meat_set_count: formData.bbq?.meatSetCount || null,
    bbq_full_set_count: formData.bbq?.fullSetCount || null,
    meal_breakfast_count: formData.meal?.breakfastCount || null,
    transport_needs_bus: formData.transport?.needsBus || null,
    experience_farm_count: formData.experience?.farmExperienceCount || null,
    extra_laundry_count: formData.extra?.laundryCount || null
  }
}

// 여러 예약을 한번에 변환
export function formatReservationsFromSupabase(supabaseReservations: ReservationRow[]) {
  return supabaseReservations.map(formatReservationFromSupabase)
}