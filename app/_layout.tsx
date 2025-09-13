// app/_layout.tsx - FIXED VERSION
import ToastContainer from '@/components/ui/ToastContainer'
import { userLoginState } from '@/Redux/slices/userSlices'
import FCMService from '@/services/FCMService'
import { getData_MMKV } from '@/services/StorageService'
import '@react-native-firebase/app'
import { getApp } from '@react-native-firebase/app'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Href, Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useRef, useState } from 'react'
import 'react-native-reanimated'
import { Provider, useDispatch } from 'react-redux'
import store from '../Redux/Store'
import './services/FCMBackgroundHandler'

SplashScreen.preventAutoHideAsync()

// Inner component that uses Redux hooks
function AppContent () {
  const { useColorScheme } = require('@/hooks/useColorScheme') // Import inside component
  const { colorScheme } = useColorScheme()
  const dispatch = useDispatch()

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  useEffect(() => {
    // firebase.initializeApp(firebaseConfig)
    try {
      const app = getApp() // ensures the default app exists
      console.log('Firebase app initialized:', app.name)

      FCMService.initialize() // your FCM logic
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
    if (hasRun.current) {
      console.log('🔒 Auth check already completed, skipping...')
      return
    }

    if (!loaded) {
      console.log('⏳ Waiting for fonts to load...')
      return
    }

    hasRun.current = true
    console.log('🚀 Starting auth check (FIRST TIME)...')

    let isCancelled = false

    function checkSavedAuth () {
      try {
        console.log('🔍 Checking saved authentication...')

        const savedToken = getData_MMKV('user-token')

        console.log('📋 Auth status:', {
          hasToken: !!savedToken
        })

        if (!savedToken || savedToken.length === 0) {
          console.log('❌ No token found')
          if (!isCancelled) {
            setAuthState('unauthenticated')
          }
          return
        }

        console.log('✅ Loading saved user data to Redux')
        if (!isCancelled) {
          store.dispatch(
            userLoginState({
              token: savedToken,
              isApproved: true
            })
          )

          console.log('✅ User data loaded to Redux store')
          setAuthState('authenticated')
          console.log('✅ Authentication complete')
        }
      } catch (error) {
        console.error('❌ Auth check error:', error)
        if (!isCancelled) {
          setAuthState('unauthenticated')
        }
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

  if (!loaded || authState === 'loading') {
    console.log('⏳ Splash screen visible...', { loaded, authState })
    return null
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
      <ToastContainer></ToastContainer>
    </Provider>
  )
}
