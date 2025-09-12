import OrderProgressBar from '@/components/order/OrderTrackingBar'
import FeedbackModal from '@/components/ui/FeedbackModal'
import { ServiceTypeEnum } from '@/enums'
import ApiService from '@/services/ApiService'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { MessageCircle, Star, Truck, UserStar } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

export default function OrderTrackingScreen () {
  const { orderId } = useLocalSearchParams()

  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackTarget, setFeedbackTarget] = useState<{
    name: string
    type: 'store' | 'driver'
    id: string
  } | null>(null)
  const router = useRouter()

  // Function to format date
  const formatOrderDate = (dateString: any) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Function to get service type display name
  const getServiceTypeDisplay = (serviceType: any) => {
    switch (serviceType) {
      case 'WASH_N_FOLD':
        return 'Wash & Fold'
      case 'DRYCLEANING':
        return 'Dry Clean'
      case 'TAILORING':
        return 'Tailoring'
      case 'IRONING':
        return 'Ironing'
      default:
        return serviceType
    }
  }

  // Function to get service icon
  const getServiceIcon = (serviceType: any) => {
    switch (serviceType) {
      case ServiceTypeEnum.WASH_N_FOLD:
        return '🧺'
      case ServiceTypeEnum.DRYCLEANING:
        return '👔'
      case ServiceTypeEnum.TAILORING:
        return '✂️'
      default:
        return '👔'
    }
  }

  // Fetch order details from API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔄 Fetching order details for ID:', orderId)

        const response = await ApiService.get({
          url: '/customer/orders',
          params: {
            order_id: orderId,
            limit: 10,
            page: 1
          }
        })

        console.log('📋 Order API Response:', response.data[0].pickups[0])

        if (
          response?.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          const order = response.data[0]

          // Transform API data to match component structure
          const transformedOrder = {
            id: order.id,
            orderId: order.order_id,
            laundryName: order.store?.storeName || 'Laundry Store',
            laundryImage:
              order.store?.shopImageUrl ||
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
            rating: order.store_avg_rating || 5,
            services:
              order.services?.items?.map((item: any) => ({
                name: item.item_name,
                weight: `${item.quantity} ${
                  order.services.service_type === 'IRONING' ? 'pcs' : 'lb'
                }`,
                price: `$ ${parseFloat(item.price).toFixed(2)}`,
                icon: getServiceIcon(
                  item.item_type || order.services.service_type
                )
              })) || [],
            serviceType: getServiceTypeDisplay(
              order.services?.service_type || ''
            ),
            orderDate: formatOrderDate(order.created_at),
            deliveryDate: formatOrderDate(order.deliveryDate),
            estimatedDelivery: formatOrderDate(order.deliveryDate),
            // Map all pickups from the array
            pickups:
              order.pickups?.map((pickup: any) => ({
                id: pickup.id,
                pickupDate: formatOrderDate(pickup.pickup_date),
                deliveryDate: formatOrderDate(pickup.delivery_date),
                pickupTimeSlot: pickup.pickup_time_slot,
                deliveryTimeSlot: pickup.delivery_time_slot,
                deliveryCharges: pickup.delivery_charges,
                pickupAddress: pickup.pickup_address,
                deliveryAddress: pickup.delivery_address,
                deliveryPerson: pickup.deliveryPerson,
                status: pickup.pickup_status
              })) || [],
            driver: {
              name: order.pickups?.[0]?.deliveryPerson?.user.name,
              pickupTime: order.pickup_time_slot?.open || '12:30 PM'
            },
            billing: {
              platformFee: '$ 0.00',
              tax: '$ 0.00',
              deliveryPartnerFee: order.pickups?.[0]?.delivery_charges
                ? `$ ${parseFloat(order.pickups[0].delivery_charges).toFixed(
                    2
                  )}`
                : '$ 0.00',
              totalAmount: `$ ${parseFloat(order.total_amount).toFixed(2)}`
            },
            status: order.status,
            addresses: {
              pickup: order.user_address,
              delivery: order.store_address
            },
            timeSlots: {
              pickup: order.pickup_time_slot,
              delivery: order.delivery_time_slot
            }
          }

          setOrderData(transformedOrder)
        } else {
          setError('Order not found')
        }
      } catch (error) {
        console.error('❌ Failed to fetch order details:', error)
        setError('Failed to load order details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const renderStars = () => {
    if (!orderData) return null

    const stars = []
    const fullStars = Math.floor(orderData.rating)
    const hasHalf = orderData.rating % 1 >= 0.5

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

  // Check if feedback should be available for store
  const shouldShowStoreFeedback = () => {
    if (!orderData) return false

    const feedbackStatuses = [
      'Picked Up',
      'At Store',
      'Processing',
      'Ready for Delivery',
      'Out for Delivery',
      'Delivered'
    ]
    return feedbackStatuses.includes(orderData.status)
  }

  // Check if chat should be available (from Scheduled to Delivered)
  const shouldShowChatButtons = () => {
    if (!orderData) return false

    const chatStatuses = [
      'Confirmed',
      'Pickup Scheduled',
      'Pickup Confirmed',
      'Out for Pickup',
      'Picked Up',
      'At Store',
      'Processing',
      'Ready for Delivery',
      'Out for Delivery',
      'Delivered'
    ]
    return chatStatuses.includes(orderData.status)
  }

  const handleChatStore = () => {
    console.log('Chat with store')

    // Navigate to chat screen with order ID, store type, and store name
    router.push({
      pathname: '/chat',
      params: {
        id: orderData.id, // Pass the order ID
        type: 'store', // Set type as store
        storeName: orderData.laundryName // Optional: pass store name for display
      }
    })
  }

  const handleFeedbackStore = () => {
    console.log('Give feedback to store')
    setFeedbackTarget({
      name: orderData.laundryName,
      type: 'store',
      id: orderData.id
    })
    setShowFeedbackModal(true)
  }

  // Individual driver handlers for each pickup
  const handleChatDriver = (pickupId: string, driverName: string) => {
    console.log(`Chat with driver ${driverName} for pickup ${pickupId}`)

    // Navigate to chat screen with pickup ID and driver type
    router.push({
      pathname: '/chat',
      params: {
        id: pickupId,
        type: 'driver',
        driverName: driverName
      }
    })
  }

  const handleFeedbackDriver = (pickupId: string, driverName: string) => {
    console.log(`Give feedback to driver ${driverName} for pickup ${pickupId}`)
    setFeedbackTarget({
      name: driverName,
      type: 'driver',
      id: pickupId
    })
    setShowFeedbackModal(true)
  }

  // Handle feedback submission
  const handleSubmitFeedback = async (rating: number, comment: string) => {
    if (!feedbackTarget) return

    try {
      console.log('Submitting feedback:', {
        target: feedbackTarget,
        rating,
        comment
      })

      // TODO: Implement API call to submit feedback
      // const response = await ApiService.post({
      //   url: feedbackTarget.type === 'store' ? '/customer/feedback/store' : '/customer/feedback/driver',
      //   data: {
      //     [feedbackTarget.type === 'store' ? 'orderId' : 'pickupId']: feedbackTarget.id,
      //     rating,
      //     comment
      //   }
      // })

      Alert.alert(
        'Success',
        `Thank you for your feedback about ${feedbackTarget.name}!`
      )
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      throw error
    }
  }

  // Render simplified pickup section
  const renderPickupSection = (pickup: any, index: number) => {
    return (
      <View key={pickup.id} style={styles.pickupCard}>
        <Text style={styles.pickupTitle}>
          {orderData.pickups.length > 1
            ? `Pickup #${index + 1}`
            : 'Driver Details'}
        </Text>

        {/* Driver Information - Only name and pickup time */}
        <View style={styles.driverInfo}>
          <View style={styles.driverRow}>
            <Text style={styles.driverLabel}>Driver</Text>
            <Text style={styles.driverValue}>
              {pickup.deliveryPerson?.user.name}
            </Text>
          </View>

          <View style={styles.driverRow}>
            <Text style={styles.driverLabel}>Pickup Time</Text>
            <Text style={styles.driverValue}>
              {pickup.pickupTimeSlot?.open || 'TBD'}
            </Text>
          </View>
        </View>

        {/* Action Buttons - Chat and Feedback */}
        <View style={styles.actionButtonsRow}>
          {
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                handleChatDriver(
                  pickup.id,
                  pickup.deliveryPerson?.name || 'Driver'
                )
              }
            >
              <MessageCircle size={18} color='white' />
              <Text style={styles.actionButtonText}>Chat</Text>
            </TouchableOpacity>
          }

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              handleFeedbackDriver(
                pickup.id,
                pickup.deliveryPerson?.name || 'Driver'
              )
            }
          >
            <UserStar size={18} color='white' />
            <Text style={styles.actionButtonTextGreen}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Render all pickup sections
  const renderPickupSections = () => {
    if (!orderData?.pickups || orderData.pickups.length === 0) {
      return (
        <View style={styles.pickupCard}>
          <Text style={styles.pickupTitle}>Driver Details</Text>
          <View style={styles.driverInfo}>
            <View style={styles.driverRow}>
              <Text style={styles.driverLabel}>Driver</Text>
              <Text style={styles.driverValue}>Not Assigned</Text>
            </View>
            <View style={styles.driverRow}>
              <Text style={styles.driverLabel}>Pickup Time</Text>
              <Text style={styles.driverValue}>TBD</Text>
            </View>
          </View>
        </View>
      )
    }

    return orderData.pickups.map((pickup: any, index: number) =>
      renderPickupSection(pickup, index)
    )
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#008ECC' />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    )
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  // No order data
  if (!orderData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          Order <Text style={styles.titleAccent}>Tracking</Text>
        </Text>
        <View style={styles.underline} />
      </View>

      {/* Order Information Section */}
      <View style={styles.orderInfoContainer}>
        <Text style={styles.orderId}>Order ID: {orderData.orderId}</Text>

        <View style={styles.deliveryContainer}>
          <Truck size={20} color='#28a745' />
          <Text style={styles.deliveryText}>
            <Text style={styles.deliveryLabel}>Estimated delivery: </Text>
            <Text style={styles.deliveryDate}>
              {orderData.estimatedDelivery}
            </Text>
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <OrderProgressBar currentStatus={orderData.status} />

      {/* Order Details Card */}
      <View style={styles.orderCard}>
        {/* Header */}
        <View style={styles.orderCardHeader}>
          <Image
            source={{ uri: orderData.laundryImage }}
            style={styles.laundryImage}
          />
          <View style={styles.laundryInfo}>
            <Text style={styles.orderIdText}>
              Order ID: {orderData.orderId}
            </Text>
            <Text style={styles.laundryLabel}>Laundry Name</Text>
            <Text style={styles.laundryName}>{orderData.laundryName}</Text>
            <View style={styles.ratingRow}>{renderStars()}</View>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Services Selected</Text>
          {orderData.services.map((service: any, index: number) => (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceIconText}>{service.icon}</Text>
              </View>
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceWeight}>{service.weight}</Text>
              </View>
              <Text style={styles.servicePrice}>{service.price}</Text>
            </View>
          ))}
        </View>

        {/* Dotted Separator */}
        <View style={styles.dottedSeparator} />

        {/* Order & Delivery Dates */}
        <View style={styles.datesSection}>
          <View style={styles.dateRow}>
            <View style={{ width: '50%' }}>
              <Text style={styles.dateLabel}>Order Date</Text>
            </View>
            <Text style={styles.dateValue}>{orderData.orderDate}</Text>
          </View>
          <View style={styles.dateRow}>
            <View style={{ width: '50%' }}>
              <Text style={styles.dateLabel}>Delivery Date</Text>
            </View>
            <Text style={styles.dateValue}>{orderData.deliveryDate}</Text>
          </View>
        </View>

        {/* Store Action Buttons - Only show if chat is available */}
        {shouldShowChatButtons() && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChatStore}
            >
              <MessageCircle size={18} color='white' />
              <Text style={styles.actionButtonText}>Chat</Text>
            </TouchableOpacity>

            {shouldShowStoreFeedback() && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleFeedbackStore}
              >
                <UserStar size={18} color='white' />
                <Text style={styles.actionButtonTextGreen}>Feedback</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Individual Pickup Sections - Simplified */}
      {renderPickupSections()}

      {/* Billing Info Card */}
      <View style={styles.billingCard}>
        <Text style={styles.billingTitle}>Billing Info</Text>

        <View style={styles.billingRow}>
          <Text style={styles.billingLabel}>Platform Fee</Text>
          <Text style={styles.billingValue}>
            {orderData.billing.platformFee}
          </Text>
        </View>

        <View style={styles.billingRow}>
          <Text style={styles.billingLabel}>Tax</Text>
          <Text style={styles.billingValue}>{orderData.billing.tax}</Text>
        </View>

        <View style={styles.billingRow}>
          <Text style={styles.billingLabel}>Delivery Partner fee</Text>
          <Text style={styles.billingValue}>
            {orderData.billing.deliveryPartnerFee}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total amount:</Text>
          <Text style={styles.totalValue}>{orderData.billing.totalAmount}</Text>
        </View>
      </View>

      {/* Feedback Modal */}
      {feedbackTarget && (
        <FeedbackModal
          visible={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false)
            setFeedbackTarget(null)
          }}
          targetName={feedbackTarget.name}
          targetType={feedbackTarget.type}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </ScrollView>
  )
}

