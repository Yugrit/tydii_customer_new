// components/OrderHeader.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import MainCard from '../ui/MainCard'
import StepIndicator from './Steps'

interface OrderHeaderProps {
  serviceType: string
  currentStep: number
  totalSteps: number
}

export default function OrderHeader ({
  serviceType,
  currentStep,
  totalSteps
}: OrderHeaderProps) {
  const colors = useThemeColors()

  const stepLabels = ['Pickup Details', 'Clothes', 'Shop', 'Order Review']

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Service Type Card */}
      <View style={styles.cardSection}>
        <MainCard
          title={serviceType}
          description='Get best services at your doorstep!'
          button={false}
        />
      </View>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        steps={stepLabels}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  cardSection: {
    paddingHorizontal: 20,
    marginBottom: 15
  },
  stepTitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 10
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  }
})
