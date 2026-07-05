import { type ThemeColors } from "./types";
import { theme as defaultTheme } from "./default";
import { theme as oxocarbonTheme } from "./oxocarbon";
import { theme as tokyoNightTheme } from "./tokyo-night";
import { useAppState } from "../state";

const themes: Record<string, ThemeColors> = {
  default: defaultTheme,
  oxocarbon: oxocarbonTheme,
  "tokyo-night": tokyoNightTheme,
};

export function getTheme(name: string): ThemeColors {
  return themes[name] ?? defaultTheme;
}

export function getThemeNames(): string[] {
  return Object.keys(themes);
}

export function useTheme(): ThemeColors {
  const { state } = useAppState();
  return getTheme(state.config.theme);
}
