// components/StoreCard.tsx
import { startOrderFromStore } from '@/Redux/slices/orderSlice'
import { ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  Star,
  StarHalf,
  X
} from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'
import ScrollingTags from './ScrollingText'

interface StoreCardProps {
  item: any
  cardWidth: number
  onPress?: (item: any) => void
  onFavoritePress?: (item: any) => void
}

// Service Card Component for Modal
const ServiceCard = ({
  item,
  onPress,
  disabled = false,
  colors
}: {
  item: any
  onPress: (service: any) => void
  disabled?: boolean
  colors: any
}) => {
  const styles = createServiceCardStyles(colors)

  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.disabledCard]}
      onPress={() => onPress(item)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: item.color || colors.light }
        ]}
      >
        <Image
          source={item.image}
          style={styles.serviceImage}
          resizeMode='contain'
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.serviceTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.serviceDescription, { color: colors.textSecondary }]}
        >
          {item.serviceType}
        </Text>
      </View>

      <View style={styles.arrowContainer}>
        <ArrowRight size={16} color={colors.primary} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  )
}

// Service Selection Modal Component
const ServiceSelectionModal = ({
  visible,
  services,
  storeName,
  onServiceSelect,
  onCancel,
  colors
}: {
  visible: boolean
  services: any[]
  storeName: string
  onServiceSelect: (service: any) => void
  onCancel: () => void
  colors: any
}) => {
  const styles = createModalStyles(colors)

  const renderServiceItem = ({ item }: { item: any }) => (
    <ServiceCard item={item} onPress={onServiceSelect} colors={colors} />
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Service
            </Text>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Store Name */}
          <Text style={[styles.storeNameText, { color: colors.textSecondary }]}>
            Services available at{' '}
            <Text style={[styles.storeName, { color: colors.primary }]}>
              {storeName}
            </Text>
          </Text>

          {/* Services List */}
          {services.length === 0 ? (
            <View style={styles.noServicesContainer}>
              <Text
                style={[styles.noServicesText, { color: colors.textSecondary }]}
              >
                No services available at this store
              </Text>
            </View>
          ) : (
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={item => item.id}
              style={styles.servicesList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.servicesContainer}
            />
          )}

          {/* Cancel Button */}
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={onCancel}
          >
            <Text
              style={[styles.cancelButtonText, { color: colors.textSecondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default function StoreCard ({
  item,
  cardWidth,
  onPress,
  onFavoritePress
}: StoreCardProps) {
  const colors = useThemeColors()
  const dispatch = useDispatch()
  const navigation = useNavigation()

  // Service selection modal state
  const [showServiceModal, setShowServiceModal] = useState(false)

  const styles = useMemo(
    () => createStyles(colors, cardWidth),
    [colors, cardWidth]
  )

  // All possible services (master list)
  const allServices = [
    {
      id: ServiceTypeEnum.WASH_N_FOLD,
      title: 'Wash & Fold',
      serviceType: 'Professional washing and folding service',
      image: require('../../assets/images/wash.png'),
      color: colors.light
    },
    {
      id: ServiceTypeEnum.DRYCLEANING,
      title: 'Dry Clean',
      serviceType: 'Premium dry cleaning service',
      image: require('../../assets/images/dryclean.png'),
      color: colors.light
    },
    {
      id: ServiceTypeEnum.TAILORING,
      title: 'Tailoring',
      serviceType: 'Expert tailoring and alterations',
      image: require('../../assets/images/tailor.png'),
      color: colors.light
    }
  ]

  // Extract services from item.services, filter out deleted ones
  const offeredServices = item.services
    ? item.services
        .filter((service: any) => service.deleted_at === null)
        .map((service: any) => service.serviceType)
    : []

  // Filter services to only show what this store offers
  const availableServices = allServices.filter(service =>
    offeredServices.includes(service.id)
  )

  console.log('🏪 Store Services:', {
    storeName: item.title,
    rawServices: item.services,
    offeredServices,
    availableServicesCount: availableServices.length
  })

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          <Star size={14} color='#FFD700' fill='#FFD700' />
        </Text>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Text key='half' style={styles.star}>
          <StarHalf size={14} color='#FFD700' fill='#FFD700' />
        </Text>
      )
    }

    return stars
  }

  // Handle order press to show service selection modal
  const handleOrderPress = () => {
    console.log('🛒 Opening service selection for store:', item.title)

    if (availableServices.length === 0) {
      alert('No services available at this store')
      return
    }

    if (availableServices.length === 1) {
      handleServiceSelect(availableServices[0])
      return
    }

    setShowServiceModal(true)
    onPress?.(item)
  }

  // Handle service selection
  const handleServiceSelect = (service: any) => {
    console.log('🔧 Service selected:', service.title, 'for store:', item)

    setShowServiceModal(false)

    const constructStoreAddress = (storeData: any) => {
      const storeAddress = storeData.storeAddresses?.[0]
      console.log(storeData)

      if (!storeAddress) {
        return {
          address_line: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          lat: '0.0',
          long: '0.0'
        }
      }

      return {
        address_line: `${storeAddress.house_no || ''}${
          storeAddress.street_address ? ', ' + storeAddress.street_address : ''
        }`,
        city: storeAddress.city || '',
        state: storeAddress.state || '',
        pincode: storeAddress.zipcode || '',
        landmark: storeAddress.landmark || '',
        lat: storeAddress.latlongs?.[0]?.latitude,
        long: storeAddress.latlongs?.[0]?.longitude
      }
    }

    dispatch(
      startOrderFromStore({
        serviceType: service.id,
        store: {
          store_id: Number(item.id),
          store_name: item.storeName || item.title,
          store_address: constructStoreAddress(item)
        }
      })
    )

    router.push('./order')
  }

  const handleModalCancel = () => {
    setShowServiceModal(false)
  }

  const handleFavoritePress = () => {
    onFavoritePress?.(item)
  }

  return (
    <>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.cardImage} />

          {/* Badges and Icons */}
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Heart
              size={14}
              color={item.isFavorite ? colors.notification : colors.background}
              fill={item.isFavorite ? colors.notification : 'transparent'}
            />
          </TouchableOpacity>

          {item.preferred && (
            <View style={styles.verifiedBadge}>
              <BadgeCheck
                fill={colors.primary}
                stroke={colors.background}
                size={15}
              />
              <Text style={styles.verifiedText}>TYDII</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>

          <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>

          <ScrollingTags tags={item.tags} colors={colors} />

          {/* Order Button */}
          <TouchableOpacity
            style={[
              styles.orderButton,
              availableServices.length === 0 && styles.orderButtonDisabled
            ]}
            onPress={handleOrderPress}
            disabled={availableServices.length === 0}
          >
            <Text style={styles.orderButtonText}>
              {availableServices.length === 0 ? 'No Services' : 'Order Now'}
            </Text>
            <ArrowRight
              size={16}
              color={
                availableServices.length === 0
                  ? colors.textSecondary
                  : colors.primary
              }
              strokeWidth={3}
              style={[styles.arrowIcon, { backgroundColor: 'white' }]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        visible={showServiceModal}
        services={availableServices}
        storeName={item.title || item.storeName || 'Store'}
        onServiceSelect={handleServiceSelect}
        onCancel={handleModalCancel}
        colors={colors}
      />
    </>
  )
}

// Main StoreCard Styles
const createStyles = (colors: any, cardWidth: number) =>
  StyleSheet.create({
    card: {
      width: cardWidth,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 8,
      shadowColor: colors.text,
      shadowOffset: {
        width: 4,
        height: 4
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden',
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    imageContainer: {
      position: 'relative',
      height: 140
    },
    cardImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
      borderRadius: 10
    },
    newBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: '#28a745',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6
    },
    newBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600'
    },
    favoriteButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 25,
      height: 25,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: colors.background,
      opacity: 0.9,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3
    },
    verifiedText: {
      color: colors.text,
      fontSize: 8,
      letterSpacing: 1,
      fontWeight: '600'
    },
    cardContent: {
      paddingTop: 4
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      color: colors.primary,
      marginVertical: 6
    },
    ratingContainer: {
      marginHorizontal: 'auto',
      flexDirection: 'row',
      marginBottom: 10
    },
    star: {
      fontSize: 14
    },
    orderButton: {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 16
    },
    orderButtonDisabled: {
      backgroundColor: colors.border
    },
    orderButtonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '600',
      marginRight: 6
    },
    arrowIcon: {
      padding: 10,
      borderRadius: 50
    }
  })

// Service Card Styles
const createServiceCardStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 4,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    disabledCard: {
      opacity: 0.6
    },
    imageContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16
    },
    serviceImage: {
      width: 40,
      height: 40
    },
    cardContent: {
      flex: 1
    },
    serviceTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4
    },
    serviceDescription: {
      fontSize: 14
    },
    arrowContainer: {
      padding: 8
    }
  })

// Modal Styles
const createModalStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end'
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      paddingTop: 20
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600'
    },
    closeButton: {
      padding: 8,
      borderRadius: 20
    },
    storeNameText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
      paddingHorizontal: 20
    },
    storeName: {
      fontWeight: '600'
    },
    servicesList: {
      paddingHorizontal: 16
    },
    servicesContainer: {
      paddingBottom: 20
    },
    noServicesContainer: {
      padding: 40,
      alignItems: 'center'
    },
    noServicesText: {
      fontSize: 16,
      textAlign: 'center'
    },
    cancelButton: {
      margin: 20,
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center'
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600'
    }
  })
