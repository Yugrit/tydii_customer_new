// app/_layout.tsx - FIXED VERSION
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Href, Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { jwtDecode } from 'jwt-decode'
import React, { useEffect, useRef, useState } from 'react'
import 'react-native-reanimated'
import { Provider } from 'react-redux'

import { useColorScheme } from '@/hooks/useColorScheme'
import { userLoginState } from '@/Redux/slices/userSlices'
import ApiService from '@/services/ApiService'
import { getData_MMKV, storeData_MMKV } from '@/services/StorageService'
import store from '../Redux/Store'

interface JWTPayload {
  sub: string
  exp: number
  iat: number
  [key: string]: any
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout () {
  const { colorScheme } = useColorScheme()
  // clearStorage_MMKV()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  const [authState, setAuthState] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading')
  const router = useRouter()

  // ✅ Use useRef to prevent multiple runs
  const hasRun = useRef(false)

  useEffect(() => {
    // ✅ Only check if already ran, not fonts
    if (hasRun.current) {
      console.log('🔒 Auth check already completed, skipping...')
      return
    }

    // ✅ Wait for fonts to load before running auth check
    if (!loaded) {
      console.log('⏳ Waiting for fonts to load...')
      return
    }

    hasRun.current = true
    console.log('🚀 Starting auth check (FIRST TIME)...')

    let isCancelled = false

    async function checkAuthAndFetchData () {
      try {
        console.log('🔍 Checking authentication...')

        const savedToken = getData_MMKV('user-token')
        const savedUserData = getData_MMKV('user-data')

        console.log('📋 Auth status:', {
          hasToken: !!savedToken,
          hasUserData: !!savedUserData
        })

        if (!savedToken || savedToken.length === 0) {
          console.log('❌ No token found')
          if (!isCancelled) {
            setAuthState('unauthenticated')
          }
          return
        }

        if (!savedUserData) {
          console.log('📡 Fetching user data from API...')
          await fetchUserData(savedToken)
        } else {
          console.log('✅ Using saved user data')
          if (!isCancelled) {
            store.dispatch(
              userLoginState({
                token: savedToken,
                isApproved: true,
                user: savedUserData
              })
            )
          }
        }

        if (!isCancelled) {
          setAuthState('authenticated')
          console.log('✅ Authentication complete')
        }
      } catch (error) {
        console.error('❌ Auth error:', error)
        if (!isCancelled) {
          setAuthState('unauthenticated')
        }
      }
    }

    async function fetchUserData (token: string) {
      try {
        const decodedToken = jwtDecode<JWTPayload>(token)
        const userId = decodedToken.sub

        if (!userId) {
          throw new Error('No userId in token')
        }

        console.log('🆔 Fetching user profile for:', userId)

        const response = await ApiService.get({
          url: `/customer/users`,
          params: { id: userId, limit: 10, page: 1 }
        })

        console.log('📊 API Response received')

        const userData = response.data?.[0]

        if (!userData) {
          throw new Error('No user data from API')
        }

        if (!isCancelled) {
          store.dispatch(
            userLoginState({
              token: token,
              isApproved: userData.isApproved || 'approved'
            })
          )

          console.log(userData)

          storeData_MMKV('user-data', userData)
          console.log('✅ User data fetched and saved')
        }
      } catch (apiError) {
        console.error('❌ API error:', apiError)

        if (!isCancelled) {
          try {
            const decodedToken = jwtDecode<JWTPayload>(token)
            const fallbackData = {
              id: decodedToken.sub,
              isApproved: 'approved',
              name: 'User'
            }

            store.dispatch(
              userLoginState({
                token: token,
                isApproved: 'approved',
                user: fallbackData
              })
            )

            console.log('⚠️ Using fallback user data')
          } catch (fallbackError) {
            console.error('❌ Fallback failed:', fallbackError)
          }
        }
      }
    }

    checkAuthAndFetchData()

    return () => {
      isCancelled = true
    }
  }, [loaded]) // ✅ Depend on loaded so it runs when fonts are ready

  // ✅ Handle navigation
  useEffect(() => {
    if (authState === 'loading') return

    console.log('🔄 Auth state changed to:', authState)

    const navigate = async () => {
      try {
        // Small delay to ensure navigation is ready
        await new Promise(resolve => setTimeout(resolve, 100))

        if (authState === 'authenticated') {
          console.log('🔄 Navigating to tabs...')
          router.replace('/(tabs)' as Href)
        } else {
          console.log('🔄 Navigating to auth...')
          router.replace('/auth/login')
        }

        await SplashScreen.hideAsync()
        console.log('✅ Navigation complete, splash hidden')
      } catch (navError) {
        console.error('❌ Navigation error:', navError)
        SplashScreen.hideAsync()
      }
    }

    navigate()
  }, [authState])

  // ✅ Keep splash screen visible during loading
  if (!loaded || authState === 'loading') {
    console.log('⏳ Splash screen visible...', { loaded, authState })
    return null
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='auth' options={{ headerShown: false }} />
          <Stack.Screen name='(tabs)/(home)' options={{ headerShown: false }} />
          <Stack.Screen name='+not-found' />
        </Stack>
        <StatusBar style='auto' />
      </ThemeProvider>
    </Provider>
  )
}
