// components/StepIndicator.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { RootState } from '@/Redux/Store'
import { Check } from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

interface StepIndicatorProps {
  // Remove static props - we'll get them from Redux
}

export default function StepIndicator () {
  const colors = useThemeColors()

  // GET FLOW STATE FROM REDUX
  const { currentStep, isStoreFlow } = useSelector(
    (state: RootState) => state.order
  )

  // DEFINE STEPS BASED ON FLOW TYPE (WITHOUT SERVICE STEP)
  const storeFlowSteps = ['Pickup', 'Clothes', 'Confirm'] // 3 steps
  const serviceFlowSteps = ['Pickup', 'Clothes', 'Store', 'Confirm'] // 4 steps

  const steps = isStoreFlow ? storeFlowSteps : serviceFlowSteps
  const totalSteps = steps.length

  console.log('📊 Step Indicator:', {
    currentStep,
    totalSteps,
    isStoreFlow: isStoreFlow ? 'Store Flow' : 'Service Flow',
    steps
  })

  // Create animated values for each step and line
  const stepAnimatedValues = useRef(
    steps.map(() => new Animated.Value(0))
  ).current

  const lineAnimatedValues = useRef(
    steps.slice(0, -1).map(() => new Animated.Value(0))
  ).current

  useEffect(() => {
    // Animate step circles
    stepAnimatedValues.forEach((animValue, index) => {
      const delay = index * 100
      const toValue = index < currentStep ? 1 : 0

      Animated.timing(animValue, {
        toValue,
        duration: 300,
        delay,
        useNativeDriver: false
      }).start()
    })

    // Animate connecting lines
    lineAnimatedValues.forEach((lineAnim, index) => {
      const delay = index * 150 + 200
      const toValue = index < currentStep - 1 ? 1 : 0

      Animated.timing(lineAnim, {
        toValue,
        duration: 400,
        delay,
        useNativeDriver: false
      }).start()
    })
  }, [currentStep, steps.length])

  const renderStep = (step: string, index: number) => {
    const isCompleted = index < currentStep - 1
    const isActive = index === currentStep - 1
    const isInactive = index > currentStep - 1
    const isLastStep = index === steps.length - 1

    // Animated styles for step circle
    const animatedCircleStyle = {
      backgroundColor: stepAnimatedValues[index].interpolate({
        inputRange: [0, 1],
        outputRange: [colors.surface, isCompleted ? '#4CAF50' : colors.surface]
      }),
      borderColor: stepAnimatedValues[index].interpolate({
        inputRange: [0, 1],
        outputRange: ['#E0E0E0', isCompleted ? '#4CAF50' : '#008ECC']
      })
    }

    // Text colors based on state
    const textColor = isCompleted
      ? '#4CAF50'
      : isActive
      ? colors.primary
      : '#9E9E9E'

    const numberTextColor = isInactive ? '#9E9E9E' : '#1876A9'

    // Check if this line should be completed (green)
    const isLineCompleted = index < currentStep - 1

    // Animated line styles
    const animatedLineStyle = !isLastStep
      ? {
          backgroundColor: lineAnimatedValues[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [
              '#E0E0E0',
              isLineCompleted ? '#4CAF50' : colors.primary
            ]
          }),
          width: lineAnimatedValues[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          })
        }
      : {}

    return (
      <View key={`${step}-${index}`} style={styles.stepWrapper}>
        <View style={styles.stepContainer}>
          {/* Animated Step Circle */}
          <Animated.View style={[styles.stepCircle, animatedCircleStyle]}>
            {isCompleted ? (
              <Animated.View
                style={{
                  opacity: stepAnimatedValues[index]
                }}
              >
                <Check size={18} color='white' strokeWidth={3} />
              </Animated.View>
            ) : (
              <Text style={[styles.stepNumber, { color: numberTextColor }]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            )}
          </Animated.View>

          {/* Step Label */}
          <Text style={[styles.stepLabel, { color: textColor }]}>{step}</Text>
        </View>

        {/* Animated Connecting Line */}
        {!isLastStep && (
          <View style={styles.lineContainer}>
            {/* Background Line */}
            <View style={styles.lineBackground} />
            {/* Animated Progress Line */}
            <Animated.View style={[styles.lineProgress, animatedLineStyle]} />
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Flow Type Indicator */}
      <View style={styles.flowIndicator}>
        <Text style={styles.flowText}>
          {isStoreFlow ? '🏪 Store Flow' : '🔧 Service Flow'} • Step{' '}
          {currentStep} of {totalSteps}
        </Text>
      </View>

      {/* Steps Row */}
      <View style={styles.stepsRow}>{steps.map(renderStep)}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16
  },
  flowIndicator: {
    alignItems: 'center',
    marginBottom: 16
  },
  flowText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600'
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative'
  },
  stepContainer: {
    alignItems: 'center',
    minWidth: 60,
    zIndex: 2
  },
  stepCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'white'
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4
  },
  lineContainer: {
    position: 'absolute',
    top: 22,
    left: '50%',
    right: '-50%',
    height: 4,
    zIndex: 1
  },
  lineBackground: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2
  },
  lineProgress: {
    position: 'absolute',
    height: 4,
    borderRadius: 2
  }
})
