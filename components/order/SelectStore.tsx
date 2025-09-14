// components/order/forms/StoreSelectionForm.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { useToast } from '@/hooks/useToast'
import {
  updateItemPrices,
  updatePaymentBreakdown,
  updateSelectedStore
} from '@/Redux/slices/orderSlice'
import { RootState } from '@/Redux/Store'
import ApiService from '@/services/ApiService'
import { formatDateToISO } from '@/services/DateService'
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
  onSelect,
  colors
}: {
  store: Store
  selected: boolean
  onSelect: (storeId: string) => void
  colors: any
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

  const cardStyles = createStoreCardStyles(colors, selected)

  return (
    <TouchableOpacity
      style={cardStyles.storeCard}
      onPress={() => onSelect(store.id.toString())}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View style={cardStyles.imageWrapper}>
        <Image
          source={{
            uri:
              store.uploadDoc?.[0]?.fileUrl ||
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
          }}
          style={cardStyles.storeImage}
          resizeMode='cover'
        />

        {/* Preferred Badge */}
        {store.preferred && (
          <View style={cardStyles.newBadge}>
            <Text style={cardStyles.newBadgeText}>Preferred</Text>
          </View>
        )}

        {/* Heart Icon */}
        <TouchableOpacity
          style={cardStyles.heartButton}
          onPress={e => {
            e.stopPropagation()
            // Handle favorite logic
          }}
        >
          <Heart
            size={16}
            color={colors.notification}
            fill={colors.notification}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={cardStyles.cardContent}>
        <Text style={cardStyles.storeName} numberOfLines={1}>
          {store.storeName}
        </Text>

        <View style={cardStyles.priceBadge}>
          <Text style={cardStyles.priceText}>
            Est. ${store.estimatedPrice || 25}
          </Text>
        </View>

        {/* Rating with Stars */}
        <View style={cardStyles.ratingContainer}>
          <View style={cardStyles.starsRow}>{renderStars()}</View>
        </View>

        <View style={cardStyles.hoursContainer}>
          <Text style={cardStyles.hours}>{operatingHours}</Text>
        </View>

        <Text style={cardStyles.description} numberOfLines={2}>
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
  const colors = useThemeColors()
  const { orderData, serviceType } = useSelector(
    (state: RootState) => state.order
  )
  const { userData } = useSelector((state: any) => state.user)

  const [stores, setStores] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Build API payload using pickup address from orderData
  const buildEstimatePayload = () => {
    console.log('Order Data Till Now ::: ', orderData)
    const pickupDetails = orderData.pickupDetails
    const selectedClothes = orderData.selectedClothes

    console.log('🔍 Debug - pickupDetails:', pickupDetails)
    console.log('🔍 Debug - selectedClothes:', selectedClothes)
    console.log('🔍 Debug - serviceType:', serviceType)

    if (!pickupDetails || !selectedClothes) {
      throw new Error('Missing required order data')
    }

    // Get pickup address directly from orderData
    const pickupAddress = pickupDetails.pickupAddress
    console.log(pickupAddress)

    if (!pickupAddress) {
      throw new Error('Pickup address is required')
    }

    console.log('📍 Using pickup address from orderData:', pickupAddress)

    // Build structured items based on service type
    const buildStructuredItems = () => {
      const items: any[] = []

      if (serviceType === 'TAILORING') {
        // TAILORING format: { category, cloth_name, quantity, tailoringTypes }
        if (selectedClothes.items && Array.isArray(selectedClothes.items)) {
          selectedClothes.items.forEach((item: any) => {
            if (item.quantity > 0) {
              items.push({
                category: item.category || 'Mens',
                cloth_name: item.item_name || '',
                quantity: item.quantity,
                tailoringTypes: item.tailoring_types
                  ? item.tailoring_types.map((tt: any) => ({ name: tt.name }))
                  : []
              })
            }
          })
        }
      } else if (serviceType === 'WASH_N_FOLD') {
        // WASH_N_FOLD format: { category, quantity }
        if (selectedClothes.items && Array.isArray(selectedClothes.items)) {
          selectedClothes.items.forEach((item: any) => {
            if (item.quantity > 0) {
              items.push({
                category: item.item_name || '',
                quantity: item.quantity
              })
            }
          })
        }
      } else if (serviceType === 'DRYCLEANING') {
        // DRYCLEANING format: { category, cloth_name, quantity }
        if (selectedClothes.items && Array.isArray(selectedClothes.items)) {
          selectedClothes.items.forEach((item: any) => {
            if (item.quantity > 0) {
              items.push({
                category: item.category || 'Mens',
                cloth_name: item.item_name || '',
                quantity: item.quantity
              })
            }
          })
        }
      }

      return items
    }

    const items = buildStructuredItems()
    console.log('🔧 Built structured items for', serviceType, ':', items)

    // Build payload using pickup address object
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
      // Use pickup address object directly from orderData
      pickupAddress: {
        id: 80,
        address_line: pickupAddress.address_line,
        city: pickupAddress.city,
        state: pickupAddress.state,
        pincode: pickupAddress.pincode,
        landmark: pickupAddress.landmark,
        latlong: {
          latitude: parseFloat(pickupAddress.lat),
          longitude: parseFloat(pickupAddress.long)
        }
      }
    }

    console.log('🚀 Final payload:', JSON.stringify(payload, null, 2))
    return payload
  }

  const toast = useToast()

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

        // Handle the correct response structure
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
        const processedStores = storesRaw.map((item: any) => {
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
            pricingTierUsed: item.pricingTierUsed,
            // Store the full item for price updates
            totalPrice: item.totalPrice,
            originalPrice: item.originalPrice
          }
        })

        console.log('✅ Processed stores:', processedStores)
        setStores(processedStores)
      } catch (error) {
        console.error('❌ Failed to load stores:', error)
        setErrors({ general: 'Failed to load stores. Please try again.' })
        setStores([])
        toast.error('Failed to fetch Stores')
      } finally {
        setLoading(false)
      }
    }

    // Only load if we have required data including pickup address
    if (orderData.pickupDetails?.pickupAddress && orderData.selectedClothes) {
      loadStores()
    } else {
      setErrors({
        general:
          'Please complete previous steps and select pickup address first'
      })
    }
  }, [orderData, serviceType, userData])

  // Function to update prices from matchedItems
  const updatePricesFromMatchedItems = (selectedStore: any) => {
    console.log('🔄 Updating prices from store matchedItems...')

    const matchedItems = selectedStore.matchedItems || []
    const selectedClothes = orderData.selectedClothes?.items || []

    if (matchedItems.length === 0 || selectedClothes.length === 0) {
      console.log('⚠️ No matched items or selected clothes to update prices')
      return
    }

    console.log('📊 MatchedItems from store:', matchedItems)
    console.log('📊 SelectedClothes from Redux:', selectedClothes)

    // Create price mapping based on service type
    const itemPrices: Array<{
      item_name: string
      price: number
      tailoring_type?: string
      tailoring_price?: number
    }> = []

    selectedClothes.forEach((selectedItem: any) => {
      // Find matching price from store's matchedItems
      const matchedItem = matchedItems.find((matched: any) => {
        const match = matched.matches || matched.match
        console.log('MATCH ::: ', match)

        if (serviceType === 'TAILORING') {
          // Match by cloth_name, category, and tailoringType
          return (
            match.cloth_name === selectedItem.item_name &&
            match.category === selectedItem.category &&
            selectedItem.tailoring_types &&
            selectedItem.tailoring_types.some(
              (tt: any) => match.tailoringType === tt.name
            )
          )
        } else if (serviceType === 'DRYCLEANING') {
          // Match by cloth_name and category
          return (
            match.cloth_name === selectedItem.item_name &&
            match.category === selectedItem.category
          )
        } else if (serviceType === 'WASH_N_FOLD') {
          // Match by cloth_name (category field contains the cloth name for wash & fold)
          return match.category === selectedItem.item_name
        }

        return false
      })

      if (matchedItem) {
        const match = matchedItem.match

        if (serviceType === 'TAILORING') {
          // For tailoring, store both item price and tailoring service price
          itemPrices.push({
            item_name: selectedItem.item_name,
            price: match.price * selectedItem.quantity,
            tailoring_type: match.tailoringType,
            tailoring_price: match.price
          })
        } else {
          // For other services, just store item price
          itemPrices.push({
            item_name: selectedItem.item_name,
            price: match.price * selectedItem.quantity
          })
        }

        console.log(`✅ Matched price for ${selectedItem.item_name}:`, {
          unitPrice: match.price,
          quantity: selectedItem.quantity,
          totalPrice: match.price * selectedItem.quantity,
          category: match.category,
          tailoringType:
            serviceType === 'TAILORING' ? match.tailoringType : null
        })
      } else {
        console.log(`❌ No price match found for ${selectedItem.item_name}`)

        // Set fallback price if no match found
        const fallbackPrice = serviceType === 'WASH_N_FOLD' ? 10 : 15
        itemPrices.push({
          item_name: selectedItem.item_name,
          price: fallbackPrice * selectedItem.quantity
        })
      }
    })

    console.log('🔧 Built itemPrices array:', itemPrices)

    // Dispatch price updates to Redux
    if (itemPrices.length > 0) {
      dispatch(updateItemPrices({ itemPrices }))
      console.log('✅ Dispatched price updates to Redux')
    }
  }

  // Handle store selection with price and total updates
  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId)
    setErrors({})

    // Find selected store and save to Redux
    const selectedStore = stores.find(store => store.id.toString() === storeId)
    if (selectedStore) {
      console.log('🏪 Selected store:', selectedStore.storeName)
      console.log('💰 Store total price:', selectedStore.totalPrice)

      // Convert store address to Address object format
      const storeAddress = selectedStore.storeAddresses?.[0]
      const storeAddressObject = storeAddress
        ? {
            address_line: storeAddress.house_no || '',
            city: storeAddress.city || '',
            state: storeAddress.state || '',
            pincode: storeAddress.zipcode || '',
            landmark: storeAddress.landmark || '',
            lat: storeAddress.latlongs?.[0]?.latitude?.toString(),
            long: storeAddress.latlongs?.[0]?.longitude?.toString()
          }
        : {
            address_line: '',
            city: '',
            state: '',
            pincode: '',
            landmark: '',
            lat: '0.0',
            long: '0.0'
          }

      // Save store to Redux with Address object
      dispatch(
        updateSelectedStore({
          store_id: selectedStore.id,
          store_name: selectedStore.storeName,
          store_address: storeAddressObject
        })
      )

      // Update individual item prices from matchedItems
      updatePricesFromMatchedItems(selectedStore)

      // Update payment breakdown with API total amount
      dispatch(
        updatePaymentBreakdown({
          orderAmount:
            selectedStore.totalPrice || selectedStore.estimatedPrice || 0,
          // Set other fees to 0 since they're included in totalPrice from API
          tax: 0,
          platformFee: 0,
          deliveryCharge: 0,
          discount: 0
        })
      )

      console.log(
        '💵 Updated payment breakdown with API total:',
        selectedStore.totalPrice
      )

      // Auto-advance after selection
      setTimeout(() => {
        onNext()
      }, 800)
    }
  }

  const handleNext = () => {
    if (selectedStoreId) {
      onNext()
    } else {
      setErrors({ store: 'Please select a store' })
    }
  }

  const styles = createMainStyles(colors)

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
                  colors={colors}
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

