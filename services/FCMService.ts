// services/FCMService.js
import ApiService from '@/services/ApiService'
import { getData_MMKV, storeData_MMKV } from '@/services/StorageService'
import messaging from '@react-native-firebase/messaging'
import { router } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import { Platform } from 'react-native'

class FCMService {
  fcmToken: string | null

  constructor () {
    this.fcmToken = null
  }

  async initialize () {
    try {
      console.log('🔥 Initializing FCM Service...')
      const hasPermission = await this.requestPermission()

      if (hasPermission) {
        await this.getFCMToken()
        this.setupMessageHandlers()
      }
    } catch (error) {
      console.error('❌ FCM Service initialization failed:', error)
    }
  }

  async requestPermission () {
    try {
      const authStatus = await messaging().requestPermission({
        sound: true,
        badge: true,
        alert: true
      })

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL

      console.log('📱 Permission status:', authStatus, 'Enabled:', enabled)
      return enabled
    } catch (error) {
      console.error('❌ Permission error:', error)
      return false
    }
  }

  async getFCMToken () {
    try {
      const token = await messaging().getToken()
      console.log('🎫 FCM Token:', token)

      if (token) {
        this.fcmToken = token
        storeData_MMKV('fcm-token', token)

        // Send token to your backend
        await this.sendTokenToBackend(token)
        return token
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error)
    }
    return null
  }

  async sendTokenToBackend (token: any) {
    try {
      // Get user ID from JWT token
      const userToken = getData_MMKV('user-token')
      let userId = null

      if (userToken) {
        const decoded = jwtDecode(userToken)
        userId = decoded.sub
      }

      console.log('📤 Sending FCM token to backend for user:', userId)

      // Replace with your actual endpoint
      const response = await ApiService.post({
        url: '/notification/device-token', // Your endpoint
        data: {
          token: token,
          userId: userId,
          platform: Platform.OS
        }
      })

      console.log('✅ Token registered with backend:', response)
    } catch (error) {
      console.error('❌ Failed to register token:', error)
    }
  }

  setupMessageHandlers () {
    console.log('📬 Setting up message handlers...')

    // Foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('📨 Foreground message:', remoteMessage)
      this.showInAppNotification(remoteMessage)
    })

    // Background/quit state -> foreground
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📱 App opened from notification:', remoteMessage)
      this.handleNotificationTap(remoteMessage)
    })

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🚀 App opened from quit state:', remoteMessage)
          this.handleNotificationTap(remoteMessage)
        }
      })

    // Token refresh
    messaging().onTokenRefresh(token => {
      console.log('🔄 Token refreshed:', token)
      this.fcmToken = token
      storeData_MMKV('fcm-token', token)
      this.sendTokenToBackend(token)
    })
  }

  showInAppNotification (remoteMessage: any) {
    // Show alert when app is in foreground
    return
  }

  handleNotificationTap (remoteMessage: any) {
    console.log('👆 Notification tapped:', remoteMessage)

    // Handle navigation based on your backend's notification data
    router.push('./')
  }

  // Utility methods
  getCurrentToken () {
    return this.fcmToken || getData_MMKV('fcm-token')
  }

  async refreshToken () {
    return await this.getFCMToken()
  }
}

export default new FCMService()
