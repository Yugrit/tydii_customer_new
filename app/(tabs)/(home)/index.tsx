// app/(tabs)/index.tsx
import { userLoginState } from '@/Redux/slices/userSlices'
import FavouriteLaundry from '@/components/FavouriteLaundary'
import OfferedLaundry from '@/components/OfferedLaundary'
import Services from '@/components/Services'
import Loader from '@/components/ui/Loader'
import MainCard from '@/components/ui/MainCard'
import ApiService from '@/services/ApiService'
import {
  clearStorage_MMKV,
  getData_MMKV,
  storeData_MMKV
} from '@/services/StorageService'
import { router } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

// ✅ Interface for JWT
interface JWTPayload {
  sub: string
  exp: number
  iat: number
  [key: string]: any
}

export default function HomePage () {
  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.user)

  // console.log(getData_MMKV('user-token'))

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const token = user?.token
  const isApproved = user?.isApproved

  // 🔄 Fetch user from API
  const fetchFromAPI = async () => {
    if (!token) return
    try {
      setLoading(true)
      const decodedToken = jwtDecode<JWTPayload>(token)
      const userId = decodedToken.sub

      const response = await ApiService.get({
        url: `/customer/users`,
        params: { id: userId, limit: 1, page: 1 }
      })

      const freshUser = response.data?.[0]
      if (freshUser) {
        setUserData(freshUser)
        storeData_MMKV('user-data', JSON.stringify(freshUser))

        // update redux
        dispatch(
          userLoginState({
            token,
            isApproved: freshUser.isApproved || 'approved'
          })
        )
      }
    } catch (error) {
      console.error('❌ Error fetching user from API:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ On mount - first try MMKV, else API
  useEffect(() => {
    async function init () {
      try {
        setLoading(true)
        const savedUserData = getData_MMKV('user-data')

        if (savedUserData) {
          console.log('📦 Loaded from MMKV:', savedUserData)
          setUserData(JSON.parse(savedUserData))
        } else {
          await fetchFromAPI()
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [token])

  // ✅ Logout
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            dispatch(
              userLoginState({ token: '', isApproved: false, user: null })
            )
            clearStorage_MMKV()
            router.replace('/auth/login')
          } catch (error) {
            Alert.alert('Error', 'Logout failed')
          }
        }
      }
    ])
  }

  // ✅ Loader
  if (loading) {
    return <Loader />
  }

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
  container: { flex: 1, backgroundColor: '#F9FAFB' }
})
