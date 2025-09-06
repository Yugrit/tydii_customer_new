// app/(tabs)/_layout.tsx
import Header from '@/components/Header'
import { Tabs } from 'expo-router'
import { Home, Settings, User } from 'lucide-react-native'
import React from 'react'

export default function TabsLayout () {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        header: () => <Header />,
        headerShown: true, // Use your custom header
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'index':
              return <Home color={color} size={size || 24} />
            case '(home)': // If you're using (home) folder
              return <Home color={color} size={size || 24} />
            case 'profile':
              return <User color={color} size={size || 24} />
            case 'settings':
              return <Settings color={color} size={size || 24} />
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
    </Tabs>
  )
}
