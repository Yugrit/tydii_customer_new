import { OrderStatus } from '@/enums'
import { Calendar, CheckCircle, Cog, Package, Truck } from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

interface OrderProgressBarProps {
  currentStatus: string
}

export default function OrderProgressBar ({
  currentStatus
}: OrderProgressBarProps) {
  // Define the 5 steps with their respective icons and labels
  const steps = [
    { key: OrderStatus.CONFIRMED, icon: Calendar, label: 'Scheduled' },
    { key: OrderStatus.PICKED_UP, icon: Package, label: 'Picked Up' },
    { key: OrderStatus.PROCESSING, icon: Cog, label: 'In Cleaning' },
    {
      key: OrderStatus.OUT_FOR_DELIVERY,
      icon: Truck,
      label: 'Out For Delivery'
    },
    { key: OrderStatus.DELIVERED, icon: CheckCircle, label: 'Delivered' }
  ]

  // Get current step index
  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.key === currentStatus)
    return index >= 0 ? index : 0
  }

  const currentStepIndex = getCurrentStepIndex()

  // Animation values
  const progressAnimation = useRef(new Animated.Value(0)).current
  const scaleAnimations = useRef(steps.map(() => new Animated.Value(1))).current

  useEffect(() => {
    // Animate progress line
    Animated.timing(progressAnimation, {
      toValue: currentStepIndex,
      duration: 800,
      useNativeDriver: false
    }).start()

    // Animate circle scales
    scaleAnimations.forEach((anim, index) => {
      const targetScale =
        index === currentStepIndex ? 1.2 : index < currentStepIndex ? 1.1 : 1

      Animated.spring(anim, {
        toValue: targetScale,
        tension: 100,
        friction: 8,
        useNativeDriver: true
      }).start()
    })
  }, [currentStepIndex])

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex
          const IconComponent = step.icon

          // Interpolate background color based on progress
          const backgroundColor = progressAnimation.interpolate({
            inputRange: [index - 0.5, index],
            outputRange: ['#E5E7EB', '#10B981'],
            extrapolate: 'clamp'
          })

          return (
            <React.Fragment key={step.key}>
              {/* Step Circle with Icon */}
              <View style={styles.stepWrapper}>
                <Animated.View
                  style={[
                    styles.circle,
                    {
                      backgroundColor:
                        isCompleted || isActive ? '#10B981' : '#E5E7EB',
                      transform: [{ scale: scaleAnimations[index] }]
                    }
                  ]}
                >
                  <IconComponent
                    size={18}
                    color={isCompleted || isActive ? '#ffffff' : '#9CA3AF'}
                  />
                </Animated.View>

                {/* Show label only for active status */}
                {isActive && (
                  <View style={{ width: 100 }}>
                    <Animated.Text
                      style={[
                        styles.activeLabel,
                        {
                          opacity: progressAnimation.interpolate({
                            inputRange: [index - 0.3, index],
                            outputRange: [0, 1],
                            extrapolate: 'clamp'
                          })
                        }
                      ]}
                    >
                      {step.label}
                    </Animated.Text>
                  </View>
                )}
              </View>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <View style={styles.progressLineContainer}>
                  <View style={styles.progressLineBackground} />
                  <Animated.View
                    style={[
                      styles.progressLineFill,
                      {
                        width: progressAnimation.interpolate({
                          inputRange: [index, index + 1],
                          outputRange: ['0%', '100%'],
                          extrapolate: 'clamp'
                        })
                      }
                    ]}
                  />
                </View>
              )}
            </React.Fragment>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 10
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  progressLineContainer: {
    flex: 1,
    height: 3,
    marginHorizontal: 8,
    marginTop: 20,
    position: 'relative'
  },
  progressLineBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#E5E7EB'
  },
  progressLineFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: '#10B981'
  },
  activeLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
    includeFontPadding: false
  }
})
