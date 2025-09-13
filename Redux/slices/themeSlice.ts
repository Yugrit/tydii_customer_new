// Redux/slices/themeSlice.ts
import { getData_MMKV, storeData_MMKV } from '@/services/StorageService'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ColorScheme = 'light' | 'dark' | 'auto'

interface ThemeState {
  themePreference: ColorScheme
}

const initialState: ThemeState = {
  themePreference: (getData_MMKV('theme') as ColorScheme) ?? 'light'
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemePreference: (state, action: PayloadAction<ColorScheme>) => {
      state.themePreference = action.payload
      storeData_MMKV('theme', action.payload)
    },
    toggleTheme: state => {
      const newTheme = state.themePreference === 'light' ? 'dark' : 'light'
      state.themePreference = newTheme
      storeData_MMKV('theme', newTheme)
    }
  }
})

export const { setThemePreference, toggleTheme } = themeSlice.actions
export default themeSlice.reducer
