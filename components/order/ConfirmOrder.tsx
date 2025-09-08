// components/order/forms/ConfirmOrderForm.tsx
import { ServiceTypeEnum } from '@/enums'
import { RootState } from '@/Redux/Store'
import { router } from 'expo-router'
import { Star } from 'lucide-react-native'
import React, { useState } from 'react'
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import OrderNavigationButtons from './OrderNavigationButtons'

interface ConfirmOrderFormProps {
  serviceType: ServiceTypeEnum
  onPrev: () => void
}

const ServiceIcon = ({ category }: { category: string }) => {
  const getIcon = () => {
    const categoryLower = category.toLowerCase()

    if (categoryLower.includes('mix') || categoryLower.includes('cloth'))
      return '👕'
    if (categoryLower.includes('household') || categoryLower.includes('towel'))
      return '🏠'
    if (
      categoryLower.includes('shirt') ||
      categoryLower.includes('dress shirt')
    )
      return '👔'
    if (categoryLower.includes('pant') || categoryLower.includes('trouser'))
      return '👖'
    if (categoryLower.includes('duvet') || categoryLower.includes('comforter'))
      return '🛏️'

    return '👕' // default
  }

  return (
    <View style={styles.serviceIcon}>
      <Text style={styles.serviceIconText}>{getIcon()}</Text>
    </View>
  )
}

const OrderItem = ({ item }: { item: any }) => {
  return (
    <View style={styles.orderItemRow}>
      <ServiceIcon category={item.item_name || item.category || 'cloth'} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.item_name || item.category}</Text>
        <Text style={styles.itemWeight}>
          {item.quantity} {item.item_type === 'WASH_N_FOLD' ? 'lb' : 'pcs'}
        </Text>
      </View>
      <Text style={styles.itemPrice}>$ {item.price.toFixed(2)}</Text>
    </View>
  )
}

const StoreInfo = ({ store }: { store: any }) => {
  const renderStars = () => {
    const stars = []
    const rating = store.rating || 4.5
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          size={16}
          color='#FFD700'
          fill='#FFD700'
          strokeWidth={0}
        />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key='half'
          size={16}
          color='#FFD700'
          fill='#FFD700'
          strokeWidth={0}
        />
      )
    }

    return stars
  }

  return (
    <View style={styles.storeContainer}>
      <Image
        source={{
          uri:
            store.uploadDoc?.[0]?.fileUrl ||
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=80&fit=crop'
        }}
        style={styles.storeImage}
      />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>
          {store.store_name || store.storeName || 'Laundry Basket'}
        </Text>
        <View style={styles.storeRating}>{renderStars()}</View>
      </View>
    </View>
  )
}

// Payment Confirmation Modal Component
const PaymentConfirmationModal = ({
  visible,
  onCancel,
  onConfirm,
  total
}: {
  visible: boolean
  onCancel: () => void
  onConfirm: () => void
  total: number
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Payment</Text>
          <Text style={styles.modalMessage}>
            Do you want to proceed to pay ${total.toFixed(2)}?
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onCancel}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={onConfirm}
            >
              <Text style={styles.modalConfirmText}>Proceed to Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default function ConfirmOrderForm ({
  serviceType,
  onPrev
}: ConfirmOrderFormProps) {
  const dispatch = useDispatch()
  const { orderData } = useSelector((state: RootState) => state.order)

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Calculate totals from Redux data
  const calculateTotals = () => {
    const items = orderData.selectedClothes?.items || []
    const subtotal = items.reduce((sum, item) => sum + item.price, 0)
    const platformFee = 0.0
    const tax = 1.0
    const deliveryFee = 2.0
    const total = subtotal + platformFee + tax + deliveryFee

    return {
      subtotal,
      platformFee,
      tax,
      deliveryFee,
      total: appliedCoupon ? total * 0.9 : total
    }
  }

  const totals = calculateTotals()

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setAppliedCoupon(true)
    }
  }

  const handleCheckoutClick = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentConfirm = () => {
    setIsProcessing(true)
    setShowPaymentModal(false)
    router.dismissAll()
    router.replace('./orderconfirmed')
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
  }

  // Handle case where Redux data is not yet available
  if (!orderData.selectedClothes || !orderData.selectedStore) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    )
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          {/* Selected Shop */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Shop</Text>
            <StoreInfo store={orderData.selectedStore} />
          </View>

          {/* Selected Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Services</Text>
            <View style={styles.servicesContainer}>
              {orderData.selectedClothes.items.map((item, index) => (
                <OrderItem key={`item-${index}`} item={item} />
              ))}
            </View>
          </View>

          {/* Fee Breakdown */}
          <View style={styles.feesSection}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Platform Fee</Text>
              <Text style={styles.feeValue}>
                $ {totals.platformFee.toFixed(2)}
              </Text>
            </View>

            <View style={styles.feeRow}>
              <View>
                <Text style={styles.feeLabel}>Tax</Text>
              </View>
              <View>
                <Text style={styles.feeValue}>$ {totals.tax.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Delivery Partner fee</Text>
              <Text style={styles.feeValue}>
                $ {totals.deliveryFee.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Coupon Code */}
          <View style={styles.couponSection}>
            <Text style={styles.sectionTitle}>Coupon Code</Text>
            <View style={styles.couponContainer}>
              <TextInput
                style={styles.couponInput}
                placeholder='Enter Coupon Code'
                placeholderTextColor='#999'
                value={couponCode}
                onChangeText={setCouponCode}
                editable={!appliedCoupon}
              />
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  appliedCoupon && styles.appliedButton
                ]}
                onPress={applyCoupon}
                disabled={appliedCoupon}
              >
                <Text style={styles.applyButtonText}>
                  {appliedCoupon ? '✓' : 'Apply'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Amount */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total amount:</Text>
            <Text style={styles.totalAmount}>$ {totals.total.toFixed(2)}</Text>
          </View>

          {/* Navigation Buttons */}
          <OrderNavigationButtons
            onPrevious={onPrev}
            onNext={handleCheckoutClick}
            previousLabel='Previous'
            nextLabel={isProcessing ? 'Processing...' : 'Checkout'}
            disabled={isProcessing}
          />
        </View>
      </ScrollView>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        visible={showPaymentModal}
        onCancel={handlePaymentCancel}
        onConfirm={handlePaymentConfirm}
        total={totals.total}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },

  // Sections
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },

  // Store Info
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  storeImage: {
    width: 60,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0'
  },
  storeInfo: {
    flex: 1
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  storeRating: {
    flexDirection: 'row'
  },

  // Services
  servicesContainer: {
    gap: 16
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e8f4fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  serviceIconText: {
    fontSize: 16
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2
  },
  itemWeight: {
    fontSize: 14,
    color: '#666'
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },

  // Fees Section
  feesSection: {
    marginBottom: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  feeLabel: {
    fontSize: 16,
    color: '#333'
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },

  // Coupon Section
  couponSection: {
    marginBottom: 24
  },
  couponContainer: {
    flexDirection: 'row',
    gap: 8
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white'
  },
  applyButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80
  },
  appliedButton: {
    backgroundColor: '#198754'
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },

  // Total Section
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0'
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333'
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333'
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%'
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center'
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#008ECC',
    alignItems: 'center'
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
})
