// app/order-confirmed.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { router, useLocalSearchParams } from 'expo-router'
import { CheckCircle } from 'lucide-react-native'
import React, { useEffect } from 'react'
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

export default function OrderConfirmedScreen () {
  const { orderId, serviceType, totalAmount, storeName } =
    useLocalSearchParams()

  const colors = useThemeColors()

  const handleGoHome = () => {
    router.replace('./') // or your home route
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.replace('/') // or your home route path
        return true
      }
    )
    return () => backHandler.remove()
  })

  const styles = createStyles(colors)

  return (
    <View style={styles.container}>
      <CheckCircle size={80} color='#28a745' style={styles.icon} />

      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>
        Your {serviceType} order has been successfully placed
      </Text>

      <View style={styles.detailsCard}>
        <Text style={styles.detailLabel}>Order ID</Text>
        <Text style={styles.detailValue}>{orderId}</Text>

        <Text style={styles.detailLabel}>Store</Text>
        <Text style={styles.detailValue}>{storeName}</Text>

        <Text style={styles.detailLabel}>Total Amount</Text>
        <Text style={styles.detailValue}>${totalAmount}</Text>
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    },
    icon: {
      marginBottom: 20
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center'
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 30
    },
    detailsCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 12,
      width: '100%',
      marginBottom: 30,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12
    },
    homeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 40,
      paddingVertical: 12,
      borderRadius: 8
    },
    homeButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600'
    }
  })
