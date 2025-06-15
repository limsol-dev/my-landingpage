'use client';

import { createContext, useContext, ReactNode } from 'react';
import { create } from 'zustand';
import { toast } from 'sonner';

export interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  programId?: string;
  adults: number;
  children: number;
  additionalGuests: number;
  nights: number;
  basePrice: number;
  additionalOptions?: Array<{
    id: string;
    quantity: number;
  }>;
}

interface ReservationStore {
  reservations: Reservation[];
  setReservations: (reservations: Reservation[]) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
}

const useReservationStore = create<ReservationStore>((set) => ({
  reservations: [
    {
      id: 'RES-1',
      guestName: '홍길동',
      guestPhone: '010-1234-5678',
      checkIn: '2024-07-01T15:00:00.000Z',
      checkOut: '2024-07-02T11:00:00.000Z',
      totalAmount: 150000,
      status: 'confirmed',
      adults: 2,
      children: 0,
      totalGuests: 2,
      bbq: { grillCount: 1, meatSetCount: 0, fullSetCount: 0 },
      meal: { breakfastCount: 0 },
      transport: { needsBus: false },
      experience: { farmExperienceCount: 0 },
      extra: { laundryCount: 0 },
      nights: 1,
      basePrice: 150000,
      createdAt: 1719900000000
    },
    {
      id: 'RES-2',
      guestName: '김영희',
      guestPhone: '010-2345-6789',
      checkIn: '2024-07-03T15:00:00.000Z',
      checkOut: '2024-07-05T11:00:00.000Z',
      totalAmount: 300000,
      status: 'pending',
      adults: 4,
      children: 1,
      totalGuests: 5,
      bbq: { grillCount: 2, meatSetCount: 2, fullSetCount: 0 },
      meal: { breakfastCount: 2 },
      transport: { needsBus: true },
      experience: { farmExperienceCount: 2 },
      extra: { laundryCount: 1 },
      nights: 2,
      basePrice: 150000,
      createdAt: 1719910000000
    },
    {
      id: 'RES-3',
      guestName: '박철수',
      guestPhone: '010-3456-7890',
      checkIn: '2024-07-10T15:00:00.000Z',
      checkOut: '2024-07-12T11:00:00.000Z',
      totalAmount: 320000,
      status: 'cancelled',
      adults: 3,
      children: 2,
      totalGuests: 5,
      bbq: { grillCount: 1, meatSetCount: 1, fullSetCount: 1 },
      meal: { breakfastCount: 3 },
      transport: { needsBus: false },
      experience: { farmExperienceCount: 1 },
      extra: { laundryCount: 0 },
      nights: 2,
      basePrice: 160000,
      createdAt: 1719920000000
    },
    {
      id: 'RES-4',
      guestName: '이민정',
      guestPhone: '010-4567-8901',
      checkIn: '2024-07-15T15:00:00.000Z',
      checkOut: '2024-07-16T11:00:00.000Z',
      totalAmount: 180000,
      status: 'confirmed',
      adults: 2,
      children: 1,
      totalGuests: 3,
      bbq: { grillCount: 0, meatSetCount: 0, fullSetCount: 0 },
      meal: { breakfastCount: 1 },
      transport: { needsBus: false },
      experience: { farmExperienceCount: 0 },
      extra: { laundryCount: 0 },
      nights: 1,
      basePrice: 180000,
      createdAt: 1719930000000
    }
  ],
  setReservations: (reservations) => set({ reservations }),
  addReservation: (reservation) =>
    set((state) => ({
      reservations: [...state.reservations, reservation],
    })),
  updateReservation: (id, reservation) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...reservation } : r
      ),
    })),
  deleteReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),
}));

interface ReservationContextType {
  reservations: Reservation[];
  setReservations: (reservations: Reservation[]) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const store = useReservationStore();

  return (
    <ReservationContext.Provider value={store}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
} 