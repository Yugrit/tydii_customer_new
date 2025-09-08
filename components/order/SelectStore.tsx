// components/order/forms/StoreSelectionForm.tsx
import { updateSelectedStore } from '@/Redux/slices/orderSlice'
import { RootState } from '@/Redux/Store'
import ApiService from '@/services/ApiService'
import { Store } from '@/types'
import { Heart, Star, StarHalf } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import OrderNavigationButtons from './OrderNavigationButtons'

interface StoreSelectionFormProps {
  onNext: () => void
  onPrev: () => void
}

const StoreCard = ({
  store,
  selected,
  onSelect
}: {
  store: Store
  selected: boolean
  onSelect: (storeId: string) => void
}) => {
  // Function to render stars with decimal rating support
  const renderStars = () => {
    const stars = []
    const rating = store.rating || 4.0
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5

    // Render full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          size={18}
          color='#FFD700'
          fill='#FFD700'
          strokeWidth={0}
        />
      )
    }

    // Render half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          size={18}
          color='#FFD700'
          fill='#FFD700'
          key={'half'}
          strokeWidth={0}
        />
      )
    }

    return stars
  }

  const storeAddress = store.storeAddresses?.[0]
  const displayAddress = storeAddress
    ? `${storeAddress.house_no}, ${storeAddress.city}, ${storeAddress.state} ${storeAddress.zipcode}`
    : 'Address not available'

  const operatingHours = store.store_hours?.Monday
    ? `${store.store_hours.Monday.open} - ${store.store_hours.Monday.close}`
    : '9 AM - 6 PM'

  return (
    <TouchableOpacity
      style={[styles.storeCard, selected && styles.storeCardSelected]}
      onPress={() => onSelect(store.id.toString())}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              store.uploadDoc?.[0]?.fileUrl ||
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
          }}
          style={styles.storeImage}
          resizeMode='cover'
        />

        {/* New Badge */}
        {store.preferred && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>Preferred</Text>
          </View>
        )}

        {/* Heart Icon using Lucide */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={e => {
            e.stopPropagation()
            // Handle favorite logic
          }}
        >
          <Heart size={16} color='#FF5722' fill='#FF5722' />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.storeName} numberOfLines={1}>
          {store.storeName}
        </Text>

        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            Est. ${store.estimatedPrice || 25}
          </Text>
        </View>

        {/* Rating with Lucide Stars */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsRow}>{renderStars()}</View>
        </View>

        <View style={styles.hoursContainer}>
          <Text style={styles.hours}>{operatingHours}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {displayAddress}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default function StoreSelectionForm ({
  onNext,
  onPrev
}: StoreSelectionFormProps) {
  const dispatch = useDispatch()
  const { orderData, serviceType } = useSelector(
    (state: RootState) => state.order
  )
  const { userData } = useSelector((state: any) => state.user)

  const [stores, setStores] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // FIXED Helper function to format date to yyyy-MM-dd
  const formatDateToISO = (dateStr: string): string => {
    if (!dateStr) {
      // Return tomorrow's date if no date provided
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const year = tomorrow.getFullYear()
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
      const day = String(tomorrow.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    console.log('🔍 Original date string:', dateStr)

    // If date is already in YYYY-MM-DD format, return as-is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log('✅ Already in ISO format:', dateStr)
      return dateStr
    }

    let date: Date

    // Handle MM/DD/YYYY format (most common from date pickers)
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const [month, day, year] = parts
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else {
        throw new Error(`Invalid date format: ${dateStr}`)
      }
    }
    // Handle DD-MM-YYYY format
    else if (dateStr.includes('-')) {
      const parts = dateStr.split('-')
      if (parts.length === 3 && parts[2].length === 4) {
        const [day, month, year] = parts
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else {
        throw new Error(`Invalid date format: ${dateStr}`)
      }
    }
    // Handle other formats
    else {
      date = new Date(dateStr)
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      console.error('❌ Invalid date created from:', dateStr)
      // Return a valid fallback date
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const year = tomorrow.getFullYear()
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
      const day = String(tomorrow.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    console.log('✅ Formatted date:', formattedDate)
    return formattedDate
  }

  // Build API payload in exact format
  const buildEstimatePayload = () => {
    const pickupDetails = orderData.pickupDetails
    const selectedClothes = orderData.selectedClothes

    console.log('🔍 Debug - pickupDetails:', pickupDetails)
    console.log('🔍 Debug - selectedClothes:', selectedClothes)

    if (!pickupDetails || !selectedClothes) {
      throw new Error('Missing required order data')
    }

    // Find user's selected address
    const selectedAddress = userData?.addresses?.find(
      (addr: any) =>
        pickupDetails.location?.includes(addr.house_no) ||
        pickupDetails.location?.includes(addr.address_type)
    )

    // Build items array with exact format
    const items: any[] = []

    // Handle selectedClothes with proper typing
    if (selectedClothes.items && Array.isArray(selectedClothes.items)) {
      // For structured selectedClothes with items array
      selectedClothes.items.forEach((item: any) => {
        if (item.quantity > 0) {
          items.push({
            category: item.item_name || item.category,
            quantity: item.quantity.toString()
          })
        }
      })
    } else {
      // For direct cloth name structure (fallback case)
      // Create a type-safe way to iterate over the object
      const clothesData = selectedClothes as any // Type assertion for this specific case
      Object.keys(clothesData).forEach(clothName => {
        const clothData = clothesData[clothName]
        if (typeof clothData === 'number' && clothData > 0) {
          items.push({
            category: clothName,
            quantity: clothData.toString()
          })
        } else if (clothData && clothData.quantity > 0) {
          items.push({
            category: clothName,
            quantity: clothData.quantity.toString()
          })
        }
      })
    }

    // Ensure we have at least one item
    if (items.length === 0) {
      items.push({
        category: 'Mix Cloth',
        quantity: '1'
      })
    }

    // Build payload with exact structure and formatted dates
    const payload = {
      serviceType: serviceType,
      items: items,
      pickupDate: formatDateToISO(pickupDetails.collectionDate),
      pickupSlot: {
        open: pickupDetails.collectionTime?.split('-')[0]?.trim() || '10:00 AM',
        close:
          pickupDetails.collectionTime?.split('-')[1]?.trim() || '11:00 AM',
        note: ''
      },
      deliveryDate: formatDateToISO(
        pickupDetails.deliveryDate || pickupDetails.collectionDate
      ),
      deliverySlot: {
        open: pickupDetails.deliveryTime?.split('-')[0]?.trim() || '11:00 AM',
        close: pickupDetails.deliveryTime?.split('-')[1]?.trim() || '12:00 PM',
        note: ''
      },
      pickupAddress: {
        id: selectedAddress?.id || 80,
        address_line: selectedAddress?.house_no || '60 Charlesgate\n',
        city: selectedAddress?.city || 'Boston',
        state: selectedAddress?.state || 'MA',
        pincode: selectedAddress?.zipcode || '02215',
        landmark: selectedAddress?.landmark || '',
        latlong: {
          latitude: parseFloat(
            selectedAddress?.latlongs?.[0]?.latitude || '42.3476181'
          ),
          longitude: parseFloat(
            selectedAddress?.latlongs?.[0]?.longitude || '-71.1002881'
          )
        }
      }
    }

    console.log('🚀 Final payload:', JSON.stringify(payload, null, 2))
    return payload
  }

  // Load stores from API
  useEffect(() => {
    const loadStores = async () => {
      setLoading(true)
      setErrors({})

      try {
        const payload = buildEstimatePayload()

        console.log(
          '🔄 Fetching stores with exact payload:',
          JSON.stringify(payload, null, 2)
        )

        const response = await ApiService.post({
          url: '/customer/services-offered/estimate',
          data: payload
        })

        console.log('📊 Stores API response:', response)

        // FIXED: Handle the correct response structure
        let storesRaw = []

        // The response is directly an array of store objects
        if (Array.isArray(response.data)) {
          storesRaw = response.data
        } else if (Array.isArray(response)) {
          storesRaw = response
        } else {
          console.warn('Unexpected response format:', response)
          storesRaw = []
        }

        console.log('🔍 Raw stores data:', storesRaw)

        // Extract store data from the nested structure
        const processedStores = storesRaw.map((item: any, index: number) => {
          // Each item has: averageRating, isFavourite, matchedItems, originalPrice, pickupDistance, store, totalPrice
          const storeData = item.store

          return {
            // Use store data for display
            id: storeData.id,
            storeName: storeData.storeName,
            storeStatus: storeData.storeStatus,
            store_phone: storeData.store_phone,
            licenceNumber: storeData.licenceNumber,
            store_hours: storeData.store_hours,
            is_approved: storeData.is_approved,
            payout_frequency: storeData.payout_frequency,
            payoutFreeze: storeData.payoutFreeze,
            createdAt: storeData.createdAt,
            updatedAt: storeData.updatedAt,
            deleted_at: storeData.deleted_at,
            uploadDoc: storeData.uploadDoc,
            serviceAreas: storeData.serviceAreas,
            backoutDates: storeData.backoutDates,
            preferred: storeData.preferred,
            stripeAccountId: storeData.stripeAccountId,
            storeAddresses: storeData.storeAddresses,

            // Add pricing and rating data from the wrapper object
            estimatedPrice: item.totalPrice || item.originalPrice || 25,
            rating: item.averageRating || 4.0,
            pickupDistance: item.pickupDistance,
            isFavourite: item.isFavourite,
            matchedItems: item.matchedItems,
            pricingTierUsed: item.pricingTierUsed
          }
        })

        console.log('✅ Processed stores:', processedStores)
        setStores(processedStores)
      } catch (error) {
        console.error('❌ Failed to load stores:', error)
        setErrors({ general: 'Failed to load stores. Please try again.' })
        setStores([])
      } finally {
        setLoading(false)
      }
    }

    // Only load if we have required data
    if (orderData.pickupDetails && orderData.selectedClothes) {
      loadStores()
    } else {
      setErrors({ general: 'Please complete previous steps first' })
    }
  }, [orderData, serviceType, userData])

  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId)
    setErrors({})

    // Find selected store and save to Redux
    const selectedStore = stores.find(store => store.id.toString() === storeId)
    if (selectedStore) {
      dispatch(
        updateSelectedStore({
          store_id: selectedStore.id,
          store_name: selectedStore.storeName,
          store_address: selectedStore.storeAddresses?.[0]?.house_no || ''
        })
      )

      // Auto-advance after selection
      setTimeout(() => {
        onNext()
      }, 600)
    }
  }

  const handleNext = () => {
    if (selectedStoreId) {
      onNext()
    } else {
      setErrors({ store: 'Please select a store' })
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading available stores...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formCard}>
        <Text style={styles.title}>
          Select <Text style={styles.titleAccent}>Store</Text>
        </Text>
        <View style={styles.divider} />

        <View style={styles.inputContainer}>
          {errors.general ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : stores.length === 0 ? (
            <View style={styles.noStoresContainer}>
              <Text style={styles.noStoresText}>
                No stores available for your selection
              </Text>
            </View>
          ) : (
            <View style={styles.storeGrid}>
              {stores.map(store => (
                <StoreCard
                  key={store.id}
                  store={store}
                  selected={selectedStoreId === store.id.toString()}
                  onSelect={handleStoreSelect}
                />
              ))}
            </View>
          )}

          {errors.store && <Text style={styles.errorText}>{errors.store}</Text>}
        </View>

        <OrderNavigationButtons
          onPrevious={onPrev}
          onNext={handleNext}
          previousLabel='Previous'
          nextLabel='Next'
        />
      </View>
    </ScrollView>
  )
}

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
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
    fontSize: 20,
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
    paddingHorizontal: 5
  },
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 20
  },
  storeCard: {
    width: '48%',
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
    marginBottom: 16
  },
  storeCardSelected: {
    borderColor: '#4FC3F7',
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  imageWrapper: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5'
  },
  storeImage: {
    width: '100%',
    height: '100%'
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  newBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600'
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardContent: {
    paddingVertical: 10,
    alignItems: 'center'
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#063853',
    textAlign: 'center',
    marginBottom: 8
  },
  priceBadge: {
    backgroundColor: '#02537F',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8
  },
  priceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 8
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  hoursContainer: {
    width: '80%',
    paddingVertical: 5,
    backgroundColor: '#EBF9FF',
    borderRadius: 5,
    marginBottom: 6
  },
  hours: {
    fontSize: 16,
    color: '#767777',
    textAlign: 'center'
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginTop: 5
  },
  noStoresContainer: {
    padding: 20,
    alignItems: 'center'
  },
  noStoresText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  }
})
