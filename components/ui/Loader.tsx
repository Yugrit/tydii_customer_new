// components/ui/Loader.tsx
import { useColorScheme } from '@/hooks/useColorScheme'
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
  backgroundColor = '#F9FDFF'
}: LoaderProps) {
  const { colorScheme } = useColorScheme()

  const loaderColor = color

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size={size} color={loaderColor} />
      {message && <Text style={styles.message}>{message}</Text>}
      {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
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
    color: '#333',
    textAlign: 'center'
  },
  subMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  }
})
