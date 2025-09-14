import LogoutModal from '@/components/ui/LogoutModal' // Add this import
import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemeColors } from '@/hooks/useThemeColor'
import { useToast } from '@/hooks/useToast'
import { showToast } from '@/Redux/slices/toastSlice' // Add this import
import { userLoginState } from '@/Redux/slices/userSlices'
import { clearStorage_MMKV } from '@/services/StorageService'
import { useRouter } from 'expo-router'
import {
  ChevronRight,
  LogOut,
  MapPin,
  Moon,
  Package,
  Sun,
  User
} from 'lucide-react-native'
import React, { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'

export default function AccountSettingScreen () {
  const router = useRouter()
  const { isDark, setColorScheme } = useColorScheme()
  const colors = useThemeColors()
  const dispatch = useDispatch()
  const toast = useToast()
  // State for logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const settingsOptions = [
    {
      id: 'orders',
      title: 'My Orders',
      icon: Package,
      onPress: () => {
        console.log('Navigate to My Orders')
        router.replace('./(order)')
      }
    },
    {
      id: 'profile',
      title: 'Profile Information',
      icon: User,
      onPress: () => {
        console.log('Navigate to Profile Information')
        router.push('/profile')
      }
    },
    {
      id: 'address',
      title: 'Manage Address',
      icon: MapPin,
      onPress: () => {
        console.log('Navigate to Manage Address')
        router.push('/address')
      }
    }
  ]

  const handleLogout = () => {
    // Show custom modal instead of Alert
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    try {
      // Close modal first
      setShowLogoutModal(false)

      // Perform logout
      dispatch(userLoginState({ token: '', isApproved: false, user: null }))
      clearStorage_MMKV()

      // Show success toast
      toast.success('Logged Out')

      // Navigate to login
      router.replace('/auth/login')
    } catch (error) {
      // Show error toast

      toast.error('Logout Failed')

      console.error('Logout error:', error)
    }
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  // Dark mode toggle handler
  const handleDarkModeToggle = (value: boolean) => {
    try {
      setColorScheme(value ? 'dark' : 'light')

      // Show toast for theme change
    } catch (error) {
      dispatch(
        showToast({
          message: 'Failed to change theme',
          type: 'error'
        })
      )
    }
  }

  const renderSettingItem = (item: any) => {
    const IconComponent = item.icon

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[styles.iconContainer, { backgroundColor: colors.surface }]}
          >
            <IconComponent
              size={20}
              color={colors.textSecondary}
              strokeWidth={1.5}
            />
          </View>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {item.title}
          </Text>
        </View>

        <ChevronRight
          size={20}
          color={colors.textSecondary}
          strokeWidth={1.5}
        />
      </TouchableOpacity>
    )
  }

  // Dark mode toggle item
  const renderDarkModeToggle = () => {
    return (
      <View key='dark-mode' style={styles.settingItem}>
        <View style={styles.settingItemLeft}>
          <View
            style={[styles.iconContainer, { backgroundColor: colors.surface }]}
          >
            {isDark ? (
              <Moon size={20} color={colors.textSecondary} strokeWidth={1.5} />
            ) : (
              <Sun size={20} color={colors.textSecondary} strokeWidth={1.5} />
            )}
          </View>
          <View style={styles.darkModeContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Dark Mode
            </Text>
            <Text
              style={[styles.settingSubtitle, { color: colors.textSecondary }]}
            >
              {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            </Text>
          </View>
        </View>

        <Switch
          value={isDark}
          onValueChange={handleDarkModeToggle}
          trackColor={{
            false: colors.primary,
            true: colors.primary
          }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.border}
        />
      </View>
    )
  }

  // Logout item
  const renderLogoutItem = () => {
    return (
      <TouchableOpacity
        key='logout'
        style={styles.settingItem}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[styles.iconContainer, { backgroundColor: colors.surface }]}
          >
            <LogOut size={20} color={colors.notification} strokeWidth={1.5} />
          </View>
          <Text style={[styles.settingTitle, { color: colors.notification }]}>
            Log-out
          </Text>
        </View>

        <ChevronRight
          size={20}
          color={colors.textSecondary}
          strokeWidth={1.5}
        />
      </TouchableOpacity>
    )
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Account{' '}
              <Text style={[styles.titleAccent, { color: colors.primary }]}>
                Setting
              </Text>
            </Text>
            <View
              style={[styles.underline, { backgroundColor: colors.primary }]}
            />
          </View>

          {/* Settings Card */}
          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: colors.background,
                shadowColor: isDark ? colors.text : '#000'
              }
            ]}
          >
            {/* Regular Settings */}
            {settingsOptions.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item)}
                {index < settingsOptions.length - 1 && (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: colors.border }
                    ]}
                  />
                )}
              </View>
            ))}

            {/* Dark Mode Toggle */}
            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />
            {renderDarkModeToggle()}

            {/* Logout */}
            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />
            {renderLogoutItem()}
          </View>
        </View>
      </ScrollView>

      {/* Custom Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  )
}

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  header: {
    marginBottom: 30
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
  },
  titleAccent: {
    // Color applied inline
  },
  underline: {
    width: 100,
    height: 3,
    marginTop: 8
  },
  settingsCard: {
    borderRadius: 12,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1
  },
  darkModeContent: {
    flex: 1
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2
  },
  separator: {
    height: 1,
    marginLeft: 76,
    marginRight: 20
  }
})
