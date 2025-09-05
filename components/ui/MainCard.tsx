// components/ServiceCard.tsx
// components/ServiceCard.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowRight } from 'lucide-react-native'
import React, { useMemo, useRef } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

interface ServiceCardProps {
  title: string
  description: string
  button: boolean
  buttonText?: string
  onPress?: () => void
}

export default function ServiceCard ({
  title,
  description,
  button,
  buttonText,
  onPress
}: ServiceCardProps) {
  const colors = useThemeColors()
  const styles = useMemo(() => createStyles(colors), [colors])

  // Animation values
  const translateAnim = useRef(new Animated.Value(0)).current

  const handlePressIn = () => {
    Animated.timing(translateAnim, {
      toValue: 5,
      duration: 100,
      useNativeDriver: true
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(translateAnim, {
      toValue: 0,
      useNativeDriver: true
    }).start()
  }

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {button && (
          <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
            <Animated.View
              style={{
                transform: [{ translateX: translateAnim }]
              }}
            >
              <LinearGradient
                colors={['#0FAEEF', '#1876A9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <ArrowRight size={16} color='white' strokeWidth={2} />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// ... your existing createStyles function

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.light,
      borderRadius: 15,
      padding: 20,
      margin: 10
    },
    content: {
      alignItems: 'center'
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 10,
      textAlign: 'center'
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 16,
      paddingHorizontal: 8
    },
    button: {
      backgroundColor: colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 30,
      minWidth: 180,
      borderColor: '#AEE0F5',
      borderWidth: 1
    },
    buttonText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginRight: 8
    },
    iconContainer: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
