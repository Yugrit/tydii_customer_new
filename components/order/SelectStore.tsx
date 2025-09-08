// Updated Store Card Component with Lucide Icons
import { Heart, Star, StarHalf } from 'lucide-react-native'
import React, { useState } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'
import OrderNavigationButtons from './OrderNavigationButtons'

interface Store {
  id: string
  name: string
  address: string
  distance: string
  rating: number // Can be decimal like 4.5
  estimatedPrice: number
  image: string
  operatingHours: string
  description: string
  isNew: boolean
  services: string[]
}

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
    const fullStars = Math.floor(store.rating)
    const hasHalfStar = store.rating - fullStars >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

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

  return (
    <TouchableOpacity
      style={[styles.storeCard, selected && styles.storeCardSelected]}
      onPress={() => onSelect(store.id)}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: store.image }}
          style={styles.storeImage}
          resizeMode='cover'
        />

        {/* New Badge */}
        {store.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
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
          {store.name}
        </Text>

        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>Est. ${store.estimatedPrice}</Text>
        </View>

        {/* Rating with Lucide Stars */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsRow}>{renderStars()}</View>
          {/* <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text> */}
        </View>

        <View
          style={{
            width: '80%',
            paddingVertical: 5,
            backgroundColor: '#EBF9FF',
            borderRadius: 5,
            marginBottom: 6
          }}
        >
          <Text style={styles.hours}>{store.operatingHours}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {store.description}
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

  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Updated mock data with decimal ratings
  const stores: Store[] = [
    {
      id: '1',
      name: 'Laundry Basket',
      address: '123 Main Street, Downtown',
      distance: '0.5 miles',
      rating: 4.5, // Decimal rating
      estimatedPrice: 10,
      operatingHours: '10 AM - 6 PM',
      description: 'Washed with quality detergents',
      isNew: true,
      services: ['Wash & Fold', 'Dry Cleaning'],
      image:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      name: 'Express Clean',
      address: '456 Oak Avenue, Midtown',
      distance: '1.2 miles',
      rating: 4.2, // Decimal rating
      estimatedPrice: 12,
      operatingHours: '8 AM - 8 PM',
      description: 'Fast and reliable service',
      isNew: true,
      services: ['Express Service', 'Stain Removal'],
      image:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
    },
    {
      id: '3',
      name: 'Premium Care',
      address: '789 Pine Road, Uptown',
      distance: '2.1 miles',
      rating: 4.8, // Decimal rating
      estimatedPrice: 15,
      operatingHours: '9 AM - 7 PM',
      description: 'Luxury cleaning services',
      isNew: false,
      services: ['Luxury Cleaning', 'Tailoring'],
      image:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
    },
    {
      id: '4',
      name: 'Quick Wash',
      address: '321 Elm Street, Eastside',
      distance: '1.8 miles',
      rating: 3.7, // Decimal rating
      estimatedPrice: 8,
      operatingHours: '7 AM - 9 PM',
      description: 'Budget-friendly options',
      isNew: false,
      services: ['Wash & Fold', 'Same Day'],
      image:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
    }
  ]

  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId)
    setErrors({})

    setTimeout(() => {
      console.log('Selected store:', storeId)
      onNext()
    }, 600)
  }

  const handleNext = () => {
    if (selectedStoreId) {
      onNext()
    } else {
      setErrors({ store: 'Please select a store' })
    }
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
          <View style={styles.storeGrid}>
            {stores.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                selected={selectedStoreId === store.id}
                onSelect={handleStoreSelect}
              />
            ))}
          </View>

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

  // Store Card Styles
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
    elevation: 4,
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },

  // Image Section
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

  // New Badge
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

  // Heart Button
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

  // Content Section
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

  // Price Badge
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

  // Rating with Lucide Stars
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 8
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },

  // Half Star Implementation
  halfStarContainer: {
    position: 'relative',
    width: 14,
    height: 14
  },
  starBackground: {
    position: 'absolute'
  },
  halfStarOverlay: {
    width: 7,
    height: 14,
    overflow: 'hidden'
  },

  // Hours and Description
  hours: {
    fontSize: 18,
    color: '#767777',
    textAlign: 'center'
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20
  },

  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    textAlign: 'center'
  }
})
