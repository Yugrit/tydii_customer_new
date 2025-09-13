// components/ui/Loader.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

interface LoaderProps {
  message?: string
  subMessage?: string
  size?: 'small' | 'large'
  color?: string
  backgroundColor?: string
}

export default function Loader ({
  message = 'Loading...',
  subMessage = '',
  size = 'large',
  color,
  backgroundColor
}: LoaderProps) {
  const colors = useThemeColors()

  // Use provided color or theme primary, fallback to theme primary
  const loaderColor = color || colors.primary

  // Use provided background or theme background
  const containerBackground = backgroundColor || colors.background

  const styles = createStyles(colors)

  return (
    <View style={[styles.container, { backgroundColor: containerBackground }]}>
      <ActivityIndicator size={size} color={loaderColor} />
      {message && (
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      )}
      {subMessage && (
        <Text style={[styles.subMessage, { color: colors.textSecondary }]}>
          {subMessage}
        </Text>
      )}
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20
    },
    message: {
      marginTop: 20,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center'
    },
    subMessage: {
      marginTop: 8,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20
    }
  })
