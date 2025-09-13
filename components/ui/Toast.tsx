// components/Toast.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { showToast } from '@/Redux/slices/toastSlice'
import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, StyleSheet, Text } from 'react-native'
import { useDispatch } from 'react-redux'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  visible: boolean
  onHide: () => void
}

const { width } = Dimensions.get('window')

export default function Toast ({ message, type, visible, onHide }: ToastProps) {
  const colors = useThemeColors()
  // Remove this line - don't override the prop
  // visible = true

  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  console.log('🍞 Toast State:', { visible, message, type })

  useEffect(() => {
    if (visible) {
      // Reset values when showing
      translateY.setValue(-100)
      opacity.setValue(0)

      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        })
      ]).start()

      // Auto hide after 2 seconds
      const timer = setTimeout(() => {
        // Hide animation
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250, // Fixed: was 2500, should be 250
            useNativeDriver: true
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true
          })
        ]).start(() => {
          // Call onHide after animation completes
          onHide()
        })
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [visible, onHide]) // Add onHide to dependencies

  if (!visible) return null

  const getConfig = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', borderColor: '#10B981', iconColor: '#10B981' }
      case 'error':
        return {
          icon: '✕',
          borderColor: colors.notification,
          iconColor: colors.notification
        }
      default:
        return {
          icon: 'ⓘ',
          borderColor: colors.primary,
          iconColor: colors.primary
        }
    }
  }

  const config = getConfig()

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: config.borderColor,
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <Text style={[styles.icon, { color: config.iconColor }]}>
        {config.icon}
      </Text>
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={1}>
        {message}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    zIndex: 9999,
    maxWidth: width - 32
  },
  icon: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    width: 16,
    textAlign: 'center'
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1
  }
})

interface ShowToastProps {
  message: string
  type: 'success' | 'info' | 'error'
}

export function ShowToast ({ message, type }: ShowToastProps) {
  const dispatch = useDispatch()
  console.log('Logging log log')
  dispatch(showToast({ message, type }))
}
