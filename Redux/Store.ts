// Redux/Store.js
import { configureStore } from '@reduxjs/toolkit'
import orderReducer from './slices/orderSlice' // Import the order slice
import themeReducer from './slices/themeSlice'
import toastReducer from './slices/toastSlice'
import userReducer from './slices/userSlices'

const store = configureStore({
  reducer: {
    user: userReducer, // ✅ Make sure this key is 'user'
    order: orderReducer, // Add this line
    theme: themeReducer,
    toast: toastReducer
  }
})

export default store

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
