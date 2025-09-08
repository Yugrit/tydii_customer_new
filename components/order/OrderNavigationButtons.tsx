// components/order/OrderNavigationButtons.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface OrderNavigationButtonsProps {
  onPrevious: () => void
  onNext: () => void
  previousLabel?: string
  nextLabel?: string
  showPrevious?: boolean
  showNext?: boolean
  disabled?: boolean
}

export default function OrderNavigationButtons ({
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  showPrevious = true,
  showNext = true,
  disabled = false
}: OrderNavigationButtonsProps) {
  const colors = useThemeColors()

  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.container}>
      {/* Previous Button */}
      {showPrevious && (
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
            color={disabled ? '#009FE1' : '#009FE1'}
            style={{
              backgroundColor: 'white',
              borderRadius: '50%'
            }}
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
      )}

      {/* Spacer when previous button is hidden */}
      {!showPrevious && <View style={{ flex: 1 }} />}

      {/* Next Button */}
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
            color={disabled ? '#009FE1' : '#009FE1'}
            style={{
              backgroundColor: 'white',
              borderRadius: '50%'
            }}
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
    }
  })
