import { create } from 'zustand';
import { Settings } from '@/app/admin/types';

const defaultSettings: Settings = {
  pensionName: '달팽이아지트펜션',
  ownerName: '',
  contactNumber: '',
  email: '',
  address: '',
  bankAccount: {
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  },
  checkInTime: '15:00',
  checkOutTime: '11:00',
  autoConfirm: false,
  allowPartialPayment: false,
  cancellationPolicy: {
    refundRate: 100,
    cancellationPeriod: 1
  },
  programs: [
    {
      id: '1',
      name: '기본 객실',
      description: '2인 기준 객실',
      price: 150000
    }
  ],
  additionalOptions: [
    {
      id: '1',
      name: '조식 서비스',
      description: '아침 식사 제공',
      price: 15000,
      available: true
    }
  ]
};

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  setSettings: (settings) => set({ settings }),
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
})); 