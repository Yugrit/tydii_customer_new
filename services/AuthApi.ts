// services/AuthApiService.ts
import ApiService from './ApiService'

export const AuthApiService = {
  requestOtp: async (data: { email?: string; mobileNumber?: string }) => {
    try {
      const response = await ApiService.post({
        url: 'auth/request-otp', // Update with your actual endpoint
        data
      })
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  verifyOtp: async (data: {
    email?: string
    mobileNumber?: string
    otp: string
  }) => {
    try {
      const response = await ApiService.post({
        url: 'auth/verify-otp', // Update with your actual endpoint
        data
      })
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  getUserProfile: async () => {
    try {
      const response = await ApiService.get({
        url: '/user/profile' // Update with your actual endpoint
      })
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
