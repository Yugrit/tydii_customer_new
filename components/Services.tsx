// components/ServicesSection.tsx
import { ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import { startOrder } from '@/Redux/slices/orderSlice'
import { usePathname, useRouter } from 'expo-router'
import React, { useEffect, useMemo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'

export default function ServicesSection () {
  const colors = useThemeColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const router = useRouter()
  const dispatch = useDispatch()

  const pathname = usePathname()

  useEffect(() => {
    console.log('Current pathname:', pathname)
  }, [pathname])

  const services = [
    {
      id: ServiceTypeEnum.WASH_N_FOLD,
      title: 'Wash & Fold',
      serviceType: 'Wash & Fold',
      image: require('../assets/images/wash.png')
    },
    {
      id: ServiceTypeEnum.DRYCLEANING,
      title: 'Dry Clean',
      serviceType: 'Dry Cleaning',
      image: require('../assets/images/dryclean.png')
    },
    {
      id: ServiceTypeEnum.TAILORING,
      title: 'Tailoring',
      serviceType: 'Tailoring',
      image: require('../assets/images/tailor.png')
    }
  ]

  const handleServicePress = (service: any) => {
    console.log(`Service pressed: ${service.id}`)

    // Dispatch to Redux to start order flow
    dispatch(startOrder(service.id))

    // Navigate to order flow while staying in the same tab
    router.push('/order')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Let us know which services you need</Text>
      </View>

      <View style={styles.servicesContainer}>
        {services.map(service => (
          <View key={service.id}>
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => handleServicePress(service)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer]}>
                <Image
                  source={service.image}
                  style={styles.iconImage}
                  resizeMode='contain'
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.serviceTitle}>{service.title}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      padding: 16
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.textSecondary,
      flex: 1
    },
    servicesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 5,
      paddingRight: 5
    },
    serviceItem: {
      alignItems: 'center',
      flex: 1
    },
    iconContainer: {
      backgroundColor: '#C5ECFC',
      width: 100,
      padding: 15,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5,
      overflow: 'hidden'
    },
    iconImage: {
      width: '100%',
      height: '100%'
    },
    serviceTitle: {
      fontSize: 14,
      fontWeight: '400',
      letterSpacing: 2,
      color: colors.textSecondary,
      textAlign: 'center'
    }
  })
