// Redux/slices/userSlices.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: '', // Use empty string instead of false
  isApproved: false
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userLoginState (state, action) {
      state.token = action.payload.token // ✅ CORRECT: semicolon
      state.isApproved = action.payload.isApproved // ✅ CORRECT: semicolon
    },
    logout (state) {
      state.token = ''
      state.isApproved = false
    }
  }
})

export const { userLoginState, logout } = userSlice.actions
export default userSlice.reducer
