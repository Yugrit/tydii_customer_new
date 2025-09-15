// Using MMKV (memory map key value) instead of async storage because it is 30x faster and also supports encryprtion.

import { jwtDecode } from 'jwt-decode'
import { MMKV } from 'react-native-mmkv'

// Initializing MMKV storage
export const storage = new MMKV({
  id: 'app-storage'
})

// Method for storing data in MMKV
export const storeData_MMKV = (key: any, value: string) => {
  console.log(key, 'asynData', value)
  try {
    storage.set(key, value)
  } catch (err) {
    console.log('Error storing Access token', err)
  }
}

// Method for getting data from MMKV

export const getData_MMKV = (key: string) => {
  try {
    const data = storage.getString(key)
    return data
  } catch (err) {
    console.log('Error retrieving access token', err)
    return null
  }
}

// Method for checking token expiry

export const isTokenExpired = (accessToken: string) => {
  const decodedToken = jwtDecode(accessToken)
  const currentTime = Date.now() / 1000
  //@ts-ignore
  return decodedToken.exp < currentTime
}

// Method to remove all keys from MMKV

export const clearStorage_MMKV = () => {
  try {
    storage.clearAll()
  } catch (err) {
    console.log('Error removing tokens', err)
  }
}
