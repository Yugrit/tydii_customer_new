// components/order/forms/ConfirmOrderForm.tsx
import { ServiceTypeEnum } from '@/enums'
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
import { useDispatch } from 'react-redux'
import OrderNavigationButtons from './OrderNavigationButtons'

interface OrderItem {
  id: string
  name: string
  description: string[]
  price: number
  quantity?: number
  category: string
  icon?: string
}

interface Store {
  id: string
  name: string
  rating: number
  image: string
}

interface OrderData {
  serviceType: ServiceTypeEnum
  store: Store
  items: OrderItem[]
  fees: {
    platformFee: number
    tax: number
    deliveryFee: number
  }
  subtotal: number
  total: number
}

interface ConfirmOrderFormProps {
  serviceType: ServiceTypeEnum
  onPrev: () => void
}

const ServiceIcon = ({ category }: { category: string }) => {
  const getIcon = () => {
    switch (category) {
      case 'shirt':
        return '👔'
      case 'pant':
        return '👖'
      case 'skirt':
        return '👗'
      case 'top':
        return '👕'
      case 'saree':
        return '🥻'
      case 'mixCloth':
        return '👕'
      case 'householdCloth':
        return '🏠'
      case 'doorMats':
        return '🚪'
      case 'curtains':
        return '🪟'
      default:
        return '👕'
    }
  }

  return (
    <View style={styles.serviceIcon}>
      <Text style={styles.serviceIconText}>{getIcon()}</Text>
    </View>
  )
}

const OrderItem = ({ item }: { item: OrderItem }) => {
  return (
    <View style={styles.orderItem}>
      <ServiceIcon category={item.category} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.description.map((desc, index) => (
          <Text key={index} style={styles.itemDescription}>
            {desc}
          </Text>
        ))}
      </View>
      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
    </View>
  )
}

