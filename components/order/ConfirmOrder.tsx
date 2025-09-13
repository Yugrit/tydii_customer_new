// components/order/forms/ConfirmOrderForm.tsx
import { ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import { createOrderPayload, updateOrderData } from '@/Redux/slices/orderSlice'
import { RootState } from '@/Redux/Store'
import ApiService from '@/services/ApiService'
import { router } from 'expo-router'
import { ArrowLeft, ArrowRight, ChevronDown, Star } from 'lucide-react-native'
import React, { useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

interface ConfirmOrderFormProps {
  serviceType: ServiceTypeEnum
  onPrev: () => void
}

interface PaymentBreakdown {
  orderAmount: number
  campaignCode: string | null
  discount: number
  amountAfterDiscount: number
  tax: number
  platformFee: number
  deliveryCharge: number
  finalPayable: number
}

interface Coupon {
  id: string
  code: string
  description: string
  discount: number
  discountType: 'percentage' | 'fixed'
  minAmount?: number
  maxDiscount?: number
}

const ServiceIcon = ({
  category,
  colors
}: {
  category: string
  colors: any
}) => {
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

  const styles = createServiceIconStyles(colors)

  return (
    <View style={styles.serviceIcon}>
      <Text style={styles.serviceIconText}>{getIcon()}</Text>
    </View>
  )
}

const OrderItem = ({ item, colors }: { item: any; colors: any }) => {
  const styles = createOrderItemStyles(colors)

  return (
    <View style={styles.orderItemRow}>
      <ServiceIcon
        category={item.item_name || item.category || 'cloth'}
        colors={colors}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.item_name || item.category}</Text>
        <Text style={styles.itemWeight}>
          {item.quantity} {item.item_type === 'WASH_N_FOLD' ? 'lb' : 'pcs'}
        </Text>
        {/* Show tailoring types if available */}
        {item.tailoring_types && item.tailoring_types.length > 0 && (
          <Text style={styles.itemTailoring}>
            {item.tailoring_types.map((tt: any) => tt.name).join(', ')}
          </Text>
        )}
      </View>
      <Text style={styles.itemPrice}>
        ${item.price ? item.price.toFixed(2) : '0.00'}
      </Text>
    </View>
  )
}

const StoreInfo = ({ store, colors }: { store: any; colors: any }) => {
  const renderStars = () => {
    const stars = []
    const rating = store.rating || 4.5
    const fullStars = Math.floor(rating)

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

    return stars
  }

  const styles = createStoreInfoStyles(colors)

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
          {store.store_name || store.storeName || 'Selected Store'}
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
  total,
  colors
}: {
  visible: boolean
  onCancel: () => void
  onConfirm: () => void
  total: number
  colors: any
}) => {
  const styles = createModalStyles(colors)

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

// Coupon Selection Modal
const CouponSelectionModal = ({
  visible,
  coupons,
  selectedCoupon,
  onSelectCoupon,
  onCancel,
  onApply,
  loading,
  colors
}: {
  visible: boolean
  coupons: Coupon[]
  selectedCoupon: Coupon | null
  onSelectCoupon: (coupon: Coupon | null) => void
  onCancel: () => void
  onApply: () => void
  loading: boolean
  colors: any
}) => {
  const styles = createCouponModalStyles(colors)

  const renderCouponItem = ({ item }: { item: Coupon }) => (
    <TouchableOpacity
      style={[
        styles.couponItem,
        selectedCoupon?.id === item.id && styles.couponItemSelected
      ]}
      onPress={() =>
        onSelectCoupon(selectedCoupon?.id === item.id ? null : item)
      }
    >
      <View style={styles.couponContent}>
        <Text style={styles.couponCode}>{item.code}</Text>
        <Text style={styles.couponDescription}>{item.description}</Text>
        <Text style={styles.couponDiscount}>
          Save{' '}
          {item.discountType === 'percentage'
            ? `${item.discount}%`
            : `$${item.discount}`}
          {item.minAmount && ` (Min: $${item.minAmount})`}
          {item.maxDiscount && ` (Max: $${item.maxDiscount})`}
        </Text>
      </View>
      <View
        style={[
          styles.couponSelector,
          selectedCoupon?.id === item.id && styles.couponSelectorSelected
        ]}
      >
        {selectedCoupon?.id === item.id && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onCancel}
    >
      <View style={styles.couponModalOverlay}>
        <View style={styles.couponModalContent}>
          <View style={styles.couponModalHeader}>
            <Text style={styles.couponModalTitle}>Select Coupon</Text>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.couponModalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.couponLoadingContainer}>
              <Text style={styles.loadingText}>Loading coupons...</Text>
            </View>
          ) : coupons.length === 0 ? (
            <View style={styles.noCouponsContainer}>
              <Text style={styles.noCouponsText}>
                No coupons available for this order
              </Text>
            </View>
          ) : (
            <FlatList
              data={coupons}
              renderItem={renderCouponItem}
              keyExtractor={item => item.id}
              style={styles.couponList}
              showsVerticalScrollIndicator={false}
            />
          )}

          <View style={styles.couponModalButtons}>
            <TouchableOpacity
              style={styles.couponCancelButton}
              onPress={onCancel}
            >
              <Text style={styles.couponCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.couponApplyButton,
                !selectedCoupon && styles.couponApplyButtonDisabled
              ]}
              onPress={onApply}
              disabled={!selectedCoupon}
            >
              <Text style={styles.couponApplyText}>Apply Coupon</Text>
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
  const { orderData } = useSelector((state: RootState) => state.order)
  const { userData } = useSelector((state: any) => state.user)
  const colors = useThemeColors()
  const dispatch = useDispatch()

  console.log(orderData)

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Coupon-related state
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [loadingCoupons, setLoadingCoupons] = useState(false)

  // Payment breakdown from backend API
  const [paymentBreakdown, setPaymentBreakdown] =
    useState<PaymentBreakdown | null>(null)
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)
  const [breakdownError, setBreakdownError] = useState<string | null>(null)

  // Get order total from Redux
  const orderTotal = orderData.paymentBreakdown?.orderAmount || 0

  // OrderNavigationButtons Component (inline)
  const OrderNavigationButtons = ({
    onPrevious,
    onNext,
    disabled = false,
    previousLabel = 'Previous',
    nextLabel = 'Checkout'
  }: {
    onPrevious: () => void
    onNext: () => void
    disabled?: boolean
    previousLabel?: string
    nextLabel?: string
  }) => {
    const { currentStep, isStoreFlow } = useSelector(
      (state: RootState) => state.order
    )

    const navigationStyles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 10,
            gap: 12
          },
          button: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 15,
            borderRadius: 10,
            minHeight: 48
          },
          previousButton: {
            backgroundColor: '#DEEDF6'
          },
          nextButton: {
            backgroundColor: '#02537F'
          },
          disabledButton: {
            opacity: 0.6
          },
          buttonText: {
            fontSize: 16,
            fontWeight: '600',
            marginHorizontal: 8
          },
          previousButtonText: {
            color: '#02537F'
          },
          nextButtonText: {
            color: 'white'
          },
          disabledButtonText: {
            color: colors.surface
          },
          iconStyle: {
            backgroundColor: 'white',
            padding: 10,
            borderRadius: 50 // Use number instead of '50%' for React Native
          }
        }),
      [colors]
    )

    const maxSteps = isStoreFlow ? 4 : 5
    const showPrevious = currentStep > 1
    const showNext = true

    return (
      <View style={navigationStyles.container}>
        {/* Previous Button - Show only if not on first step */}
        {showPrevious ? (
          <TouchableOpacity
            style={[
              navigationStyles.button,
              navigationStyles.previousButton,
              disabled && navigationStyles.disabledButton
            ]}
            onPress={onPrevious}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <ArrowLeft
              size={20}
              color={disabled ? colors.textSecondary : colors.primary}
              style={navigationStyles.iconStyle}
            />
            <Text
              style={[
                navigationStyles.buttonText,
                navigationStyles.previousButtonText,
                disabled && navigationStyles.disabledButtonText
              ]}
            >
              {previousLabel}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* Next Button */}
        {showNext && (
          <TouchableOpacity
            style={[
              navigationStyles.button,
              navigationStyles.nextButton,
              disabled && navigationStyles.disabledButton
            ]}
            onPress={onNext}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Text
              style={[
                navigationStyles.buttonText,
                navigationStyles.nextButtonText,
                disabled && navigationStyles.disabledButtonText
              ]}
            >
              {nextLabel}
            </Text>
            <ArrowRight
              size={20}
              color={disabled ? colors.textSecondary : colors.primary}
              style={navigationStyles.iconStyle}
            />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  // Handle checkout with orderData logging and payload dispatch
  const handleCheckoutClick = () => {
    console.log('📦 Order Data on Checkout:', {
      orderData,
      serviceType,
      totalAmount: orderTotal,
      paymentBreakdown,
      appliedCoupon,
      timestamp: new Date().toISOString()
    })

    // Dispatch createOrderPayload action
    dispatch(
      createOrderPayload({
        userId: userData.id,
        finalPaymentBreakdown: paymentBreakdown ?? undefined,
        ...(appliedCoupon &&
          appliedCoupon.id !== 'custom' && {
            campaignId: parseInt(appliedCoupon.id)
          })
      })
    )

    console.log('🚀 createOrderPayload action dispatched')

    setShowPaymentModal(true)
  }

  // Handle back navigation with payload clearing
  const handleBackNavigation = () => {
    console.log('🔙 Clearing created order payload on back navigation')

    // Clear the createOrderPayload from Redux
    dispatch(
      updateOrderData({
        step: 'createOrderPayload',
        data: undefined
      })
    )

    // Call the original onPrev function
    onPrev()
  }

  // Fetch applicable coupons from API
  const fetchApplicableCoupons = async () => {
    if (!orderData.selectedStore || !userData || orderTotal <= 0) {
      return
    }

    setLoadingCoupons(true)
    try {
      console.log('🔄 Fetching applicable coupons...')

      const storeId = orderData.selectedStore.store_id
      const userId = userData.id
      const region = userData.region

      const response = await ApiService.get({
        url: `/customer/store/applicable?storeId=${storeId}&userId=${userId}&totalAmount=${orderTotal}&serviceType=${serviceType}&region=${region}`
      })

      console.log('🎫 Coupons response:', response)
      const coupons = response.data || response || []
      setAvailableCoupons(Array.isArray(coupons) ? coupons : [])
    } catch (error) {
      console.error('❌ Failed to fetch coupons:', error)
      setAvailableCoupons([])
    } finally {
      setLoadingCoupons(false)
    }
  }

  // Fetch payment breakdown from backend API
  const fetchPaymentBreakdown = async (
    orderAmount: number,
    couponCode?: string
  ) => {
    if (!orderAmount || orderAmount <= 0) {
      setPaymentBreakdown(null)
      return
    }

    setLoadingBreakdown(true)
    setBreakdownError(null)

    try {
      console.log(
        '🔄 Fetching payment breakdown for amount:',
        orderAmount,
        'with coupon:',
        couponCode
      )

      let url = `/customer/orders/calculate-breakdown?orderAmount=${orderAmount}`
      if (couponCode) {
        url += `&campaignCode=${couponCode}`
      }

      const response = await ApiService.get({ url })

      console.log('📊 Payment breakdown response:', response)
      setPaymentBreakdown(response)
    } catch (error) {
      console.error('❌ Failed to fetch payment breakdown:', error)
      setBreakdownError('Failed to load payment breakdown')

      // Set fallback breakdown if API fails
      setPaymentBreakdown({
        orderAmount: orderAmount,
        campaignCode: couponCode || null,
        discount: 0,
        amountAfterDiscount: orderAmount,
        tax: Math.round(orderAmount * 0.21),
        platformFee: 0,
        deliveryCharge: 5,
        finalPayable: orderAmount + Math.round(orderAmount * 0.21) + 5
      })
    } finally {
      setLoadingBreakdown(false)
    }
  }

  // Fetch breakdown and coupons when component mounts or when orderTotal changes
  useEffect(() => {
    fetchPaymentBreakdown(orderTotal)
    if (!appliedCoupon) {
      fetchApplicableCoupons()
    }
  }, [orderTotal])

  // Handle coupon selection from modal
  const handleCouponSelect = () => {
    if (selectedCoupon) {
      setAppliedCoupon(selectedCoupon)
      setCouponCode(selectedCoupon.code)
      setShowCouponModal(false)

      // Re-fetch breakdown with coupon
      fetchPaymentBreakdown(orderTotal, selectedCoupon.code)
    }
  }

  // Handle manual coupon application
  const applyCoupon = () => {
    if (couponCode.trim()) {
      // Check if it's from available coupons
      const foundCoupon = availableCoupons.find(
        c => c.code.toUpperCase() === couponCode.toUpperCase()
      )

      if (foundCoupon) {
        setAppliedCoupon(foundCoupon)
      } else {
        // Custom coupon code
        setAppliedCoupon({
          id: 'custom',
          code: couponCode,
          description: 'Custom coupon code',
          discount: 0,
          discountType: 'fixed'
        })
      }

      // Re-fetch breakdown with coupon
      fetchPaymentBreakdown(orderTotal, couponCode)
    }
  }

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setSelectedCoupon(null)
    // Re-fetch breakdown without coupon
    fetchPaymentBreakdown(orderTotal)
    // Re-fetch available coupons
    fetchApplicableCoupons()
  }

  // Handle payment confirmation with order creation API
  const handlePaymentConfirm = async () => {
    try {
      setIsProcessing(true)
      setShowPaymentModal(false)

      console.log('💳 Creating order with API...')

      // Get the created order payload from Redux
      const createOrderPayloadData = orderData.createOrderPayload

      if (!createOrderPayloadData) {
        console.error('❌ No order payload found in Redux')
        setIsProcessing(false)
        return
      }

      console.log('📤 Sending order payload:', createOrderPayloadData)

      // Call the order creation API
      const response = await ApiService.post({
        url: '/customer/orders/create',
        data: createOrderPayloadData
      })

      console.log('✅ Order created successfully:', response)

      // Extract checkout URL from response
      const checkoutUrl = response?.checkout_url

      if (checkoutUrl) {
        console.log('🌐 Opening checkout URL in browser:', checkoutUrl)

        // Open checkout URL in external browser
        await Linking.openURL(checkoutUrl)

        // Navigate to order confirmed page in the app
        router.dismissAll()
        router.replace('./orderconfirmed')
      } else {
        console.error('❌ No checkout URL received from API')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('❌ Order creation failed:', error)
      setIsProcessing(false)
    }
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
  }

  const styles = createMainStyles(colors)

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
            <StoreInfo store={orderData.selectedStore} colors={colors} />
          </View>

          {/* Selected Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Services</Text>
            <View style={styles.servicesContainer}>
              {orderData.selectedClothes.items.map((item, index) => (
                <OrderItem key={`item-${index}`} item={item} colors={colors} />
              ))}
            </View>
          </View>

          {/* Subtotal */}
          <View style={styles.subtotalSection}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Subtotal</Text>
              <Text style={styles.feeValue}>${orderTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment Breakdown from Backend API */}
          <View style={styles.feesSection}>
            {loadingBreakdown ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Calculating fees...</Text>
              </View>
            ) : breakdownError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Failed to calculate fees. Using estimated amounts.
                </Text>
              </View>
            ) : null}

            {paymentBreakdown && (
              <>
                <View style={styles.feeRow}>
                  <View style={{ width: '50%' }}>
                    <Text style={styles.feeLabel}>Tax</Text>
                  </View>
                  <Text style={styles.feeValue}>
                    ${paymentBreakdown.tax.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.feeRow}>
                  <View style={{ width: '50%' }}>
                    <Text style={styles.feeLabel}>Platform Fee</Text>
                  </View>
                  <Text style={styles.feeValue}>
                    ${paymentBreakdown.platformFee.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.feeRow}>
                  <View style={{ width: '50%' }}>
                    <Text style={styles.feeLabel}>Delivery Charge</Text>
                  </View>
                  <Text style={styles.feeValue}>
                    ${paymentBreakdown.deliveryCharge.toFixed(2)}
                  </Text>
                </View>

                {paymentBreakdown.discount > 0 && (
                  <View style={styles.feeRow}>
                    <Text style={[styles.feeLabel, styles.discountLabel]}>
                      Discount
                    </Text>
                    <Text style={[styles.feeValue, styles.discountValue]}>
                      -${paymentBreakdown.discount.toFixed(2)}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Coupon Code Section */}
          <View style={styles.couponSection}>
            <Text style={styles.sectionTitle}>Coupon Code</Text>

            {/* Available Coupons Button */}
            {availableCoupons.length > 0 && !appliedCoupon && (
              <TouchableOpacity
                style={[
                  styles.availableCouponsButton,
                  (loadingBreakdown || isProcessing) && styles.disabledButton
                ]}
                onPress={() => setShowCouponModal(true)}
                disabled={loadingBreakdown || isProcessing}
              >
                <Text
                  style={[
                    styles.availableCouponsText,
                    (loadingBreakdown || isProcessing) && styles.disabledText
                  ]}
                >
                  {availableCoupons.length} coupon
                  {availableCoupons.length > 1 ? 's' : ''} available
                </Text>
                <ChevronDown
                  size={16}
                  color={
                    loadingBreakdown || isProcessing
                      ? colors.textSecondary
                      : colors.primary
                  }
                />
              </TouchableOpacity>
            )}

            {appliedCoupon ? (
              /* Applied Coupon Display */
              <View style={styles.appliedCouponContainer}>
                <View style={styles.appliedCouponInfo}>
                  <Text style={styles.appliedCouponCode}>
                    {appliedCoupon.code}
                  </Text>
                  <Text style={styles.appliedCouponDescription}>
                    {appliedCoupon.description}
                  </Text>
                </View>
                {!(loadingBreakdown || isProcessing) && (
                  <TouchableOpacity
                    style={styles.removeCouponButton}
                    onPress={removeCoupon}
                  >
                    <Text style={styles.removeCouponText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              /* Manual Coupon Input */
              <View style={styles.couponContainer}>
                <TextInput
                  style={[
                    styles.couponInput,
                    (loadingBreakdown || isProcessing) && styles.disabledInput
                  ]}
                  placeholder='Enter Coupon Code'
                  placeholderTextColor={colors.textSecondary}
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize='characters'
                  editable={!(loadingBreakdown || isProcessing)}
                />
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    (!couponCode.trim() || loadingBreakdown || isProcessing) &&
                      styles.applyButtonDisabled
                  ]}
                  onPress={applyCoupon}
                  disabled={
                    !couponCode.trim() || loadingBreakdown || isProcessing
                  }
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Total Amount from Backend */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total amount:</Text>
            <Text style={styles.totalAmount}>
              $
              {paymentBreakdown
                ? paymentBreakdown.finalPayable.toFixed(2)
                : orderTotal.toFixed(2)}
            </Text>
          </View>

          {/* OrderNavigationButtons with logging and payload clearing */}
          <OrderNavigationButtons
            onPrevious={handleBackNavigation}
            onNext={handleCheckoutClick}
            disabled={isProcessing || loadingBreakdown}
            previousLabel='Previous'
            nextLabel={isProcessing ? 'Processing...' : 'Checkout'}
          />
        </View>
      </ScrollView>

      {/* Coupon Selection Modal */}
      <CouponSelectionModal
        visible={showCouponModal}
        coupons={availableCoupons}
        selectedCoupon={selectedCoupon}
        onSelectCoupon={setSelectedCoupon}
        onCancel={() => {
          setSelectedCoupon(null)
          setShowCouponModal(false)
        }}
        onApply={handleCouponSelect}
        loading={loadingCoupons}
        colors={colors}
      />

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        visible={showPaymentModal}
        onCancel={handlePaymentCancel}
        onConfirm={handlePaymentConfirm}
        total={paymentBreakdown ? paymentBreakdown.finalPayable : orderTotal}
        colors={colors}
      />
    </>
  )
}

// Main styles
const createMainStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20
    },
    formCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 20,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      flexShrink: 1
    },
    loadingContainer: {
      padding: 16,
      alignItems: 'center'
    },
    errorContainer: {
      padding: 12,
      backgroundColor: colors.notification + '20',
      borderRadius: 8,
      marginBottom: 16,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.notification + '50'
    },
    errorText: {
      fontSize: 14,
      color: colors.notification,
      textAlign: 'center',
      flexShrink: 1
    },

    // Sections
    section: {
      marginBottom: 24,
      paddingHorizontal: 4
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      flexShrink: 1
    },

    // Services
    servicesContainer: {
      gap: 16,
      paddingHorizontal: 4
    },

    // Subtotal Section
    subtotalSection: {
      marginBottom: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 4
    },

    // Fees Section
    feesSection: {
      marginBottom: 24,
      paddingVertical: 8,
      paddingHorizontal: 4
    },
    feeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4
    },
    feeLabel: {
      fontSize: 16,
      color: colors.text,
      flexShrink: 1,
      paddingRight: 12
    },
    feeValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flexShrink: 0,
      minWidth: 70,
      paddingRight: 4,
      textAlign: 'right'
    },
    discountLabel: {
      color: '#4caf50'
    },
    discountValue: {
      color: '#4caf50'
    },

    // Coupon Section
    couponSection: {
      marginBottom: 24,
      paddingHorizontal: 4
    },
    availableCouponsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      backgroundColor: colors.light,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: 12
    },
    availableCouponsText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600'
    },
    appliedCouponContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.light,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#4caf50'
    },
    appliedCouponInfo: {
      flex: 1
    },
    appliedCouponCode: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4caf50'
    },
    appliedCouponDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
      flexShrink: 1
    },
    removeCouponButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.notification + '20'
    },
    removeCouponText: {
      fontSize: 16,
      color: colors.notification,
      fontWeight: 'bold'
    },
    couponContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center'
    },
    couponInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: colors.background,
      color: colors.text,
      textTransform: 'uppercase'
    },
    applyButton: {
      backgroundColor: '#28a745',
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 80,
      flexShrink: 0
    },
    applyButtonDisabled: {
      backgroundColor: colors.border
    },
    applyButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600'
    },

    // Disabled states
    disabledButton: {
      opacity: 0.6
    },
    disabledText: {
      color: colors.textSecondary
    },
    disabledInput: {
      backgroundColor: colors.surface,
      color: colors.textSecondary
    },

    // Total Section
    totalSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
      paddingTop: 16,
      borderTopWidth: 2,
      borderTopColor: colors.border,
      paddingHorizontal: 4
    },
    totalLabel: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      flexShrink: 1,
      paddingRight: 12
    },
    totalAmount: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      flexShrink: 0,
      minWidth: 100,
      paddingRight: 4,
      textAlign: 'right'
    }
  })

