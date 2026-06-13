import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DifficultyConfig } from '@/types/difficultyConfig';
import { DEFAULT_DIFFICULTY_CONFIG } from '@/types/difficultyConfig';

interface DifficultyConfigState {
  config: DifficultyConfig;
  setConfig: (config: DifficultyConfig) => void;
  updateSection: <K extends keyof DifficultyConfig>(key: K, value: DifficultyConfig[K]) => void;
  resetConfig: () => void;
}

export const useDifficultyConfigStore = create<DifficultyConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_DIFFICULTY_CONFIG,
      setConfig: (config) => set({ config }),
      updateSection: (key, value) =>
        set((state) => ({
          config: { ...state.config, [key]: value },
        })),
      resetConfig: () => set({ config: DEFAULT_DIFFICULTY_CONFIG }),
    }),
    {
      name: 'difficulty-config-storage',
    }
  )
);
