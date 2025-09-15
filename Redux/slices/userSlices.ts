// Redux/slices/userSlices.ts
import { createSlice } from '@reduxjs/toolkit'

interface Address {
  id: number
  house_no: string
  street_address: string | null
  landmark: string
  city: string
  address_type: string
  state: string
  zipcode: string
  is_primary: boolean
  is_deleted: boolean
  created_at: string
  deleted_at: string | null
  latlongs: {
    latitude: string
    longitude: string
  }
}

interface UserData {
  id: number | null
  email: string
  name: string
  phone_number: string
  dob: string
  gender: string
  profile_img_url: string
  appleId: string | null
  authProvider: string
  created_at: string
  addresses: Address[]
}

interface UserState {
  token: string
  isApproved: boolean
  userData: UserData
}

const initialState: UserState = {
  token: '',
  isApproved: false,
  userData: {
    id: null,
    email: '',
    name: '',
    phone_number: '',
    dob: '',
    gender: '',
    profile_img_url: '',
    appleId: null,
    authProvider: '',
    created_at: '',
    addresses: []
  }
}

export function transformUserData (serverUser: any) {
  console.log(serverUser)
  return {
    id: serverUser.id,
    email: serverUser.email || '',
    name: serverUser.name || '',
    phone_number: serverUser.phone_number || '',
    dob: serverUser.dob || '',
    gender: serverUser.gender || '',
    profile_img_url: serverUser.profile_img_url || '',
    appleId: serverUser.appleId || null,
    authProvider: serverUser.authProvider || '',
    created_at: serverUser.created_at || '',
    addresses: Array.isArray(serverUser.addresses)
      ? serverUser.addresses.map((addr: any) => ({
          id: addr.id,
          house_no: addr.house_no ? addr.house_no.trim() : '',
          street_address: addr.street_address || null,
          landmark: addr.landmark || '',
          city: addr.city || '',
          address_type: addr.address_type || '',
          state: addr.state || '',
          zipcode: addr.zipcode || '',
          is_primary: Boolean(addr.is_primary),
          is_deleted: Boolean(addr.is_deleted),
          created_at: addr.created_at || '',
          deleted_at: addr.deleted_at || null,
          // Take only the first latlongs object, no deleted check
          latlongs:
            Array.isArray(addr.latlongs) && addr.latlongs.length > 0
              ? {
                  latitude: addr.latlongs[0].latitude || '',
                  longitude: addr.latlongs[0].longitude || ''
                }
              : {
                  latitude: '',
                  longitude: ''
                }
        }))
      : []
  }
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userLoginState (state, action) {
      state.token = action.payload.token
      state.isApproved = action.payload.isApproved
      state.userData = action.payload.userData
    },
    updateUserData (state, action) {
      state.userData = { ...state.userData, ...action.payload }
    },
    updateUserAddresses (state, action) {
      state.userData.addresses = action.payload
    },
    logout (state) {
      state.token = ''
      state.isApproved = false
      state.userData = initialState.userData
    }
  }
})

export const { userLoginState, updateUserData, updateUserAddresses, logout } =
  userSlice.actions
export default userSlice.reducer
