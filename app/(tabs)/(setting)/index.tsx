import { useRouter } from 'expo-router'
import {
  ChevronRight,
  LogOut,
  MapPin,
  Package,
  User
} from 'lucide-react-native'
import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

export default function AccountSettingScreen () {
  const router = useRouter()

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
    },
    {
      id: 'logout',
      title: 'Log-out',
      icon: LogOut,
      onPress: () => {
        console.log('Log out user')
        // Handle logout logic
        // dispatch(logout())
        // router.replace('/login')
      }
    }
  ]

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
          <View style={styles.iconContainer}>
            <IconComponent size={20} color='#666666' strokeWidth={1.5} />
          </View>
          <Text style={styles.settingTitle}>{item.title}</Text>
        </View>

        <ChevronRight size={20} color='#cccccc' strokeWidth={1.5} />
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Account <Text style={styles.titleAccent}>Setting</Text>
          </Text>
          <View style={styles.underline} />
        </View>

        {/* Settings Card */}
        <View style={styles.settingsCard}>
          {settingsOptions.map((item, index) => (
            <View key={item.id}>
              {renderSettingItem(item)}
              {index < settingsOptions.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
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
    fontWeight: '700',
    color: '#333333'
  },
  titleAccent: {
    color: '#02537F'
  },
  underline: {
    width: 100,
    height: 3,
    backgroundColor: '#02537F',
    marginTop: 8
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
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
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 76, // Align with text, accounting for icon space
    marginRight: 20
  }
})
