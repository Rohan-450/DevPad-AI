import { darkColors, lightColors } from "@/constants/colors";
import { useSettingsStore } from "@/store/settingsStore";
import { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { ThemeContext } from "./theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const mode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  const isDarkMode =
    mode === "system" ? systemColorScheme === "dark" : mode === "dark";
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{ colors, isDarkMode, mode, toggleTheme: setThemeMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
