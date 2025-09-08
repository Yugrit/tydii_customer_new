// app/(tabs)/index.tsx
import FavouriteLaundry from '@/components/FavouriteLaundary'
import OfferedLaundry from '@/components/OfferedLaundary'
import Services from '@/components/Services'
import Loader from '@/components/ui/Loader'
import MainCard from '@/components/ui/MainCard'
import {
  logout,
  transformUserData,
  userLoginState
} from '@/Redux/slices/userSlices'
import ApiService from '@/services/ApiService'
import { storeData_MMKV } from '@/services/StorageService'
import { useRouter } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

interface JWTPayload {
  sub: string
  exp: number
  iat: number
  [key: string]: any
}

export default function HomePage () {
  const dispatch = useDispatch()
  const router = useRouter()
  const { token, userData, isApproved } = useSelector(
    (state: any) => state.user
  )

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkAndFetchUserData () {
      // If no token, redirect to login
      if (!token) {
        console.log('❌ No token found, redirecting to login')
        router.replace('/auth/login')
        return
      }

      // If userData is missing or incomplete, fetch it
      if (!userData || !userData.id) {
        console.log('📡 UserData missing, fetching from API...')
        setLoading(true)

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

          const serverUserData = response.data?.[0]

          if (!serverUserData) {
            throw new Error('No user data from API')
          }

          // Transform server data
          const transformedUserData = transformUserData(serverUserData)

          // Update Redux state
          dispatch(
            userLoginState({
              token: token,
              isApproved: true,
              userData: transformedUserData
            })
          )

          // Save to MMKV for future app launches
          storeData_MMKV('user-data', transformedUserData)

          console.log('✅ User data fetched and saved')
        } catch (error) {
          console.error('❌ Failed to fetch user data:', error)

          // Clear invalid token and redirect to login
          dispatch(logout())
          router.replace('/auth/login')
        } finally {
          setLoading(false)
        }
      } else {
        console.log('✅ UserData already available:', userData.name)
      }
    }

    checkAndFetchUserData()
  }, [token, userData, dispatch, router])

  // Show loader while fetching user data
  if (loading) {
    return (
      <Loader
        message='Loading your profile...'
        subMessage='Please wait while we fetch your data'
        color='#008ECC'
      />
    )
  }

  // Show loader if we have token but no userData yet
  if (token && (!userData || !userData.id)) {
    return <Loader message='Preparing your account...' color='#008ECC' />
  }

  console.log('✅ Rendering HomePage with user:', userData?.name)

  return (
    <ScrollView style={styles.container}>
      <MainCard
        title='Clothing Services'
        description='Having a pet means you have more joy, a new friend, a happy person who will always be with'
        button={true}
        buttonText='Schedule Your Pickup'
      />
      <Services />
      <FavouriteLaundry />
      <OfferedLaundry />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 10
  }
})