const StoreInfo = ({ store }: { store: Store }) => {
  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(store.rating)
    const hasHalfStar = store.rating - fullStars >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          size={14}
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
          size={14}
          color='#FFD700'
          fill='#FFD700'
          strokeWidth={0}
        />
      )
    }

    return stars
  }

  return (
    <View style={styles.storeInfo}>
      <Image source={{ uri: store.image }} style={styles.storeImage} />
      <View style={styles.storeDetails}>
        <Text style={styles.storeName}>{store.name}</Text>
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
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Dynamic data based on service type
  const getOrderData = (): OrderData => {
    const baseStore = {
      id: '1',
      name: 'Laundry Basket',
      rating: 4.5,
      image:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=80&fit=crop'
    }

    const baseFees = {
      platformFee: 0.0,
      tax: 1.0,
      deliveryFee: 2.0
    }

    switch (serviceType) {
      case ServiceTypeEnum.WASH_N_FOLD:
        return {
          serviceType,
          store: baseStore,
          items: [
            {
              id: '1',
              name: 'Mix Cloth',
              description: ['Cotton Blend', 'Regular Wash'],
              price: 12.0,
              category: 'mixCloth'
            },
            {
              id: '2',
              name: 'Household Cloth',
              description: ['Towels & Linens', 'Hot Wash'],
              price: 8.0,
              category: 'householdCloth'
            },
            {
              id: '3',
              name: 'Curtains',
              description: ['Delicate Care', 'Gentle Cycle'],
              price: 5.0,
              category: 'curtains'
            }
          ],
          fees: baseFees,
          subtotal: 25.0,
          total: 28.0
        }

      case ServiceTypeEnum.DRYCLEANING:
        return {
          serviceType,
          store: baseStore,
          items: [
            {
              id: '1',
              name: 'Shirt - Male',
              description: ['Button Fix', 'Bottom Length Crop'],
              price: 10.0,
              category: 'shirt'
            },
            {
              id: '2',
              name: 'Skirt - Female',
              description: ['Button Fix', 'Waist Fix'],
              price: 15.0,
              category: 'skirt'
            }
          ],
          fees: baseFees,
          subtotal: 25.0,
          total: 28.0
        }

      case ServiceTypeEnum.TAILORING:
        return {
          serviceType,
          store: baseStore,
          items: [
            {
              id: '1',
              name: 'Shirt - Male',
              description: ['Hemming', 'Sleeve Adjustment'],
              price: 18.0,
              category: 'shirt'
            },
            {
              id: '2',
              name: 'Pant - Female',
              description: ['Waist Adjustment', 'Length Alteration'],
              price: 22.0,
              category: 'pant'
            }
          ],
          fees: baseFees,
          subtotal: 40.0,
          total: 43.0
        }

      default:
        return {
          serviceType,
          store: baseStore,
          items: [],
          fees: baseFees,
          subtotal: 0,
          total: 0
        }
    }
  }

  const orderData = getOrderData()

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

  const getServiceTitle = () => {
    switch (serviceType) {
      case ServiceTypeEnum.WASH_N_FOLD:
        return 'Wash & Fold'
      case ServiceTypeEnum.DRYCLEANING:
        return 'Dry Cleaning'
      case ServiceTypeEnum.TAILORING:
        return 'Tailoring'
      default:
        return 'Service'
    }
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.title}>
            <Text style={styles.titleAccent}>{getServiceTitle()}</Text> Order
            Summary
          </Text>
          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            {/* Selected Shop */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected Shop</Text>
              <StoreInfo store={orderData.store} />
            </View>

            {/* Selected Services */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected Services</Text>
              {orderData.items.map(item => (
                <OrderItem key={item.id} item={item} />
              ))}
            </View>

            {/* Pricing Breakdown */}
            <View style={styles.section}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Platform Fee</Text>
                <Text style={styles.feeValue}>
                  $ {orderData.fees.platformFee.toFixed(2)}
                </Text>
              </View>

              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Tax</Text>
                <Text style={styles.feeValue}>
                  $ {orderData.fees.tax.toFixed(2)}
                </Text>
              </View>

              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Delivery Partner fee</Text>
                <Text style={styles.feeValue}>
                  $ {orderData.fees.deliveryFee.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Coupon Code */}
            <View style={styles.section}>
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
                  <Text
                    style={[
                      styles.applyButtonText,
                      appliedCoupon && styles.appliedButtonText
                    ]}
                  >
                    {appliedCoupon ? '✓' : 'Apply'}
                  </Text>
                </TouchableOpacity>
              </View>
              {appliedCoupon && (
                <Text style={styles.couponSuccess}>
                  Coupon applied successfully!
                </Text>
              )}
            </View>

            {/* Total Amount */}
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total amount:</Text>
                <Text style={styles.totalAmount}>
                  $ {orderData.total.toFixed(2)}
                </Text>
              </View>
            </View>
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
        total={orderData.total}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    marginHorizontal: 15,
    paddingBottom: 20
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    color: '#333',
    marginBottom: 10
  },
  titleAccent: {
    color: '#008ECC'
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 15
  },
  inputContainer: {
    paddingHorizontal: 20
  },

  // Sections
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },

  // Store Info
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  storeImage: {
    width: 50,
    height: 40,
    borderRadius: 6,
    marginRight: 12
  },
  storeDetails: {
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

  // Order Items
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e6f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  serviceIconText: {
    fontSize: 18
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },

  // Fee Rows
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  feeLabel: {
    fontSize: 14,
    color: '#333'
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },

  // Coupon Section
  couponContainer: {
    flexDirection: 'row',
    gap: 10
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8f9fa'
  },
  applyButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  appliedButton: {
    backgroundColor: '#198754'
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  appliedButtonText: {
    fontSize: 16
  },
  couponSuccess: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 8,
    fontWeight: '500'
  },

  // Total Section
  totalSection: {
    borderTopWidth: 2,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
    marginTop: 8
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#28a745'
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
