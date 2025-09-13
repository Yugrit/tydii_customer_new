// app/(tabs)/(home)_layout.tsx
import { RootState } from '@/Redux/Store'
import { useThemeColors } from '@/hooks/useThemeColor'
import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function OrderLayout () {
  const { serviceType, currentStep, totalSteps } = useSelector(
    (state: RootState) => state.order
  )

  const colors = useThemeColors()

  const styles = createStyles(colors)

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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    scrollContainer: {
      backgroundColor: colors.background,
      flex: 1
    },
    contentContainer: {
      backgroundColor: colors.background,
      flexGrow: 1,
      paddingBottom: 20
    },
    stickyHeader: {
      backgroundColor: colors.background,
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5
    },
    stackContainer: {
      backgroundColor: 'red',
      flex: 1,
      minHeight: 600 // Ensure minimum height for proper scrolling
    }
  })
