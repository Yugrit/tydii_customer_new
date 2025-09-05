// hooks/useThemeColors.ts
import { useColorScheme } from './useColorScheme'

const lightTheme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#023B64',
  secondary: 'black',
  text: '#000000',
  textSecondary: '#242B33',
  border: '#E0E0E0',
  light: '#E6F2F7',
  notification: '#FF4757'
}

const darkTheme = {
  background: '#000000',
  surface: '#1A1A1A',
  primary: '#3498db',
  secondary: '#2980b9',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: '#333333',
  light: '#E6F2F7',
  notification: '#FF6B7A'
}

export function useThemeColors () {
  const { colorScheme } = useColorScheme()

  return colorScheme === 'dark' ? darkTheme : lightTheme
}
