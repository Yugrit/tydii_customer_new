// app/(tabs)/(home)/order.tsx
import { RootState } from '@/Redux/Store'
import { nextStep, prevStep, resetOrder } from '@/Redux/slices/orderSlice'
import OrderConfirmation from '@/components/order/ConfirmOrder'
import OrderHeader from '@/components/order/OrderHeader'
import PickupDetailsForm from '@/components/order/PickupDetails'
import SelectClothesForm from '@/components/order/SelectClothes'
import SelectStoreForm from '@/components/order/SelectStore'
import { useCustomBackBehavior } from '@/hooks/useBackHook'
import { useThemeColors } from '@/hooks/useThemeColor'
import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  InteractionManager,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Fixed debounce function with explicit 'this' parameter
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return function (this: void, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default function OrderScreen () {
  const dispatch = useDispatch()
  const { serviceType, currentStep, totalSteps, isOrderActive } = useSelector(
    (state: RootState) => state.order
  )

  const colors = useThemeColors()
  const styles = useMemo(() => createStyles(colors), [colors])

  useCustomBackBehavior()

  const slideAnim = useRef(new Animated.Value(0)).current
  const isAnimatingRef = useRef(false)

  // Clear order data when leaving the screen
  useFocusEffect(
    useCallback(() => {
      // This runs when the screen gains focus
      console.log('📱 Order screen focused')

      // Return cleanup function that runs when screen loses focus
      return () => {
        console.log('📱 Order screen unfocused - clearing order data')
        // Only clear if order is not completed
        if (isOrderActive) {
          dispatch(resetOrder())
        }
      }
    }, [dispatch, isOrderActive])
  )

  // Alternative method: Clear on component unmount
  useEffect(() => {
    return () => {
      // This runs when component unmounts
      console.log('🗑️ Order screen unmounting - clearing order data')
      if (isOrderActive) {
        dispatch(resetOrder())
      }
    }
  }, [dispatch, isOrderActive])

  // Debounced state update using the fixed debounce function
  const debouncedStateUpdate = useCallback(
    debounce((callback: () => void) => {
      InteractionManager.runAfterInteractions(() => {
        callback()
      })
    }, 100),
    []
  )

  const createAnimation = useCallback(
    (toValue: number) => {
      return Animated.timing(slideAnim, {
        toValue,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
        isInteraction: false
      })
    },
    [slideAnim]
  )

  const animateToStep = useCallback(
    (direction: 'next' | 'prev', stateUpdateCallback: () => void) => {
      if (isAnimatingRef.current) return

      isAnimatingRef.current = true

      const slideOutValue = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH
      const slideInValue = direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH

      // Phase 1: Slide out current content
      createAnimation(slideOutValue).start(() => {
        // Phase 2: Safely update state with debounce
        debouncedStateUpdate(() => {
          stateUpdateCallback()

          // Phase 3: Position new content and slide in
          setTimeout(() => {
            slideAnim.setValue(slideInValue)

            createAnimation(0).start(() => {
              isAnimatingRef.current = false
            })
          }, 50)
        })
      })
    },
    [createAnimation, slideAnim, debouncedStateUpdate]
  )

  const handleNext = useCallback(() => {
    animateToStep('next', () => dispatch(nextStep()))
  }, [animateToStep, dispatch])

  const handlePrev = useCallback(() => {
    animateToStep('prev', () => dispatch(prevStep()))
  }, [animateToStep, dispatch])

  const handleBackToHome = useCallback(() => {
    // Clear order data before going back
    console.log('🏠 Going back to home - clearing order data')
    dispatch(resetOrder())
    router.back()
  }, [dispatch])

  // Memoized step component to prevent unnecessary re-renders
  const currentStepComponent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <PickupDetailsForm onNext={handleNext} onPrev={handleBackToHome} />
        )
      case 2:
        return (
          <SelectClothesForm
            onNext={handleNext}
            onPrev={handlePrev}
            serviceType={serviceType}
          />
        )
      case 3:
        return <SelectStoreForm onNext={handleNext} onPrev={handlePrev} />
      case 4:
        return (
          <OrderConfirmation serviceType={serviceType} onPrev={handlePrev} />
        )
      default:
        return null
    }
  }, [currentStep, handleNext, handlePrev, handleBackToHome, serviceType])

  return (
    <ScrollView style={styles.container}>
      {/* Static Header */}
      <View style={styles.headerContainer}>
        <OrderHeader
          serviceType={serviceType}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      </View>

      {/* Animated Content Container */}
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.stepContainer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {currentStepComponent}
        </Animated.View>
      </View>
    </ScrollView>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface
    },
    headerContainer: {
      zIndex: 1000
    },
    contentContainer: {
      flex: 1,
      overflow: 'hidden'
    },
    stepContainer: {
      flex: 1,
      width: SCREEN_WIDTH
    }
  })