// Keep all your existing styles exactly the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center'
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 0
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    includeFontPadding: false
  },
  titleAccent: {
    color: '#008ECC'
  },
  underline: {
    marginTop: 8,
    height: 3,
    width: '28%',
    backgroundColor: '#008ECC',
    borderRadius: 2
  },
  orderInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  orderId: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    marginBottom: 12,
    includeFontPadding: false
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 16,
    includeFontPadding: false
  },
  deliveryLabel: {
    fontWeight: '600',
    color: '#28a745'
  },
  deliveryDate: {
    fontWeight: '400',
    color: '#666666'
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  orderCardHeader: {
    flexDirection: 'row',
    marginBottom: 10
  },
  laundryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16
  },
  laundryInfo: {
    flex: 1,
    justifyContent: 'space-between'
  },
  orderIdText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4
  },
  laundryLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2
  },
  laundryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  servicesSection: {
    marginBottom: 5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#e8f4fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  serviceIconText: {
    fontSize: 16
  },
  serviceDetails: {
    flex: 1
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2
  },
  serviceWeight: {
    fontSize: 14,
    color: '#666666'
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333'
  },
  dottedSeparator: {
    height: 1,
    backgroundColor: 'transparent',
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    marginBottom: 10
  },
  datesSection: {
    marginBottom: 2
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  dateLabel: {
    fontSize: 16,
    color: '#666666'
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333'
  },
  // Simplified Pickup Card Styles
  pickupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  pickupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center'
  },
  driverInfo: {
    marginBottom: 16
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  driverLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500'
  },
  driverValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600'
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#02537F',
    flex: 1,
    justifyContent: 'center'
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  actionButtonTextGreen: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  billingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  billingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  billingLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400'
  },
  billingValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  totalLabel: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '700'
  },
  totalValue: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '700'
  }
})
