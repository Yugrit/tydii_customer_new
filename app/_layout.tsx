// app/_layout.tsx - With jwt-decode Library
import ToastContainer from '@/components/ui/ToastContainer'
import { userLoginState } from '@/Redux/slices/userSlices'
import FCMService from '@/services/FCMService'
import {
  clearStorage_MMKV,
  getData_MMKV,
  storeData_MMKV
} from '@/services/StorageService'
import '@react-native-firebase/app'
import { getApp } from '@react-native-firebase/app'
import {
  DarkTheme,
  DefaultTheme,
  LinkingOptions,
  ThemeProvider
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import { Href, Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useRef, useState } from 'react'
import 'react-native-reanimated'
import { Provider, useDispatch } from 'react-redux'
import store from '../Redux/Store'

SplashScreen.preventAutoHideAsync()

// JWT Token payload interface
interface TokenPayload {
  sub: number
  email?: string
  name?: string
  iat: number
  exp: number
  jti?: string
}

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token)
    const currentTime = Math.floor(Date.now() / 1000)
    const bufferTime = 300 // 5 minutes buffer before actual expiry

    console.log('🔍 Token expiry check:', {
      currentTime,
      tokenExp: decoded.exp,
      isExpired: decoded.exp <= currentTime + bufferTime,
      timeRemaining: decoded.exp - currentTime,
      userId: decoded.sub
    })

    return decoded.exp <= currentTime + bufferTime
  } catch (error) {
    console.error('❌ Error decoding token:', error)
    return true // Consider invalid tokens as expired
  }
}

// Check if refresh token is expired
const isRefreshTokenExpired = (refreshToken: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(refreshToken)
    const currentTime = Math.floor(Date.now() / 1000)

    console.log('🔍 Refresh token expiry check:', {
      currentTime,
      refreshExp: decoded.exp,
      isExpired: decoded.exp <= currentTime,
      timeRemaining: decoded.exp - currentTime,
      jti: decoded.jti
    })

    return decoded.exp <= currentTime
  } catch (error) {
    console.error('❌ Error decoding refresh token:', error)
    return true
  }
}

// Get token info
const getTokenInfo = (token: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(token)
  } catch (error) {
    console.error('❌ Error getting token info:', error)
    return null
  }
}

// Token refresh function
const refreshAccessToken = async (): Promise<{
  accessToken: string
  refreshToken: string
} | null> => {
  try {
    console.log('🔄 Attempting to refresh access token...')

    const refreshToken = getData_MMKV('refresh-token')

    if (!refreshToken) {
      console.log('❌ No refresh token found')
      return null
    }

    // Check if refresh token is expired
    if (isRefreshTokenExpired(refreshToken)) {
      console.log('❌ Refresh token is expired')
      return null
    }

    // Log refresh token info
    const refreshTokenInfo = getTokenInfo(refreshToken)
    if (refreshTokenInfo) {
      console.log('🔍 Refresh token info:', {
        userId: refreshTokenInfo.sub,
        jti: refreshTokenInfo.jti,
        expiresAt: new Date(refreshTokenInfo.exp * 1000).toISOString()
      })
    }

    console.log('📤 Calling refresh token API...')

    const response = await fetch('https://dev.tydii.io/api/auth/refresh', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Refresh token API failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      return null
    }

    const data = await response.json()

    console.log('✅ Token refresh successful')

    // Log new token info
    const newAccessTokenInfo = getTokenInfo(data.accessToken)
    const newRefreshTokenInfo = getTokenInfo(data.refreshToken)

    if (newAccessTokenInfo) {
      console.log('🔍 New access token info:', {
        userId: newAccessTokenInfo.sub,
        expiresAt: new Date(newAccessTokenInfo.exp * 1000).toISOString(),
        email: newAccessTokenInfo.email
      })
    }

    if (newRefreshTokenInfo) {
      console.log('🔍 New refresh token info:', {
        userId: newRefreshTokenInfo.sub,
        jti: newRefreshTokenInfo.jti,
        expiresAt: new Date(newRefreshTokenInfo.exp * 1000).toISOString()
      })
    }

    // Store new tokens
    storeData_MMKV('user-token', data.accessToken)
    storeData_MMKV('refresh-token', data.refreshToken)

    console.log('✅ New tokens stored')

    return data
  } catch (error) {
    console.error('❌ Token refresh error:', error)
    return null
  }
}

// Get valid access token (refresh if needed)
const getValidAccessToken = async (): Promise<string | null> => {
  try {
    const accessToken = getData_MMKV('user-token')

    if (!accessToken) {
      console.log('❌ No access token found')
      return null
    }

    // Check if access token is expired
    if (!isTokenExpired(accessToken)) {
      console.log('✅ Access token is valid')
      const tokenInfo = getTokenInfo(accessToken)
      if (tokenInfo) {
        console.log('🔍 Valid token info:', {
          userId: tokenInfo.sub,
          expiresAt: new Date(tokenInfo.exp * 1000).toISOString(),
          timeRemaining: tokenInfo.exp - Math.floor(Date.now() / 1000)
        })
      }
      return accessToken
    }

    console.log('⚠️ Access token expired, attempting refresh...')

    // Try to refresh the token
    const refreshResult = await refreshAccessToken()

    if (refreshResult) {
      console.log('✅ Access token refreshed successfully')
      return refreshResult.accessToken
    }

    console.log('❌ Failed to refresh access token')
    return null
  } catch (error) {
    console.error('❌ Error getting valid access token:', error)
    return null
  }
}

