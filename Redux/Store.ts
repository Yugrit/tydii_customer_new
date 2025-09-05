// Redux/Store.js
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlices'

const store = configureStore({
  reducer: {
    user: userReducer // ✅ Make sure this key is 'user'
  }
})

export default store

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
