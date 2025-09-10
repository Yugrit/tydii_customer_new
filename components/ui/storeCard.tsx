// components/StoreCard.tsx
import { startOrderFromStore } from '@/Redux/slices/orderSlice'
import { ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { ArrowRight, BadgeCheck, Heart } from 'lucide-react-native'
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
  disabled = false
}: {
  item: any
  onPress: (service: any) => void
  disabled?: boolean
}) => {
  const colors = useThemeColors()

  return (
    <TouchableOpacity
      style={[
        serviceCardStyles.card,
        disabled && serviceCardStyles.disabledCard
      ]}
      onPress={() => onPress(item)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          serviceCardStyles.imageContainer,
          { backgroundColor: item.color || '#C5ECFC' }
        ]}
      >
        <Image
          source={item.image}
          style={serviceCardStyles.serviceImage}
          resizeMode='contain'
        />
      </View>

      <View style={serviceCardStyles.cardContent}>
        <Text
          style={[serviceCardStyles.serviceTitle, { color: colors.primary }]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            serviceCardStyles.serviceDescription,
            { color: colors.textSecondary }
          ]}
        >
          {item.serviceType}
        </Text>
      </View>

      <View style={serviceCardStyles.arrowContainer}>
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
  onCancel
}: {
  visible: boolean
  services: any[]
  storeName: string
  onServiceSelect: (service: any) => void
  onCancel: () => void
}) => {
  const renderServiceItem = ({ item }: { item: any }) => (
    <ServiceCard item={item} onPress={onServiceSelect} />
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onCancel}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          {/* Header */}
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Select Service</Text>
            <TouchableOpacity
              onPress={onCancel}
              style={modalStyles.closeButton}
            >
              <Text style={modalStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Store Name */}
          <Text style={modalStyles.storeNameText}>
            Services available at{' '}
            <Text style={modalStyles.storeName}>{storeName}</Text>
          </Text>

          {/* Services List */}
          {services.length === 0 ? (
            <View style={modalStyles.noServicesContainer}>
              <Text style={modalStyles.noServicesText}>
                No services available at this store
              </Text>
            </View>
          ) : (
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={item => item.id}
              style={modalStyles.servicesList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={modalStyles.servicesContainer}
            />
          )}

          {/* Cancel Button */}
          <TouchableOpacity style={modalStyles.cancelButton} onPress={onCancel}>
            <Text style={modalStyles.cancelButtonText}>Cancel</Text>
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
      color: '#E3F2FD'
    },
    {
      id: ServiceTypeEnum.DRYCLEANING,
      title: 'Dry Clean',
      serviceType: 'Premium dry cleaning service',
      image: require('../../assets/images/dryclean.png'),
      color: '#F3E5F5'
    },
    {
      id: ServiceTypeEnum.TAILORING,
      title: 'Tailoring',
      serviceType: 'Expert tailoring and alterations',
      image: require('../../assets/images/tailor.png'),
      color: '#E8F5E8'
    }
  ]

  // NEW: Extract services from item.services, filter out deleted ones
  const offeredServices = item.services
    ? item.services
        .filter((service: any) => service.deleted_at === null) // Exclude deleted services
        .map((service: any) => service.serviceType) // Extract serviceType strings
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
          ⭐
        </Text>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Text key='half' style={styles.star}>
          ⭐
        </Text>
      )
    }

    return stars
  }

  // Handle order press to show service selection modal
  const handleOrderPress = () => {
    console.log('🛒 Opening service selection for store:', item.title)

    // If store offers no services, show alert and return
    if (availableServices.length === 0) {
      alert('No services available at this store')
      return
    }

    // If store offers only one service, directly start order
    if (availableServices.length === 1) {
      handleServiceSelect(availableServices[0])
      return
    }

    // Show modal for multiple services
    setShowServiceModal(true)

    // Call original onPress if provided
    onPress?.(item)
  }

  // Handle service selection
  const handleServiceSelect = (service: any) => {
    console.log('🔧 Service selected:', service.title, 'for store:', item.title)

    // Close modal
    setShowServiceModal(false)

    // Dispatch startOrderFromStore action with selected service
    dispatch(
      startOrderFromStore({
        serviceType: service.id,
        store: {
          store_id: item.id || item.storeId,
          store_name: item.title || item.storeName,
          store_address: item.address || item.storeAddress || ''
        }
      })
    )

    // Navigate to order flow
    router.push('./order')
  }

  // Handle modal cancel
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
              color={item.isFavorite ? '#FF4757' : 'white'}
              fill={item.isFavorite ? '#FF4757' : 'transparent'}
            />
          </TouchableOpacity>

          {item.preferred && (
            <View style={styles.verifiedBadge}>
              <BadgeCheck fill={'#1876A9'} stroke={'white'} size={15} />
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
              color={availableServices.length === 0 ? '#ccc' : colors.primary}
              strokeWidth={3}
              style={{
                backgroundColor: 'white',
                padding: 10,
                borderRadius: 50
              }}
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
      />
    </>
  )
}

// Main StoreCard Styles
const createStyles = (colors: any, cardWidth: number) =>
  StyleSheet.create({
    card: {
      width: cardWidth,
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 4,
        height: 4
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden'
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
      borderColor: colors.light,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center'
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: '#FFFFFF',
      opacity: 0.8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3
    },
    verifiedText: {
      color: 'black',
      fontSize: 8,
      letterSpacing: 1,
      fontWeight: '600'
    },
    servicesBadge: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      backgroundColor: '#008ECC',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6
    },
    servicesBadgeText: {
      color: 'white',
      fontSize: 10,
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
      backgroundColor: '#02537F',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 16
    },
    orderButtonDisabled: {
      backgroundColor: '#cccccc'
    },
    orderButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      marginRight: 6
    }
  })

// Service Card Styles
const serviceCardStyles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center'
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
const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: 'white',
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
    fontWeight: '600',
    color: '#333'
  },
  closeButton: {
    padding: 4
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666'
  },
  storeNameText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20
  },
  storeName: {
    fontWeight: '600',
    color: '#008ECC'
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
    color: '#666',
    textAlign: 'center'
  },
  cancelButton: {
    margin: 20,
    paddingVertical: 14,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  }
})