// Main component styles
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
      marginHorizontal: 5,
      paddingBottom: 20
    },
    formCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 20,
      elevation: 1,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      marginHorizontal: 20,
      color: colors.text,
      marginBottom: 10
    },
    titleAccent: {
      color: colors.primary
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
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
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    errorContainer: {
      padding: 16,
      backgroundColor: colors.notification + '20',
      borderRadius: 8,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.notification + '50'
    },
    errorText: {
      fontSize: 14,
      color: colors.notification,
      textAlign: 'center',
      marginTop: 5
    },
    noStoresContainer: {
      padding: 20,
      alignItems: 'center'
    },
    noStoresText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    }
  })

// Store card styles
const createStoreCardStyles = (colors: any, selected: boolean) =>
  StyleSheet.create({
    storeCard: {
      width: '48%',
      padding: 5,
      backgroundColor: colors.background,
      borderRadius: 16,
      elevation: 1,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      overflow: 'hidden',
      marginBottom: 16,
      borderColor: selected ? colors.primary : colors.border,
      borderWidth: selected ? 2 : 1
    },
    imageWrapper: {
      height: 120,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: colors.surface
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
      backgroundColor: colors.background + 'E6',
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
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 8
    },
    priceBadge: {
      backgroundColor: colors.primary,
      borderRadius: 5,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginBottom: 8
    },
    priceText: {
      color: colors.background,
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
      backgroundColor: colors.light,
      borderRadius: 5,
      marginBottom: 6
    },
    hours: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20
    }
  })
