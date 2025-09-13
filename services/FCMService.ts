import ApiService from '@/services/ApiService'
import { getData_MMKV, storeData_MMKV } from '@/services/StorageService'
import notifee, { AndroidImportance } from '@notifee/react-native'
import messaging from '@react-native-firebase/messaging'
import { router } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import { Platform } from 'react-native'

class FCMService {
  fcmToken: string | null = null

  async initialize () {
    console.log('🔥 Initializing FCM Service...')
    await this.createNotificationChannel()
    const hasPermission = await this.requestPermission()

    if (hasPermission) {
      await this.getFCMToken()
      this.setupMessageHandlers()
    }
  }

  async createNotificationChannel () {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH
      })
    }
  }

  async requestPermission (): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true
      })

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL

      console.log(
        '📱 Notification permission status:',
        authStatus,
        'Enabled:',
        enabled
      )
      return enabled
    } catch (error) {
      console.error('❌ Permission error:', error)
      return false
    }
  }

  async getFCMToken (): Promise<string | null> {
    try {
      const token = await messaging().getToken()
      if (token) {
        this.fcmToken = token
        storeData_MMKV('fcm-token', token)
        await this.sendTokenToBackend(token)
        console.log('🎫 FCM Token:', token)
        return token
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error)
    }
    return null
  }

  async sendTokenToBackend (token: string) {
    try {
      const userToken = await getData_MMKV('user-token')
      let userId = null
      if (userToken) {
        const decoded: any = jwtDecode(userToken)
        userId = decoded.sub
      }

      console.log('📤 Sending FCM token to backend for user:', userId)
      const response = await ApiService.post({
        url: '/notification/device-token',
        data: {
          token,
          userId,
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
      this.showNotification(remoteMessage)
    })

    // Background/quit -> foreground
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
    messaging().onTokenRefresh(async token => {
      console.log('🔄 Token refreshed:', token)
      this.fcmToken = token
      storeData_MMKV('fcm-token', token)
      await this.sendTokenToBackend(token)
    })
  }

  async showNotification (remoteMessage: any) {
    const { notification } = remoteMessage
    if (!notification) return

    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
      android: {
        channelId: 'default',
        smallIcon: 'ic_launcher' // Make sure this exists in res/mipmap
      }
    })
  }

  handleNotificationTap (remoteMessage: any) {
    console.log('👆 Notification tapped:', remoteMessage)
    router.push('./') // Navigate to your desired screen
  }

  getCurrentToken (): string | null {
    const storedToken = getData_MMKV('fcm-token')
    return this.fcmToken ?? (storedToken === undefined ? null : storedToken)
  }

  async refreshToken (): Promise<string | null> {
    return await this.getFCMToken()
  }
}

export default new FCMService()
