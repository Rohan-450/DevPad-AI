// Shared tokens that don't change between light & dark themes.
// Anything that should adapt belongs in lightColors / darkColors.
const sharedColors = {
  // Language brand colors (industry-standard, fixed)
  langJs: "#F7DF1E",
  langTs: "#3178C6",
  langPython: "#3776AB",
  langJava: "#007396",
  langGo: "#00ADD8",
  langRust: "#DEA584",
  langSwift: "#F05138",
  langKotlin: "#7F52FF",

  // AI gradient (signature accent — same in both themes)
  aiGradientStart: "#00F0FF",
  aiGradientEnd: "#7000FF",

  // Material 3 "fixed" tokens are theme-invariant by spec
  primaryFixed: "#7df4ff",
  primaryFixedDim: "#00dbe9",
  onPrimaryFixed: "#002022",
  onPrimaryFixedVariant: "#004f54",
  secondaryFixed: "#e3e2e6",
  secondaryFixedDim: "#c7c6ca",
  onSecondaryFixed: "#1a1b1e",
  onSecondaryFixedVariant: "#46474a",
  tertiaryFixed: "#dfe2ee",
  tertiaryFixedDim: "#c3c6d2",
  onTertiaryFixed: "#181c24",
  onTertiaryFixedVariant: "#434750",

  // Always-white / always-black slots
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const lightColors = {
  ...sharedColors,

  // -- Surfaces ------------------------------------------------------------
  background: "#fdfcff",
  onBackground: "#1a1c1e",
  surface: "#fdfcff",
  surfaceDim: "#ddd9e0",
  surfaceBright: "#fdfcff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f7f3fa",
  surfaceContainer: "#f1edf5",
  surfaceContainerHigh: "#ebe7ef",
  surfaceContainerHighest: "#e5e1e9",
  surfaceVariant: "#dbe4e5",
  onSurface: "#1a1c1e",
  onSurfaceVariant: "#3f484a",
  inverseSurface: "#2f3033",
  inverseOnSurface: "#f1f0f4",
  surfaceTint: "#006874",
  outline: "#6f797a",
  outlineVariant: "#bfc8c9",

  // -- Brand (electric cyan, deeper for contrast on white) ----------------
  primary: "#006874",
  onPrimary: "#ffffff",
  primaryContainer: "#97f0ff",
  onPrimaryContainer: "#001f24",
  inversePrimary: "#4fd8eb",

  secondary: "#4a6365",
  onSecondary: "#ffffff",
  secondaryContainer: "#cce8ea",
  onSecondaryContainer: "#051f21",

  tertiary: "#525e7d",
  onTertiary: "#ffffff",
  tertiaryContainer: "#dae2ff",
  onTertiaryContainer: "#0c1b37",

  // -- Status -------------------------------------------------------------
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#410002",
  success: "#2E7D32",
  warning: "#B26900",
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  ...sharedColors,

  // -- Surfaces (from DESIGN.md) -------------------------------------------
  background: "#121316",
  onBackground: "#e3e2e6",
  surface: "#121316",
  surfaceDim: "#121316",
  surfaceBright: "#38393c",
  surfaceContainerLowest: "#0d0e11",
  surfaceContainerLow: "#1b1b1f",
  surfaceContainer: "#1f1f23",
  surfaceContainerHigh: "#292a2d",
  surfaceContainerHighest: "#343538",
  surfaceVariant: "#343538",
  onSurface: "#e3e2e6",
  onSurfaceVariant: "#b9cacb",
  inverseSurface: "#e3e2e6",
  inverseOnSurface: "#303034",
  surfaceTint: "#00dbe9",
  outline: "#849495",
  outlineVariant: "#3b494b",

  // -- Brand (pale cyan reads on near-black) ------------------------------
  primary: "#dbfcff",
  onPrimary: "#00363a",
  primaryContainer: "#00f0ff",
  onPrimaryContainer: "#006970",
  inversePrimary: "#006970",

  secondary: "#c7c6ca",
  onSecondary: "#2f3033",
  secondaryContainer: "#48494c",
  onSecondaryContainer: "#b9b8bc",

  tertiary: "#f4f5ff",
  onTertiary: "#2c3039",
  tertiaryContainer: "#d6d9e5",
  onTertiaryContainer: "#5b5f69",

  // -- Status -------------------------------------------------------------
  error: "#FF4D4D",
  onError: "#690005",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",
  success: "#4CAF50",
  warning: "#FF9800",
};
