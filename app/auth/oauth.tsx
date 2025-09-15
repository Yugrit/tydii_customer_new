import { userLoginState } from '@/Redux/slices/userSlices'
import { storeData_MMKV } from '@/services/StorageService'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
export default function AuthCallback () {
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token?: string }>()
  const dispatch = useDispatch()
  useEffect(() => {
    const saveAndRedirect = async () => {
      if (token) {
        console.log('Checking OAUTH', token)
        dispatch(userLoginState({ token, isApproved: true, userData: {} }))
        storeData_MMKV('user-token', token)
        // Redirect to home tab
        router.replace('/(tabs)')
      } else {
        // No token? Redirect to login or error
        console.log('GOING LOGIN')
        router.replace('./login')
      }
    }
    saveAndRedirect()
  }, [token])

  return null // optional: show loader while processing
}
