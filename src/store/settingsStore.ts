import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FontSize = 12 | 13 | 14 | 16;
export const FONT_SIZES: FontSize[] = [12, 13, 14, 16];

// OpenRouter model id. Free models change over time — keep this as a
// configurable Settings field, default to a current free pick.
export const DEFAULT_AI_MODEL = "nex-agi/nex-n2-pro:free";

type SettingsState = {
  themeMode: ThemeMode;
  defaultLanguage: string;
  fontSize: FontSize;
  aiModel: string;
  setThemeMode: (mode: ThemeMode) => void;
  setDefaultLanguage: (lang: string) => void;
  setFontSize: (size: FontSize) => void;
  setAiModel: (model: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      defaultLanguage: "javascript",
      fontSize: 13,
      aiModel: DEFAULT_AI_MODEL,
      setThemeMode: (mode) => set({ themeMode: mode }),
      setDefaultLanguage: (lang) => set({ defaultLanguage: lang }),
      setFontSize: (size) => set({ fontSize: size }),
      setAiModel: (model) => set({ aiModel: model.trim() || DEFAULT_AI_MODEL }),
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        defaultLanguage: state.defaultLanguage,
        fontSize: state.fontSize,
        aiModel: state.aiModel,
      }),
    },
  ),
);
