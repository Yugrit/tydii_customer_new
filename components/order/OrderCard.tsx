import { OrderStatus, ServiceTypeEnum } from '@/enums'
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

  // Function to get status badge styles based on order status
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          backgroundColor: '#fff3cd',
          textColor: '#856404'
        }
      case OrderStatus.CONFIRMED:
        return {
          backgroundColor: '#E2FFF0',
          textColor: '#079449'
        }
      case OrderStatus.PICKUP_SCHEDULED:
      case OrderStatus.PICKUP_CONFIRMED:
        return {
          backgroundColor: '#cce5ff',
          textColor: '#004085'
        }
      case OrderStatus.PICKUP_RESCHEDULED:
        return {
          backgroundColor: '#f8d7da',
          textColor: '#721c24'
        }
      case OrderStatus.OUT_FOR_PICKUP:
        return {
          backgroundColor: '#e2e3e5',
          textColor: '#383d41'
        }
      case OrderStatus.PICKED_UP:
      case OrderStatus.AT_STORE:
        return {
          backgroundColor: '#d4edda',
          textColor: '#155724'
        }
      case OrderStatus.PROCESSING:
        return {
          backgroundColor: '#e7f1ff',
          textColor: '#084298'
        }
      case OrderStatus.DELAYED:
        return {
          backgroundColor: '#f8d7da',
          textColor: '#721c24'
        }
      case OrderStatus.READY_FOR_DELIVERY:
        return {
          backgroundColor: '#cff4fc',
          textColor: '#055160'
        }
      case OrderStatus.OUT_FOR_DELIVERY:
        return {
          backgroundColor: '#e2e3e5',
          textColor: '#383d41'
        }
      case OrderStatus.DELIVERY_SCHEDULED:
        return {
          backgroundColor: '#cce5ff',
          textColor: '#004085'
        }
      case OrderStatus.DELIVERED:
        return {
          backgroundColor: '#d1e7dd',
          textColor: '#0f5132'
        }
      default:
        return {
          backgroundColor: '#e9ecef',
          textColor: '#495057'
        }
    }
  }

  const statusStyle = getStatusBadgeStyle(orderStatus)
  const serviceIcon = getServiceIcon(serviceType)
  const showCancelButton = shouldShowCancelButton(orderStatus)
  const showTrackButton = shouldShowTrackButton(orderStatus)

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
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
    backgroundColor: '#f0f0f0'
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between'
  },
  orderId: {
    fontSize: 14,
    fontWeight: '100',
    color: '#666666',
    marginBottom: 4
  },
  label: {
    fontSize: 14,
    fontWeight: '100',
    color: '#888888',
    marginBottom: 2
  },
  laundryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#063853',
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
    borderTopColor: '#d0d0d0',
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
    backgroundColor: '#e8f4fd',
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
    color: '#666666',
    marginBottom: 2
  },
  serviceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#063853'
  },
  weightText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'right'
  },
  priceText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right'
  },
  colonValue: {
    fontWeight: '700',
    color: '#333333'
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
    color: '#666666'
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333'
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
    backgroundColor: '#DEEDF6'
  },
  cancelText: {
    fontSize: 14,
    color: '#02537F',
    fontWeight: '500'
  },
  trackButton: {
    backgroundColor: '#02537F'
  },
  trackText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500'
  }
})
