// components/CustomHeader.tsx
import React, { useEffect, useState } from 'react'
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
// Import Lucide icons
import { getData_MMKV } from '@/services/StorageService'
import { Bell, Menu, User } from 'lucide-react-native'

interface CustomHeaderProps {
  onMenuPress?: () => void
  onNotificationPress?: () => void
  onProfilePress?: () => void
}

export default function CustomHeader ({
  onMenuPress,
  onNotificationPress,
  onProfilePress
}: CustomHeaderProps) {
  const [user, setUser] = useState<any>(null)

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress()
    } else {
      console.log('Menu pressed')
    }
  }

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress()
    } else {
      console.log('Notification pressed')
    }
  }

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress()
    } else {
      console.log('Profile pressed')
    }
  }

  useEffect(() => {
    const userData = getData_MMKV('user-data')
    console.log(userData)
    if (userData && userData.length > 0) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <>
      <StatusBar barStyle='light-content' backgroundColor='#1e5f74' />
      <View style={styles.header}>
        {/* Background Bubble Effects */}
        <View style={styles.backgroundBubbles}>
          {/* Large bubble */}
          <View style={[styles.bubble, styles.bubble1]}>
            <View style={styles.bubbleHighlight1} />
            <View style={styles.bubbleInner1} />
          </View>

          {/* Medium bubble */}
          <View style={[styles.bubble, styles.bubble2]}></View>

          {/* Small bubble */}
          <View style={[styles.bubble, styles.bubble3]}>
            <View style={styles.bubbleHighlight3} />
          </View>

          {/* Extra small bubble */}
          <View style={[styles.bubble, styles.bubble4]} />

          {/* Tiny bubbles */}
          <View style={[styles.bubble, styles.bubble5]} />
          <View style={[styles.bubble, styles.bubble6]} />
        </View>

        {/* Header Content */}
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
            >
              <Menu size={24} color='white' strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeBack}>Welcome Back</Text>
              <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={handleNotificationPress}
            >
              <Bell size={24} color='white' strokeWidth={2} />
              <View style={styles.notificationBadge}>
                <View style={styles.redDot} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfilePress}
            >
              {user?.profile_img_url ? (
                <Image
                  source={{ uri: 'https://avatar.iran.liara.run/public/18' }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.defaultProfile}>
                  <User size={20} color='white' strokeWidth={2} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: '#2980b9',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: StatusBar.currentHeight || 44
  },
  backgroundBubbles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
  },
  bubble: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
  bubble1: {
    width: 120,
    height: 120,
    top: -40,
    right: -30,
    backgroundColor: 'rgba(255, 255, 255, 0.12)'
  },
  bubbleHighlight1: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: 15,
    left: 20
  },
  bubbleInner1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    top: 25,
    left: 35
  },
  bubble2: {
    width: 80,
    height: 80,
    top: 20,
    right: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  bubbleHighlight2: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    top: 12,
    left: 15
  },
  bubbleInner2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    top: 18,
    left: 25
  },
  bubble3: {
    width: 60,
    height: 60,
    top: -20,
    left: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  bubbleHighlight3: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: 8,
    left: 12
  },
  bubble4: {
    width: 40,
    height: 40,
    bottom: -10,
    left: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  bubble5: {
    width: 25,
    height: 25,
    top: 10,
    left: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  bubble6: {
    width: 15,
    height: 15,
    bottom: 30,
    right: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 15,
    paddingHorizontal: 20,
    zIndex: 1
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  menuButton: {
    marginRight: 15,
    zIndex: 2
  },
  welcomeText: {
    flex: 1,
    zIndex: 2
  },
  welcomeBack: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '400'
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 0
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2
  },
  notificationButton: {
    marginRight: 15,
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4757'
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18
  },
  defaultProfile: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18
  }
})
