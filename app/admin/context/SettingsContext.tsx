'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Settings } from '../types';

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { settings, setSettings, updateSettings } = useSettingsStore();

  return (
    <SettingsContext.Provider value={{ settings, setSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 