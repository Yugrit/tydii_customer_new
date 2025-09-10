// components/order/forms/CouponApplication.tsx
import ApiService from '@/services/ApiService'
import { ChevronDown } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

interface Coupon {
  id: string
  code: string
  description: string
  discount: number
  discountType: 'percentage' | 'fixed'
  minAmount?: number
  maxDiscount?: number
}

interface CouponApplicationProps {
  storeId: number
  userId: number
  totalAmount: number
  serviceType: string
  region: string
  onCouponApply: (couponCode: string, coupon?: Coupon) => void
  onCouponRemove: () => void
  appliedCoupon: Coupon | null
  disabled?: boolean
}

const CouponSelectionModal = ({
  visible,
  coupons,
  selectedCoupon,
  onSelectCoupon,
  onCancel,
  onApply,
  loading
}: {
  visible: boolean
  coupons: Coupon[]
  selectedCoupon: Coupon | null
  onSelectCoupon: (coupon: Coupon | null) => void
  onCancel: () => void
  onApply: () => void
  loading: boolean
}) => {
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

export default function CouponApplication ({
  storeId,
  userId,
  totalAmount,
  serviceType,
  region,
  onCouponApply,
  onCouponRemove,
  appliedCoupon,
  disabled = false
}: CouponApplicationProps) {
  const [couponCode, setCouponCode] = useState('')
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [loadingCoupons, setLoadingCoupons] = useState(false)

  // Fetch applicable coupons from API
  const fetchApplicableCoupons = async () => {
    if (!storeId || !userId || totalAmount <= 0) {
      return
    }

    setLoadingCoupons(true)
    try {
      console.log('🔄 Fetching applicable coupons...', {
        storeId,
        userId,
        totalAmount,
        serviceType,
        region
      })

      const response = await ApiService.get({
        url: `/customer/store/applicable?storeId=${storeId}&userId=${userId}&totalAmount=${totalAmount}&serviceType=${serviceType}&region=${region}`
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

  // Fetch coupons when component mounts or dependencies change
  useEffect(() => {
    if (!appliedCoupon) {
      fetchApplicableCoupons()
    }
  }, [storeId, userId, totalAmount, serviceType, region, appliedCoupon])

  // Handle coupon selection from modal
  const handleCouponSelect = () => {
    if (selectedCoupon) {
      setCouponCode(selectedCoupon.code)
      setShowCouponModal(false)
      onCouponApply(selectedCoupon.code, selectedCoupon)
    }
  }

  // Handle manual coupon application
  const handleManualCouponApply = () => {
    if (couponCode.trim()) {
      // Check if it's from available coupons
      const foundCoupon = availableCoupons.find(
        c => c.code.toUpperCase() === couponCode.toUpperCase()
      )

      onCouponApply(couponCode.trim(), foundCoupon || undefined)
    }
  }

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setCouponCode('')
    setSelectedCoupon(null)
    onCouponRemove()
  }

  // Reset modal selection when modal closes
  const handleModalCancel = () => {
    setSelectedCoupon(null)
    setShowCouponModal(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Coupon Code</Text>

      {/* Available Coupons Button */}
      {!appliedCoupon && availableCoupons.length > 0 && (
        <TouchableOpacity
          style={[
            styles.availableCouponsButton,
            disabled && styles.disabledButton
          ]}
          onPress={() => setShowCouponModal(true)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.availableCouponsText,
              disabled && styles.disabledText
            ]}
          >
            {availableCoupons.length} coupon
            {availableCoupons.length > 1 ? 's' : ''} available
          </Text>
          <ChevronDown size={16} color={disabled ? '#ccc' : '#008ECC'} />
        </TouchableOpacity>
      )}

      {appliedCoupon ? (
        /* Applied Coupon Display */
        <View style={styles.appliedCouponContainer}>
          <View style={styles.appliedCouponInfo}>
            <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
            <Text style={styles.appliedCouponDescription}>
              {appliedCoupon.description}
            </Text>
          </View>
          {!disabled && (
            <TouchableOpacity
              style={styles.removeCouponButton}
              onPress={handleRemoveCoupon}
            >
              <Text style={styles.removeCouponText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* Manual Coupon Input */
        <View style={styles.couponContainer}>
          <TextInput
            style={[styles.couponInput, disabled && styles.disabledInput]}
            placeholder='Enter Coupon Code'
            placeholderTextColor='#999'
            value={couponCode}
            onChangeText={setCouponCode}
            autoCapitalize='characters'
            editable={!disabled}
          />
          <TouchableOpacity
            style={[
              styles.applyButton,
              (!couponCode.trim() || disabled) && styles.applyButtonDisabled
            ]}
            onPress={handleManualCouponApply}
            disabled={!couponCode.trim() || disabled}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Coupon Selection Modal */}
      <CouponSelectionModal
        visible={showCouponModal}
        coupons={availableCoupons}
        selectedCoupon={selectedCoupon}
        onSelectCoupon={setSelectedCoupon}
        onCancel={handleModalCancel}
        onApply={handleCouponSelect}
        loading={loadingCoupons}
      />
    </View>
  )
}

// ... (keep all existing styles)

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    flexShrink: 1
  },

  // Available Coupons Button
  availableCouponsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#008ECC',
    marginBottom: 12
  },
  availableCouponsText: {
    fontSize: 14,
    color: '#008ECC',
    fontWeight: '600'
  },

  // Applied Coupon Display
  appliedCouponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f9ff',
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
    color: '#666',
    marginTop: 2,
    flexShrink: 1
  },
  removeCouponButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee'
  },
  removeCouponText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold'
  },

  // Manual Coupon Input
  couponContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
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
    backgroundColor: '#cccccc'
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
    color: '#ccc'
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#ccc'
  },

  // Coupon Modal Styles
  couponModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  couponModalContent: {
    backgroundColor: 'white',
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
    borderBottomColor: '#e0e0e0'
  },
  couponModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333'
  },
  couponModalClose: {
    fontSize: 24,
    color: '#666',
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
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: 'white'
  },
  couponItemSelected: {
    borderColor: '#008ECC',
    backgroundColor: '#f0f9ff'
  },
  couponContent: {
    flex: 1
  },
  couponCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  couponDescription: {
    fontSize: 14,
    color: '#666',
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
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  couponSelectorSelected: {
    borderColor: '#008ECC',
    backgroundColor: '#008ECC'
  },
  checkmark: {
    color: 'white',
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
    color: '#666',
    textAlign: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  couponModalButtons: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  couponCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center'
  },
  couponApplyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#008ECC',
    alignItems: 'center'
  },
  couponApplyButtonDisabled: {
    backgroundColor: '#cccccc'
  },
  couponCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  couponApplyText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
})
