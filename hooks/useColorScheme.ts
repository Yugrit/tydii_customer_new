// hooks/useColorScheme.ts
import { getData_MMKV, storeData_MMKV } from '@/services/StorageService'
import { useState } from 'react'
import { useColorScheme as useNativeColorScheme } from 'react-native'

export type ColorScheme = 'light' | 'dark' | 'auto'

export function useColorScheme () {
  const systemColorScheme = useNativeColorScheme()
  const [themePreference, setThemePreference] = useState<ColorScheme>(() => {
    // Initialize from MMKV storage
    return (getData_MMKV('theme') as ColorScheme) ?? 'auto'
  })

  const currentTheme =
    themePreference === 'auto'
      ? systemColorScheme ?? 'light'
      : (themePreference as 'light' | 'dark')

  const setColorScheme = (scheme: ColorScheme) => {
    setThemePreference(scheme)
    storeData_MMKV('theme')
  }

  return {
    colorScheme: currentTheme,
    themePreference,
    setColorScheme,
    isSystemTheme: themePreference === 'auto',
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light'
  }
}
