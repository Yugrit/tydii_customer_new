// hooks/useColorScheme.ts
import {
  ColorScheme,
  setThemePreference,
  toggleTheme
} from '@/Redux/slices/themeSlice'
import { RootState } from '@/Redux/Store'
import { useColorScheme as useNativeColorScheme } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

export function useColorScheme () {
  const dispatch = useDispatch()
  const systemColorScheme = useNativeColorScheme()
  const themePreference = useSelector(
    (state: RootState) => state.theme.themePreference
  )

  const currentTheme =
    themePreference === 'auto'
      ? systemColorScheme ?? 'light'
      : (themePreference as 'light' | 'dark')

  const setColorScheme = (scheme: ColorScheme) => {
    dispatch(setThemePreference(scheme))
  }

  const toggleThemeMode = () => {
    dispatch(toggleTheme())
  }

  return {
    colorScheme: currentTheme,
    themePreference,
    setColorScheme,
    toggleTheme: toggleThemeMode,
    isSystemTheme: themePreference === 'auto',
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light'
  }
}

export { ColorScheme }
