// components/OrderHeader.tsx
import { ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import MainCard from '../ui/MainCard'
import StepIndicator from './Steps'

interface OrderHeaderProps {
  serviceType: ServiceTypeEnum
  currentStep: number
  totalSteps: number
}

export default function OrderHeader ({
  serviceType,
  currentStep,
  totalSteps
}: OrderHeaderProps) {
  const colors = useThemeColors()

  const heading = () => {
    switch (serviceType) {
      case ServiceTypeEnum.WASH_N_FOLD:
        return 'Wash & Fold'
      case ServiceTypeEnum.DRYCLEANING:
        return 'Dry Cleaning'
      case ServiceTypeEnum.TAILORING:
        return 'Tailoring'
      default:
        return 'Service'
    }
  }

  const stepLabels = ['Pickup Details', 'Clothes', 'Shop', 'Order Review']

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Service Type Card */}
      <View style={styles.cardSection}>
        <MainCard
          title={heading()}
          description='Get best services at your doorstep!'
          button={false}
        />
      </View>

      {/* Step Indicator - Add proper spacing */}
      <View style={styles.stepSection}>
        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          steps={stepLabels}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 10,
    paddingBottom: 15 // Add bottom padding
  },
  cardSection: {
    paddingHorizontal: 20,
    marginBottom: 25, // Increase spacing between card and steps
    zIndex: 2 // Ensure card stays above other elements
  },
  stepSection: {
    paddingHorizontal: 10, // Add horizontal padding for steps
    zIndex: 1 // Lower z-index than card
  }
})
