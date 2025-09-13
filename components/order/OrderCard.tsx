import { OrderStatus, ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import { Star } from 'lucide-react-native'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function OrderCard ({
  orderId,
  laundryName,
  laundryImage,
  rating = 5,
  serviceType,
  weight,
  price,
  orderDate,
  orderStatus,
  onCancel,
  onTrack
}: any) {
  const colors = useThemeColors()

  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full_${i}`} size={14} color='#FFD700' fill='#FFD700' />
      )
    }
    if (hasHalf) {
      stars.push(
        <Star
          key='half'
          size={14}
          color='#FFD700'
          fill='#FFD700'
          strokeWidth={1}
        />
      )
    }
    return stars
  }

  // Function to get service icon based on service type
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case ServiceTypeEnum.WASH_N_FOLD:
      case 'WASH_N_FOLD':
      case 'Wash & Fold':
        return '🧺'
      case ServiceTypeEnum.DRYCLEANING:
      case 'DRYCLEANING':
      case 'Dry Clean':
        return '👔'
      case ServiceTypeEnum.TAILORING:
      case 'TAILORING':
      case 'Tailoring':
        return '✂️'
      default:
        return '🧺'
    }
  }

  // Function to determine if cancel button should be shown
  const shouldShowCancelButton = (status: string) => {
    const cancelableStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PICKUP_SCHEDULED
    ]
    return cancelableStatuses.includes(status as OrderStatus)
  }

  // Function to determine if track button should be shown
  const shouldShowTrackButton = (status: string) => {
    const trackableStatuses = [
      OrderStatus.CONFIRMED,
      OrderStatus.PICKUP_SCHEDULED,
      OrderStatus.PICKUP_CONFIRMED,
      OrderStatus.OUT_FOR_PICKUP,
      OrderStatus.PICKED_UP,
      OrderStatus.AT_STORE,
      OrderStatus.PROCESSING,
      OrderStatus.READY_FOR_DELIVERY,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERY_SCHEDULED,
      OrderStatus.DELIVERED
    ]
    return trackableStatuses.includes(status as OrderStatus)
  }

  // Function to get status badge styles based on order status (theme-aware)
  const getStatusBadgeStyle = (status: string) => {
    // Base opacity for dark mode adjustments
    const isDark = colors.background === '#000000'

    switch (status) {
      case OrderStatus.PENDING:
        return {
          backgroundColor: isDark ? '#664D03' : '#fff3cd',
          textColor: isDark ? '#FFE69C' : '#856404'
        }
      case OrderStatus.CONFIRMED:
        return {
          backgroundColor: isDark ? '#0F3F23' : '#E2FFF0',
          textColor: isDark ? '#75DD96' : '#079449'
        }
      case OrderStatus.PICKUP_SCHEDULED:
      case OrderStatus.PICKUP_CONFIRMED:
        return {
          backgroundColor: isDark ? '#003366' : '#cce5ff',
          textColor: isDark ? '#66B2FF' : '#004085'
        }
      case OrderStatus.PICKUP_RESCHEDULED:
        return {
          backgroundColor: isDark ? '#58151C' : '#f8d7da',
          textColor: isDark ? '#F5B7B1' : '#721c24'
        }
      case OrderStatus.OUT_FOR_PICKUP:
        return {
          backgroundColor: isDark ? '#2C2C2C' : '#e2e3e5',
          textColor: isDark ? '#CCCCCC' : '#383d41'
        }
      case OrderStatus.PICKED_UP:
      case OrderStatus.AT_STORE:
        return {
          backgroundColor: isDark ? '#1E4A30' : '#d4edda',
          textColor: isDark ? '#90EE90' : '#155724'
        }
      case OrderStatus.PROCESSING:
        return {
          backgroundColor: isDark ? '#1A365D' : '#e7f1ff',
          textColor: isDark ? '#90CAF9' : '#084298'
        }
      case OrderStatus.DELAYED:
        return {
          backgroundColor: isDark ? '#58151C' : '#f8d7da',
          textColor: isDark ? '#F5B7B1' : '#721c24'
        }
      case OrderStatus.READY_FOR_DELIVERY:
        return {
          backgroundColor: isDark ? '#0F4A5C' : '#cff4fc',
          textColor: isDark ? '#87CEEB' : '#055160'
        }
      case OrderStatus.OUT_FOR_DELIVERY:
        return {
          backgroundColor: isDark ? '#2C2C2C' : '#e2e3e5',
          textColor: isDark ? '#CCCCCC' : '#383d41'
        }
      case OrderStatus.DELIVERY_SCHEDULED:
        return {
          backgroundColor: isDark ? '#003366' : '#cce5ff',
          textColor: isDark ? '#66B2FF' : '#004085'
        }
      case OrderStatus.DELIVERED:
        return {
          backgroundColor: isDark ? '#0A3D1F' : '#d1e7dd',
          textColor: isDark ? '#90EE90' : '#0f5132'
        }
      default:
        return {
          backgroundColor: isDark ? '#2C2C2C' : '#e9ecef',
          textColor: isDark ? '#CCCCCC' : '#495057'
        }
    }
  }

  const statusStyle = getStatusBadgeStyle(orderStatus)
  const serviceIcon = getServiceIcon(serviceType)
  const showCancelButton = shouldShowCancelButton(orderStatus)
  const showTrackButton = shouldShowTrackButton(orderStatus)

  const styles = createStyles(colors)

  return (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: laundryImage }} style={styles.image} />
        <View style={styles.headerContent}>
          <Text style={styles.orderId}>Order ID: #{orderId}</Text>
          <Text style={styles.label}>Laundry Name</Text>
          <Text style={styles.laundryName}>{laundryName}</Text>
          <View style={styles.ratingRow}>{renderStars()}</View>
        </View>
      </View>

      {/* Dotted Separator */}
      <View style={styles.dottedSeparator} />

      {/* Service Section with Dynamic Icon */}
      <View style={styles.serviceSection}>
        <View style={styles.serviceIcon}>
          <Text style={styles.serviceIconText}>{serviceIcon}</Text>
        </View>
        <View style={styles.serviceContent}>
          <View style={styles.serviceMainRow}>
            <View style={styles.serviceLeft}>
              <Text style={styles.serviceLabel}>Service Type</Text>
              <Text style={styles.serviceValue}>{serviceType}</Text>
            </View>
            <View style={styles.serviceRight}>
              <Text style={styles.weightText}>
                Weight<Text style={styles.colonValue}> : {weight} lbs</Text>
              </Text>
              <View style={{ width: '100%' }}>
                <Text style={styles.priceText}>
                  Price<Text style={styles.colonValue}> : ${price}</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Dotted Separator */}
      <View style={styles.dottedSeparator} />

      {/* Order Info Section */}
      <View style={styles.orderInfoSection}>
        <View style={styles.orderInfoRow}>
          <View style={{ width: '30%' }}>
            <Text style={styles.infoLabel}>Order Date</Text>
          </View>
          <Text style={styles.infoValue}>{orderDate}</Text>
        </View>
        <View style={styles.orderInfoRow}>
          <View style={{ width: '30%' }}>
            <Text style={styles.infoLabel}>Order Status</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.backgroundColor }
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
              {orderStatus.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons - Conditionally Rendered */}
      {(showCancelButton || showTrackButton) && (
        <View
          style={[
            styles.actionButtons,
            // Adjust alignment based on button visibility
            !showCancelButton && showTrackButton && styles.singleButtonRight,
            showCancelButton && !showTrackButton && styles.singleButtonLeft
          ]}
        >
          {showCancelButton && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel Order</Text>
            </TouchableOpacity>
          )}

          {showTrackButton && (
            <TouchableOpacity
              style={[styles.button, styles.trackButton]}
              onPress={onTrack}
            >
              <Text style={styles.trackText}>Track Order</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    header: {
      flexDirection: 'row'
    },
    image: {
      width: 100,
      height: 80,
      borderRadius: 8,
      marginRight: 16,
      backgroundColor: colors.surface
    },
    headerContent: {
      flex: 1,
      justifyContent: 'space-between'
    },
    orderId: {
      fontSize: 14,
      fontWeight: '100',
      color: colors.textSecondary,
      marginBottom: 4
    },
    label: {
      fontSize: 14,
      fontWeight: '100',
      color: colors.textSecondary,
      marginBottom: 2
    },
    laundryName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 2
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    dottedSeparator: {
      backgroundColor: 'transparent',
      borderStyle: 'dotted',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderWidth: 0,
      marginVertical: 16
    },
    serviceSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 12
    },
    serviceIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.light,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16
    },
    serviceIconText: {
      fontSize: 20
    },
    serviceContent: {
      flex: 1
    },
    serviceMainRow: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    serviceLeft: {
      flex: 1
    },
    serviceRight: {
      flex: 1,
      alignItems: 'flex-end'
    },
    serviceLabel: {
      fontSize: 16,
      fontWeight: '100',
      color: colors.textSecondary,
      marginBottom: 2
    },
    serviceValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary
    },
    weightText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
      textAlign: 'right'
    },
    priceText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'right'
    },
    colonValue: {
      fontWeight: '700',
      color: colors.text
    },
    orderInfoSection: {
      marginBottom: 5
    },
    orderInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary
    },
    infoValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600'
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12
    },
    singleButtonRight: {
      justifyContent: 'flex-end'
    },
    singleButtonLeft: {
      justifyContent: 'flex-start'
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
      alignItems: 'center'
    },
    cancelButton: {
      backgroundColor: colors.surface
    },
    cancelText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500'
    },
    trackButton: {
      backgroundColor: colors.primary
    },
    trackText: {
      fontSize: 14,
      color: colors.background,
      fontWeight: '500'
    }
  })
