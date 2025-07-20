import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RoomType = 'standard' | 'deluxe' | 'suite'
export type BbqType = 'basic' | 'standard' | 'premium'

export interface Program {
  id: string
  name: string
  description: string
  price: number
  unit: 'per_person' | 'per_group' | 'fixed'
  duration?: number
  maxParticipants?: number
  category: string
}

export interface ReservationState {
  // 날짜 정보
  startDate: Date | null
  endDate: Date | null
  
  // 객실 정보
  roomType: RoomType | null
  
  // 인원 정보
  adults: number
  children: number
  
  // 옵션 정보
  options: {
    breakfast: boolean
    bbq: {
      type: BbqType | null
      quantity: number
    }
    bus: boolean
  }
  
  // 선택된 프로그램
  selectedPrograms: Program[]
  programId: string | null
  
  // 가격 정보
  totalPrice: number
  roomPrice: number
  programsPrice: number
  optionsPrice: number
  
  // 예약자 정보
  customerInfo: {
    name: string
    phone: string
    email: string
  }
  
  // Analytics tracking function reference
  trackEvent?: (eventData: any) => void
  
  // Actions
  setDateRange: (start: Date | null, end: Date | null) => void
  setRoomType: (type: RoomType | null) => void
  setAdults: (count: number) => void
  setChildren: (count: number) => void
  setBbqOption: (type: BbqType | null, quantity: number) => void
  toggleOption: (option: 'breakfast' | 'bus') => void
  addProgram: (program: Program) => void
  removeProgram: (programId: string) => void
  setProgramId: (programId: string | null) => void
  updateCustomerInfo: (info: Partial<ReservationState['customerInfo']>) => void
  calculateTotalPrice: () => void
  resetReservation: () => void
  setTrackEvent: (trackFn: (eventData: any) => void) => void
}

const ROOM_PRICES = {
  standard: 150000,
  deluxe: 250000,
  suite: 350000,
}