// Service Icon styles
const createServiceIconStyles = (colors: any) =>
  StyleSheet.create({
    serviceIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.light,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      flexShrink: 0
    },
    serviceIconText: {
      fontSize: 16
    }
  })

// Order Item styles
const createOrderItemStyles = (colors: any) =>
  StyleSheet.create({
    orderItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4
    },
    itemInfo: {
      flex: 1,
      paddingRight: 8
    },
    itemName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 2,
      flexShrink: 1
    },
    itemWeight: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
      flexShrink: 1
    },
    itemTailoring: {
      fontSize: 12,
      color: colors.primary,
      fontStyle: 'italic',
      flexShrink: 1
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flexShrink: 0,
      minWidth: 60,
      paddingRight: 4,
      textAlign: 'right'
    }
  })

// Store Info styles
const createStoreInfoStyles = (colors: any) =>
  StyleSheet.create({
    storeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4
    },
    storeImage: {
      width: 60,
      height: 50,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: colors.surface
    },
    storeInfo: {
      flex: 1
    },
    storeName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      flexShrink: 1,
      paddingRight: 8
    },
    storeRating: {
      flexDirection: 'row'
    }
  })

// Modal styles
const createModalStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20
    },
    modalContent: {
      backgroundColor: colors.background,
      padding: 24,
      borderRadius: 16,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
      elevation: 10,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
      flexShrink: 1
    },
    modalMessage: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
      flexShrink: 1,
      paddingHorizontal: 4
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 16,
      width: '100%'
    },
    modalCancelButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalConfirmButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalCancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center'
    },
    modalConfirmText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background,
      textAlign: 'center'
    }
  })

