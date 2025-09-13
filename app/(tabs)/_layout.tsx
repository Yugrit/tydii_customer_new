// app/(tabs)/_layout.tsx
import Header from '@/components/Header'
import { router, Tabs } from 'expo-router'
import { Heart, Home, Settings, ShoppingBag, User } from 'lucide-react-native'
import React from 'react'

export default function TabsLayout () {
  const onNotificationPress = () => {
    router.replace('./(setting)/notification')
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        header: () => <Header onNotificationPress={onNotificationPress} />,
        headerShown: true, // Use your custom header
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'index':
              return <Home color={color} size={size || 24} />
            case '(home)': // If you're using (home) folder
              return <Home color={color} size={size || 24} />
            case 'favourite': // If you're using (home) folder
              return <Heart color={color} size={size || 24} />
            case '(profile)':
              return <User color={color} size={size || 24} />
            case '(setting)':
              return <Settings color={color} size={size || 24} />
            case '(order)': // Add the order case
              return <ShoppingBag color={color} size={size || 24} />
            default:
              return <Home color={color} size={size || 24} />
          }
        }
      })}
    >
      <Tabs.Screen
        name='(home)'
        options={{
          tabBarLabel: 'Home',
          title: 'Home'
        }}
      />
      <Tabs.Screen
        name='(order)'
        options={{
          tabBarLabel: 'Order',
          title: 'Order'
        }}
      />
      <Tabs.Screen
        name='favourite'
        options={{
          tabBarLabel: 'Favourite',
          title: 'Favourite'
        }}
      />
      <Tabs.Screen
        name='(setting)'
        options={{
          tabBarLabel: 'Settings',
          title: 'Settings'
        }}
      />
    </Tabs>
  )
}
