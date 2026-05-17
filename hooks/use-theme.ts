import { Colors } from '../constants/theme';

export function useTheme() {
  return {
    theme: Colors,
    isDark: false,
    colorScheme: 'light' as const,
    toggleTheme: () => {},
  };
}
