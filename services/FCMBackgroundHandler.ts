import notifee from '@notifee/react-native'
import messaging from '@react-native-firebase/messaging'

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🔥 Background message received:', remoteMessage)

  const { notification } = remoteMessage
  if (!notification) return

  await notifee.displayNotification({
    title: notification.title,
    body: notification.body,
    android: {
      channelId: 'default'
    }
  })
})