// Coupon Modal styles
const createCouponModalStyles = (colors: any) =>
  StyleSheet.create({
    couponModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end'
    },
    couponModalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      paddingTop: 20
    },
    couponModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    couponModalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text
    },
    couponModalClose: {
      fontSize: 24,
      color: colors.textSecondary,
      padding: 4
    },
    couponList: {
      maxHeight: 400,
      paddingHorizontal: 20
    },
    couponItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginVertical: 6,
      backgroundColor: colors.background
    },
    couponItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.light
    },
    couponContent: {
      flex: 1
    },
    couponCode: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4
    },
    couponDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
      flexShrink: 1
    },
    couponDiscount: {
      fontSize: 14,
      color: '#4caf50',
      fontWeight: '600'
    },
    couponSelector: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center'
    },
    couponSelectorSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary
    },
    checkmark: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold'
    },
    couponLoadingContainer: {
      padding: 40,
      alignItems: 'center'
    },
    noCouponsContainer: {
      padding: 40,
      alignItems: 'center'
    },
    noCouponsText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    couponModalButtons: {
      flexDirection: 'row',
      gap: 16,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border
    },
    couponCancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center'
    },
    couponApplyButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center'
    },
    couponApplyButtonDisabled: {
      backgroundColor: colors.border
    },
    couponCancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary
    },
    couponApplyText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    }
  })
