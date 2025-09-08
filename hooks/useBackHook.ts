// hooks/useBackHook.ts
import { prevStep } from '@/Redux/slices/orderSlice'
import { RootState } from '@/Redux/Store'
import { useFocusEffect } from '@react-navigation/native'
import React from 'react'
import { BackHandler } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

export function useCustomBackBehavior () {
  const dispatch = useDispatch()
  const { currentStep } = useSelector((state: RootState) => state.order)

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (currentStep === 1) {
          // If on first step, exit to previous screen
          return false // Allow default back behavior (go to previous screen)
        } else {
          // If on any other step, go to previous step
          dispatch(prevStep())
          return true // Prevent default back behavior
        }
      }

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      )

      return () => backHandler.remove()
    }, [currentStep, dispatch])
  )
}
