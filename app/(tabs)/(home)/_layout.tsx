// app/(tabs)/(home)/order/_layout.tsx
import { RootState } from '@/Redux/Store'
import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function OrderLayout () {
  const { serviceType, currentStep, totalSteps } = useSelector(
    (state: RootState) => state.order
  )

  return (
    <View style={styles.container}>
      {/* Content Area */}
      <View style={styles.stackContainer}>
        <Stack
          screenOptions={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right'
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },
  scrollContainer: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20
  },
  stickyHeader: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  stackContainer: {
    flex: 1,
    minHeight: 600 // Ensure minimum height for proper scrolling
  }
})
