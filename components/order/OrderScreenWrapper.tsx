// components/OrderScreenWrapper.tsx
import { RootState } from '@/Redux/Store'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import OrderHeader from './OrderHeader'

interface OrderScreenWrapperProps {
  children: React.ReactNode
}

export default function OrderScreenWrapper ({
  children
}: OrderScreenWrapperProps) {
  const { serviceType, currentStep, totalSteps } = useSelector(
    (state: RootState) => state.order
  )

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]} // Makes header sticky after scrolling
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Header that becomes sticky */}
      <View style={styles.stickyHeader}>
        <OrderHeader
          serviceType={serviceType}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      </View>

      {/* Your screen content */}
      <View style={styles.content}>{children}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9'
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
  content: {
    flex: 1
  }
})
