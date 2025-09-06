// app/(tabs)/(home)/order/_layout.tsx
import OrderHeader from '@/components/order/OrderHeader'
import { RootState } from '@/Redux/Store'
import { Stack } from 'expo-router'
import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

export default function OrderLayout () {
  const { serviceType, currentStep, totalSteps } = useSelector(
    (state: RootState) => state.order
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.stickyHeader}>
          <OrderHeader
            serviceType={serviceType}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </View>

        <View style={styles.stackContainer}>
          <Stack
            screenOptions={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    minHeight: 600
  }
})
