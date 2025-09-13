// store/slices/toastSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  visible: false,
  message: '',
  type: 'info' // 'success' | 'error' | 'info'
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.visible = true
      state.message = action.payload.message
      state.type = action.payload.type
    },
    hideToast: state => {
      state.visible = false
    }
  }
})

export const { showToast, hideToast } = toastSlice.actions
export default toastSlice.reducer
