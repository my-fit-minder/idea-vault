// Force light mode for consistent experience
export function useColorScheme(): 'light' | 'dark' {
  // Always return 'light' to force light mode
  // To enable dark mode in the future, uncomment below:
  // import { useColorScheme as useRNColorScheme } from 'react-native';
  // const colorScheme = useRNColorScheme();
  // return colorScheme ?? 'light';
  return 'light';
}