const OPTION_PRICES = {
  breakfast: 10000, // 1인당
  bbq: {
    basic: 50000,    // 5인 기준
    standard: 60000, // 5인 기준
    premium: 80000,  // 5인 기준
  },
  bus: 20000, // 고정 요금
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      startDate: null,
      endDate: null,
      roomType: null,
      adults: 2,
      children: 0,
      options: {
        breakfast: false,
        bbq: {
          type: null,
          quantity: 1
        },
        bus: false
      },
      selectedPrograms: [],
      programId: null,
      totalPrice: 0,
      roomPrice: 0,
      programsPrice: 0,
      optionsPrice: 0,
      customerInfo: {
        name: '',
        phone: '',
        email: ''
      },
      
      setDateRange: (start, end) => {
        const state = get()
        set({ startDate: start, endDate: end })
        get().calculateTotalPrice()
        
        // Track date selection event
        if (state.trackEvent && start && end) {
          state.trackEvent({
            event_type: 'date_select',
            check_in_date: start.toISOString().split('T')[0],
            check_out_date: end.toISOString().split('T')[0],
            conversion_funnel_step: 3,
            metadata: {
              nights: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
              selected_via: 'date_picker'
            }
          })
        }
      },
      
      setRoomType: (type) => {
        const state = get()
        set({ roomType: type })
        get().calculateTotalPrice()
        
        // Track room selection event
        if (state.trackEvent && type) {
          state.trackEvent({
            event_type: 'room_view',
            room_id: `room-${type}`,
            conversion_funnel_step: 2,
            metadata: {
              room_type: type,
              selected_via: 'room_selector',
              price_tier: type === 'standard' ? 'basic' : type === 'deluxe' ? 'mid' : 'premium'
            }
          })
        }
      },

      setAdults: (count) => {
        const state = get()
        const previousCount = state.adults
        set({ adults: count })
        get().calculateTotalPrice()
        
        // Track guest count change
        if (state.trackEvent && count !== previousCount) {
          state.trackEvent({
            event_type: 'guest_count_change',
            adults_count: count,
            children_count: state.children,
            conversion_funnel_step: 3,
            metadata: {
              guest_type: 'adults',
              previous_count: previousCount,
              total_guests: count + state.children
            }
          })
        }
      },

      setChildren: (count) => {
        const state = get()
        const previousCount = state.children
        set({ children: count })
        get().calculateTotalPrice()
        
        // Track guest count change
        if (state.trackEvent && count !== previousCount) {
          state.trackEvent({
            event_type: 'guest_count_change',
            adults_count: state.adults,
            children_count: count,
            conversion_funnel_step: 3,
            metadata: {
              guest_type: 'children',
              previous_count: previousCount,
              total_guests: state.adults + count
            }
          })
        }
      },
      
      setBbqOption: (type, quantity) => {
        const state = get()
        const previousType = state.options.bbq.type
        set((prevState) => ({
          options: {
            ...prevState.options,
            bbq: { type, quantity }
          }
        }))
        get().calculateTotalPrice()
        
        // Track BBQ option change
        if (state.trackEvent && type !== previousType) {
          state.trackEvent({
            event_type: type ? 'program_add' : 'program_remove',
            conversion_funnel_step: 3,
            metadata: {
              option_type: 'bbq',
              bbq_type: type,
              quantity: quantity,
              previous_type: previousType
            }
          })
        }
      },
      
      toggleOption: (option) => {
        const state = get()
        const previousValue = state.options[option]
        set((prevState) => ({
          options: {
            ...prevState.options,
            [option]: !prevState.options[option],
          },
        }))
        get().calculateTotalPrice()
        
        // Track option toggle
        if (state.trackEvent) {
          state.trackEvent({
            event_type: !previousValue ? 'program_add' : 'program_remove',
            conversion_funnel_step: 3,
            metadata: {
              option_type: option,
              enabled: !previousValue,
              option_category: 'additional_service'
            }
          })
        }
      },

      addProgram: (program) => {
        const state = get()
        set((prevState) => ({
          selectedPrograms: [...prevState.selectedPrograms, program]
        }))
        get().calculateTotalPrice()
        
        // Track program addition
        if (state.trackEvent) {
          state.trackEvent({
            event_type: 'program_add',
            program_ids: [program.id],
            conversion_funnel_step: 3,
            metadata: {
              program_name: program.name,
              program_category: program.category,
              program_price: program.price,
              program_unit: program.unit,
              total_programs: state.selectedPrograms.length + 1
            }
          })
        }
      },

      removeProgram: (programId) => {
        const state = get()
        const programToRemove = state.selectedPrograms.find(p => p.id === programId)
        set((prevState) => ({
          selectedPrograms: prevState.selectedPrograms.filter(p => p.id !== programId)
        }))
        get().calculateTotalPrice()
        
        // Track program removal
        if (state.trackEvent && programToRemove) {
          state.trackEvent({
            event_type: 'program_remove',
            program_ids: [programId],
            conversion_funnel_step: 3,
            metadata: {
              program_name: programToRemove.name,
              program_category: programToRemove.category,
              total_programs: state.selectedPrograms.length - 1
            }
          })
        }
      },

      setProgramId: (programId) => {
        set({ programId })
      },

      updateCustomerInfo: (info) => {
        set((state) => ({
          customerInfo: { ...state.customerInfo, ...info }
        }))
      },

      calculateTotalPrice: () => {
        const state = get()
        
        // 숙박 일수 계산
        let nights = 1
        if (state.startDate && state.endDate) {
          const diffTime = state.endDate.getTime() - state.startDate.getTime()
          nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
        }

        // 객실 가격 계산
        const roomPrice = state.roomType ? ROOM_PRICES[state.roomType] * nights : 0

        // 추가 인원 요금 (기본 2인 초과시)
        const totalGuests = state.adults + state.children
        const extraGuests = Math.max(0, totalGuests - 2)
        const extraGuestFee = extraGuests * 30000 * nights // 1박당 30,000원

        // 옵션 가격 계산
        let optionsPrice = 0
        
        // 조식
        if (state.options.breakfast) {
          optionsPrice += totalGuests * OPTION_PRICES.breakfast * nights
        }
        
        // BBQ
        if (state.options.bbq.type) {
          const bbqSets = Math.ceil(totalGuests / 5) // 5인당 1세트
          optionsPrice += OPTION_PRICES.bbq[state.options.bbq.type] * bbqSets * state.options.bbq.quantity
        }
        
        // 버스
        if (state.options.bus) {
          optionsPrice += OPTION_PRICES.bus
        }

        // 프로그램 가격 계산
        const programsPrice = state.selectedPrograms.reduce((total, program) => {
          switch (program.unit) {
            case 'per_person':
              return total + (program.price * totalGuests)
            case 'per_group':
              return total + program.price
            case 'fixed':
            default:
              return total + program.price
          }
        }, 0)

        const totalPrice = roomPrice + extraGuestFee + optionsPrice + programsPrice

        set({ 
          totalPrice,
          roomPrice: roomPrice + extraGuestFee,
          optionsPrice,
          programsPrice
        })
      },

      resetReservation: () => {
        set({
          startDate: null,
          endDate: null,
          roomType: null,
          adults: 2,
          children: 0,
          options: {
            breakfast: false,
            bbq: { type: null, quantity: 1 },
            bus: false
          },
          selectedPrograms: [],
          programId: null,
          totalPrice: 0,
          roomPrice: 0,
          programsPrice: 0,
          optionsPrice: 0,
          customerInfo: { name: '', phone: '', email: '' }
        })
      },

      setTrackEvent: (trackFn) => {
        set({ trackEvent: trackFn })
      }
    }),
    {
      name: 'reservation-storage',
      partialize: (state) => ({
        startDate: state.startDate,
        endDate: state.endDate,
        roomType: state.roomType,
        adults: state.adults,
        children: state.children,
        options: state.options,
        selectedPrograms: state.selectedPrograms,
        customerInfo: state.customerInfo,
      }),
    }
  )
) 