// Clear all tokens
const clearTokens = (): void => {
  console.log('🗑️ Clearing all tokens')
  clearStorage_MMKV()
}

// Get user info from token
const getUserInfoFromToken = (
  token: string
): { userId: number; email?: string } | null => {
  try {
    const decoded = jwtDecode<TokenPayload>(token)
    return {
      userId: decoded.sub,
      email: decoded.email
    }
  } catch (error) {
    console.error('❌ Error getting user info from token:', error)
    return null
  }
}

// Inner component that uses Redux hooks
function AppContent () {
  const { useColorScheme } = require('@/hooks/useColorScheme')
  const { colorScheme } = useColorScheme()
  const dispatch = useDispatch()

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  useEffect(() => {
    try {
      const app = getApp()
      console.log('Firebase app initialized:', app.name)
      FCMService.initialize()
    } catch (err) {
      console.error('Firebase initialization error:', err)
    }
  }, [])

  const [authState, setAuthState] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading')
  const router = useRouter()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    if (!loaded) return

    hasRun.current = true
    console.log('🚀 Starting auth check (FIRST TIME)...')

    let isCancelled = false

    async function checkSavedAuth () {
      try {
        const initialUrl = await Linking.getInitialURL()
        if (initialUrl?.startsWith('tydii://auth/oauth')) {
          console.log('ℹ️ Deeplink OAuth detected, skipping _layout auth check')
          setAuthState('authenticated') // Let /auth/oauth handle token
          return
        }
        const pathname = window.location.pathname || '' // Or use usePathname()
        // 1️⃣ Skip auth check for auth routes (OTP, OAuth)
        if (pathname.startsWith('/auth/')) {
          console.log('ℹ️ Auth route detected, skipping check.')
          setAuthState('unauthenticated') // Will let auth page handle it
          return
        }

        const savedToken = getData_MMKV('user-token')
        const refreshToken = getData_MMKV('refresh-token')

        console.log('📋 Auth status:', {
          hasToken: !!savedToken,
          hasRefreshToken: !!refreshToken
        })

        const validToken = await getValidAccessToken()

        if (!validToken) {
          console.log('❌ Cannot get valid access token, clearing tokens')
          clearTokens()
          if (!isCancelled) setAuthState('unauthenticated')
          return
        }

        const userInfo = getUserInfoFromToken(validToken)
        if (!isCancelled) {
          store.dispatch(
            userLoginState({
              token: validToken,
              isApproved: true,
              userId: userInfo?.userId,
              email: userInfo?.email
            })
          )
          setAuthState('authenticated')
        }
      } catch (error) {
        console.error('❌ Auth check error:', error)
        clearTokens()
        if (!isCancelled) setAuthState('unauthenticated')
      }
    }

    checkSavedAuth()
    return () => {
      isCancelled = true
    }
  }, [loaded])

  useEffect(() => {
    if (authState === 'loading') return

    console.log('🔄 Auth state changed to:', authState)

    const navigate = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100))

        if (authState === 'authenticated') {
          console.log('🔄 Navigating to main app...')
          router.replace('/(tabs)' as Href)
        } else {
          console.log('🔄 Navigating to auth...')
          router.replace('/auth/login')
        }

        await SplashScreen.hideAsync()
        console.log('✅ Navigation complete, splash screen hidden')
      } catch (navError) {
        console.error('❌ Navigation error:', navError)
        await SplashScreen.hideAsync()
      }
    }

    navigate()
  }, [authState])

  // Set up periodic token refresh check (every 10 minutes)
  useEffect(() => {
    if (authState !== 'authenticated') return

    console.log('⏰ Setting up periodic token refresh check')

    const checkTokenPeriodically = async () => {
      console.log('🔄 Performing periodic token check...')
      const validToken = await getValidAccessToken()
      if (!validToken) {
        console.log('⚠️ Periodic check: Token invalid, logging out')
        dispatch(
          userLoginState({
            token: '',
            isApproved: false,
            userData: {}
          })
        )
        clearTokens()
        setAuthState('unauthenticated')
      } else {
        console.log('✅ Periodic check: Token is valid')
      }
    }

    // Check immediately
    checkTokenPeriodically()

    // Then check every 10 minutes
    const intervalId = setInterval(checkTokenPeriodically, 10 * 60 * 1000)

    return () => {
      console.log('🧹 Cleaning up periodic token check')
      clearInterval(intervalId)
    }
  }, [authState, dispatch])

  if (!loaded || authState === 'loading') {
    console.log('⏳ Splash screen visible...', { loaded, authState })
    return null
  }

  type RootStackParamList = {
    auth: undefined
    '(tabs)': undefined
    '+not-found': undefined
  }

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['tydii://', 'https://dev.tydii.com'],
    config: {
      screens: {
        auth: 'auth',
        '(tabs)': {
          screens: {
            '(home)': 'home',
            '(setting)': {
              screens: {
                index: 'settings',
                notification: 'notifications'
              }
            }
          }
        },
        '+not-found': '*'
      }
    }
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='auth' options={{ headerShown: false }} />
        <Stack.Screen name='(tabs)/(home)' options={{ headerShown: false }} />
        <Stack.Screen name='+not-found' />
      </Stack>
      <StatusBar style='auto' />
    </ThemeProvider>
  )
}

// Root component with Provider
export default function RootLayout () {
  return (
    <Provider store={store}>
      <AppContent />
      <ToastContainer />
    </Provider>
  )
}

// Export utility functions for use in other parts of the app
export {
  clearTokens,
  getTokenInfo,
  getUserInfoFromToken,
  getValidAccessToken,
  isTokenExpired,
  refreshAccessToken
}
