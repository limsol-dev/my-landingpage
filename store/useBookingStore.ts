import { create } from 'zustand'
import { Program } from '@/types/program'

interface BookingStore {
  selectedProgram: Program | null
  setSelectedProgram: (program: Program | null) => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedProgram: null,
  setSelectedProgram: (program) => set({ selectedProgram: program }),
})) 