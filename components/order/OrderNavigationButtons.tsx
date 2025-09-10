// components/order/OrderNavigationButtons.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { RootState } from '@/Redux/Store' // ADD STORE TYPE
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux' // ADD REDUX IMPORT

interface OrderNavigationButtonsProps {
  onPrevious: () => void
  onNext: () => void
  previousLabel?: string
  nextLabel?: string
  disabled?: boolean
}

export default function OrderNavigationButtons ({
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  disabled = false
}: OrderNavigationButtonsProps) {
  const colors = useThemeColors()

  // GET FLOW STATE FROM REDUX
  const { currentStep, isStoreFlow } = useSelector(
    (state: RootState) => state.order
  )

  const styles = useMemo(() => createStyles(colors), [colors])

  // CONDITIONAL RENDERING LOGIC BASED ON FLOWS
  // Store Flow: 4 steps (Service → Pickup → Clothes → Confirm)
  // Service Flow: 5 steps (Service → Pickup → Clothes → Store → Confirm)
  const maxSteps = isStoreFlow ? 4 : 5
  const showPrevious = currentStep > 1
  const showNext = currentStep < maxSteps

  console.log('📱 Navigation:', {
    currentStep,
    maxSteps,
    isStoreFlow: isStoreFlow ? 'Store Flow' : 'Service Flow',
    showPrevious,
    showNext
  })

  return (
    <View style={styles.container}>
      {/* Previous Button - Show only if not on first step */}
      {showPrevious ? (
        <TouchableOpacity
          style={[
            styles.button,
            styles.previousButton,
            disabled && styles.disabledButton
          ]}
          onPress={onPrevious}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <ArrowLeft
            size={20}
            color={disabled ? '#ccc' : '#009FE1'}
            style={styles.iconStyle}
          />
          <Text
            style={[
              styles.buttonText,
              styles.previousButtonText,
              disabled && styles.disabledButtonText
            ]}
          >
            {previousLabel}
          </Text>
        </TouchableOpacity>
      ) : (
        /* Spacer when previous button is hidden */
        <View style={{ flex: 1 }} />
      )}

      {/* Next Button - Show only if not on last step */}
      {showNext && (
        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            disabled && styles.disabledButton
          ]}
          onPress={onNext}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.buttonText,
              styles.nextButtonText,
              disabled && styles.disabledButtonText
            ]}
          >
            {nextLabel}
          </Text>
          <ArrowRight
            size={20}
            color={disabled ? '#ccc' : '#009FE1'}
            style={styles.iconStyle}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 12
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 10,
      minHeight: 48
    },
    previousButton: {
      backgroundColor: '#DEEDF6'
    },
    nextButton: {
      backgroundColor: '#02537F'
    },
    disabledButton: {
      opacity: 0.6
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      marginHorizontal: 8
    },
    previousButtonText: {
      color: '#02537F'
    },
    nextButtonText: {
      color: 'white'
    },
    disabledButtonText: {
      color: colors.mutedForeground
    },
    iconStyle: {
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 50 // Use number instead of '50%' for React Native
    }
  })
