import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays } from 'date-fns'

export type RoomType = 'standard' | 'deluxe' | 'suite'
export type BbqType = 'basic' | 'standard' | 'premium'

interface ReservationState {
  startDate: Date | null
  endDate: Date | null
  roomType: RoomType | null
  adults: number
  children: number
  options: {
    breakfast: boolean
    bbq: {
      type: BbqType | null
      quantity: number
    }
    bus: boolean
  }
  totalPrice: number
  programId: string | null
  
  // Actions
  setDateRange: (start: Date | null, end: Date | null) => void
  setRoomType: (type: RoomType | null) => void
  setAdults: (count: number) => void
  setChildren: (count: number) => void
  setBbqOption: (type: BbqType | null, quantity: number) => void
  toggleOption: (option: 'breakfast' | 'bus') => void
  setProgramId: (id: string | null) => void
  calculateTotalPrice: () => void
  resetReservation: () => void
}

const ROOM_PRICES = {
  standard: 150000,
  deluxe: 250000,
  suite: 350000,
}

const BBQ_PRICES = {
  basic: 50000,    // 실속형: 5인 5만원
  standard: 60000, // 기본형: 5인 6만원
  premium: 80000,  // 프리미엄형: 5인 8만원
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
      totalPrice: 0,
      programId: null,
      
      setDateRange: (start, end) => {
        set({ startDate: start, endDate: end })
        get().calculateTotalPrice()
      },
      
      setRoomType: (type) => {
        set({ roomType: type })
        get().calculateTotalPrice()
      },

      setAdults: (count) => {
        set({ adults: count })
        get().calculateTotalPrice()
      },

      setChildren: (count) => {
        set({ children: count })
        get().calculateTotalPrice()
      },
      
      setBbqOption: (type, quantity) => {
        set((state) => ({
          options: {
            ...state.options,
            bbq: { type, quantity }
          }
        }))
        get().calculateTotalPrice()
      },
      
      toggleOption: (option) => {
        set((state) => ({
          options: {
            ...state.options,
            [option]: !state.options[option],
          },
        }))
        get().calculateTotalPrice()
      },

      setProgramId: (id) => {
        set({ programId: id })
        get().calculateTotalPrice()
      },
      
      calculateTotalPrice: () => {
        const state = get()
        let total = 0
        
        // 기본 숙박 요금 계산
        if (state.startDate && state.endDate && state.roomType) {
          const nights = Math.ceil(
            (state.endDate.getTime() - state.startDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          
          const basePrice = {
            standard: 150000,
            deluxe: 200000,
            suite: 300000
          }[state.roomType]
          
          total += basePrice * nights
        }
        
        // 인원 추가 요금
        const extraAdults = Math.max(0, state.adults - 2)
        const extraChildren = Math.max(0, state.children - 1)
        total += (extraAdults * 30000 + extraChildren * 20000)
        
        // BBQ 옵션
        if (state.options.bbq.type) {
          const bbqPrice = {
            basic: 50000,
            standard: 60000,
            premium: 80000
          }[state.options.bbq.type]
          
          total += bbqPrice * state.options.bbq.quantity
        }
        
        // 조식
        if (state.options.breakfast) {
          total += 10000 * (state.adults + state.children)
        }
        
        // 셔틀버스
        if (state.options.bus) {
          total += 20000
        }
        
        set({ totalPrice: total })
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
            bbq: {
              type: null,
              quantity: 1
            },
            bus: false
          },
          totalPrice: 0,
          programId: null
        })
      },
    }),
    {
      name: 'reservation-storage',
    }
  )
) 