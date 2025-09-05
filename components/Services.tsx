// components/ServicesSection.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import React, { useMemo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function ServicesSection () {
  const colors = useThemeColors()
  const styles = useMemo(() => createStyles(colors), [colors])

  const services = [
    {
      id: 'wash-fold',
      title: 'Wash & Fold',
      image: require('../assets/images/wash.png')
    },
    {
      id: 'dry-clean',
      title: 'Dry Clean',
      image: require('../assets/images/dryclean.png')
    },
    {
      id: 'tailoring',
      title: 'Tailoring',
      image: require('../assets/images/tailor.png')
    }
  ]

  const handleServicePress = (serviceId: string) => {
    console.log(`Service pressed: ${serviceId}`)
    // Handle service selection here
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Let us know which services you need</Text>
      </View>

      <View style={styles.servicesContainer}>
        {services.map(service => (
          <>
            <View>
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItem}
                onPress={() => handleServicePress(service.id)}
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
          </>
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
      borderRadius: '50%',
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
