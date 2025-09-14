// components/CustomHeader.tsx
import React from 'react'
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
// Import Lucide icons
import { RootState } from '@/Redux/Store'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Bell, User } from 'lucide-react-native'
import { useDispatch, useSelector } from 'react-redux'

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
  const user = useSelector((state: RootState) => state.user.userData)
  const dispatch = useDispatch()

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress()
    } else {
      console.log('Notification pressed')
    }
  }

  const handleProfilePress = () => {
    router.push('./(setting)/profile')
  }
  return (
    <>
      <StatusBar barStyle='light-content' backgroundColor='#1e5f74' />
      <LinearGradient colors={['#035480', '#3E8EB8']} style={styles.header}>
        {/* Background Bubble Effects */}
        <View style={styles.backgroundBubbles}>
          {/* Large bubble */}
          <LinearGradient
            colors={['#3E8EB8', '#174973']}
            start={{ x: 0, y: 0.5 }} // Start from left center
            end={{ x: 1, y: 0.5 }} // End at right center
            style={[styles.bubble, styles.bubble1]}
          />
        </View>

        {/* Header Content */}
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
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
      </LinearGradient>
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
    width: 210,
    height: 210,
    top: -50,
    right: -70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)'
  },
  bubbleHighlight1: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 12.5,
    backgroundColor: '#035480',
    top: 15,
    left: 50
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
