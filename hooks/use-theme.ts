import { useColorScheme } from 'react-native';
import { Colors, DarkColors } from '../constants/theme';

export function useTheme() {
  const colorScheme = useColorScheme();
  
  // You can extend this to use a manual setting from a context/store
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkColors : Colors;

  return {
    theme,
    isDark,
    colorScheme,
  };
}
