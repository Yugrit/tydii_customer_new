// components/ServiceCard.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowRight } from 'lucide-react-native'
import React, { useMemo, useRef } from 'react'
import type { ColorValue } from 'react-native'
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

  const gradientColors: [ColorValue, ColorValue] =
    colors.background === '#000000'
      ? ['#4A9EFF', '#3498DB'] // Dark mode gradient
      : ['#0FAEEF', '#1876A9'] // Light mode gradient

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.content}>
          <Text
            style={styles.title}
            numberOfLines={2}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
            textBreakStrategy='simple'
            allowFontScaling={false}
            ellipsizeMode='tail'
          >
            {title}
          </Text>

          <Text
            style={styles.description}
            numberOfLines={3}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.9}
            textBreakStrategy='simple'
            allowFontScaling={false}
            ellipsizeMode='tail'
          >
            {description}
          </Text>

          {button && (
            <TouchableOpacity
              style={styles.button}
              onPress={onPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              <Text
                style={styles.buttonText}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
                textBreakStrategy='simple'
                allowFontScaling={false}
                ellipsizeMode='tail'
              >
                {buttonText}
              </Text>
              <Animated.View
                style={{
                  transform: [{ translateX: translateAnim }]
                }}
              >
                <LinearGradient
                  colors={gradientColors}
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
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    cardWrapper: {
      flex: 1,
      marginHorizontal: 5
    },
    card: {
      backgroundColor: colors.light,
      borderRadius: 15,
      paddingHorizontal: 20,
      paddingTop: 20,
      marginHorizontal: 5,
      flex: 1,
      minHeight: 120,
      // Add subtle border for dark mode
      borderWidth: colors.background === '#121212' ? 0.4 : 0,
      borderColor: colors.light
    },
    content: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'space-between'
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 5,
      textAlign: 'center',
      paddingHorizontal: 10,
      paddingRight: 6,
      lineHeight: 34,
      includeFontPadding: false,
      flexShrink: 1
    },
    description: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 14,
      paddingHorizontal: 15,
      paddingRight: 8,
      includeFontPadding: false,
      flex: 1,
      flexShrink: 1
    },
    button: {
      backgroundColor: colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 30,
      minWidth: 160,
      borderColor: colors.border,
      borderWidth: 1,
      elevation: 2,
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      marginBottom: 20
    },
    buttonText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
      marginRight: 12,
      textAlign: 'center',
      includeFontPadding: false,
      paddingRight: 4,
      flexShrink: 1
    },
    iconContainer: {
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0
    }
  })
