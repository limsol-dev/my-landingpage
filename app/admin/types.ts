export type ProgramType = 'healing' | 'family' | 'friendship';

export interface Program {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface AdditionalOption {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface CancellationPolicy {
  refundRate: number;
  cancellationPeriod: number;
}

export interface Settings {
  pensionName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  address: string;
  bankAccount: BankAccount;
  checkInTime: string;
  checkOutTime: string;
  autoConfirm: boolean;
  allowPartialPayment: boolean;
  cancellationPolicy: CancellationPolicy;
  programs: Program[];
  additionalOptions: AdditionalOption[];
}

export const defaultSettings: Settings = {
  programs: [
    {
      id: 'healing',
      name: '힐링 프로그램',
      price: 700000,
      description: '2인 기준, 1박 2일'
    },
    {
      id: 'family',
      name: '패밀리 프로그램',
      price: 800000,
      description: '4인 기준, 1박 2일'
    },
    {
      id: 'friendship',
      name: '우정 프로그램',
      price: 400000,
      description: '2인 기준, 1박 2일'
    }
  ],
  additionalOptions: [
    {
      id: 'grill',
      name: '그릴 대여',
      price: 30000,
      description: '숯, 그릴 세트 포함',
      available: true
    },
    {
      id: 'meat',
      name: '고기 셋트',
      price: 50000,
      description: '2인 기준',
      available: true
    }
  ],
  checkInTime: '15:00',
  checkOutTime: '11:00',
  cancellationPolicy: {
    refundRate: 100,
    cancellationPeriod: 14
  },
  bankAccount: {
    bankName: '농협',
    accountNumber: '351-0322-8946-53',
    accountHolder: '임솔'
  },
  address: '강원도 강릉시 사천면 진리해변길 79-7',
  contactNumber: '010-1234-5678',
  pensionName: '달팽이 아지트 펜션',
  ownerName: '임솔',
  email: 'admin@pension.com',
  autoConfirm: true,
  allowPartialPayment: true
};

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  programId: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
  additionalOptions: { id: string; quantity: number }[];
  createdAt: string;
  updatedAt: string;
};

export type ReservationContextType = {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  isLoading: boolean;
}; 