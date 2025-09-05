// app/(tabs)/_layout.tsx - SIMPLIFIED WITHOUT AUTH CHECK
import { Tabs } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

import { HapticTab } from '@/components/HapticTab'
import Header from '@/components/Header'
import { IconSymbol } from '@/components/ui/IconSymbol'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { useColorScheme } from '@/hooks/useColorScheme'
import '../globals.css'

export default function TabLayout () {
  const { colorScheme } = useColorScheme()

  // ✅ No auth check needed - handled by root layout
  return (
    <Tabs
      screenOptions={{
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        header: () => <Header />,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute'
          },
          default: {}
        })
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='house.fill' color={color} />
          )
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='paperplane.fill' color={color} />
          )
        }}
      />
    </Tabs>
  )
}
