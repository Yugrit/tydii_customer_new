// components/OrderScreenWrapper.tsx
import { RootState } from '@/Redux/Store'
import { useThemeColors } from '@/hooks/useThemeColor'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import OrderHeader from './OrderHeader'

interface OrderScreenWrapperProps {
  children: React.ReactNode
}

export default function OrderScreenWrapper ({
  children
}: OrderScreenWrapperProps) {
  const colors = useThemeColors()
  const { serviceType, currentStep, totalSteps } = useSelector(
    (state: RootState) => state.order
  )

  const styles = createStyles(colors)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]} // Makes header sticky after scrolling
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Header that becomes sticky */}
      <View style={styles.stickyHeader}>
        <OrderHeader
          serviceType={serviceType}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      </View>

      {/* Your screen content */}
      <View style={styles.content}>{children}</View>
    </ScrollView>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface
    },
    contentContainer: {
      flexGrow: 1,
      paddingBottom: 20
    },
    stickyHeader: {
      backgroundColor: colors.background,
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      borderBottomWidth: colors.background === '#000000' ? 1 : 0,
      borderBottomColor: colors.border
    },
    content: {
      flex: 1
    }
  })
