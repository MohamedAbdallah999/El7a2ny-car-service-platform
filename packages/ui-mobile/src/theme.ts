export const colors = {
  primary: "#E7000B",
  primaryReference: "#DC2626",
  primaryHover: "#B91C1C",
  primarySoft: "#FEF2F2",
  background: "#FFFFFF",
  backgroundSubtle: "#F7F7F7",
  surface: "#FFFFFF",
  surfaceMuted: "#F0F0F0",
  surfaceSubtle: "#F5F5F5",
  surfaceHover: "#F9F9F9",
  textPrimary: "#0F0F0F",
  textSecondary: "#555555",
  textTertiary: "#666666",
  textMuted: "#999999",
  placeholder: "#AAAAAA",
  disabled: "#CCCCCC",
  border: "#E5E5E5",
  borderStrong: "#BBBBBB",
  darkPlatform: "#0A0A0A",
  darkSurface: "#1A1A1A",
  darkBorder: "#1F1F1F",
  darkDivider: "#2A2A2A",
  darkSubtle: "#333333",
  darkHover: "#222222",
  darkMuted: "#888888",
  success: "#16A34A",
  successText: "#008236",
  successBackground: "#F0FDF4",
  successBorder: "#BBF7D0",
  warning: "#D97706",
  warningText: "#BB4D00",
  warningBackground: "#FFFBEB",
  warningBorder: "#FEE685",
  rating: "#FFB900",
  info: "#1D4ED8",
  infoText: "#1447E6",
  infoBackground: "#EFF6FF",
  infoBorder: "#BEDBFF",
  error: "#EF4444",
  errorText: "#C10007",
  errorBackground: "#FEF2F2",
  errorBorder: "#FFC9C9",
  phoneFrame: "#EBEBEB",
} as const;

export const typography = {
  fontFamily: "Manrope",
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    twoXl: 24,
    threeXl: 30,
    fourXl: 36,
    fiveXl: 48,
  },
  fontWeights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
  lineHeights: {
    tight: 1.15,
    heading: 1.25,
    body: 1.5,
    relaxed: 1.625,
  },
} as const;

export const spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
  ten: 40,
  twelve: 48,
  sixteen: 64,
} as const;

export const radii = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
  phoneFrame: 54,
  phoneScreen: 44,
} as const;

export const layout = {
  webMaxWidth: 1280,
  webPadding: 24,
  mobilePadding: 16,
  sidebarWidth: 224,
  adminHeaderHeight: 48,
  customerHeaderHeight: 56,
  platformBarHeight: 40,
  controlMinHeight: 44,
  touchTarget: 44,
  bottomNavigationHeight: 64,
} as const;

export const motion = {
  fast: 150,
  progress: 300,
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  layout,
  motion,
} as const;

export type AppTheme = typeof theme;
