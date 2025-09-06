// components/FavouriteLaundry.tsx
import StoreCard from '@/components/ui/storeCard'
import { useThemeColors } from '@/hooks/useThemeColor'
import ApiService from '@/services/ApiService'
import { getData_MMKV } from '@/services/StorageService'
import { jwtDecode } from 'jwt-decode'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 1.5 // Two cards with margins
const CARD_MARGIN = 4

interface OfferedStore {
  id: string
  title: string
  image: any
  rating: number
  time: string
  description: string
  tags: string[]
  isNew: boolean
  isFavorite: boolean
  preferred: boolean
}

interface JWTPayload {
  sub: number
  email: string
  name: string
  phone_number: string
  usertype: string
  roles: any[]
  isApproved: string
  stores: any[]
  deliveryPersonId: null
  iat: number
  exp: number
}

export default function OfferedLaundry () {
  const colors = useThemeColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const scrollX = useRef(new Animated.Value(0)).current
  const flatListRef = useRef<FlatList>(null)

  // State management
  const [OfferedStores, setOfferedStores] = useState<OfferedStore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  // Get user ID from token on mount
  useEffect(() => {
    getUserIdFromToken()
  }, [])

  // Fetch data when userId is available
  useEffect(() => {
    if (userId) {
      fetchFavouriteStores()
    }
  }, [userId])

  const getUserIdFromToken = () => {
    try {
      const token = getData_MMKV('user-token')
      if (token) {
        const decodedToken = jwtDecode<JWTPayload>(token)
        setUserId(decodedToken.sub)
      } else {
        setError('No authentication token found')
        setLoading(false)
      }
    } catch (err) {
      console.error('Error decoding token:', err)
      setError('Invalid authentication token')
      setLoading(false)
    }
  }

  const getOperatingHours = (storeHours: any) => {
    if (!storeHours) return 'Hours not available'

    const openDays = Object.entries(storeHours)
      .filter(([day, hours]: [string, any]) => hours?.open && hours?.close)
      .slice(0, 2) // Show only first 2 days to keep it concise

    if (openDays.length === 0) return 'Hours not available'

    return openDays
      .map(
        ([day, hours]: [string, any]) =>
          `${day}: ${hours.open} - ${hours.close}`
      )
      .join(', ')
  }

  const getShopImage = (uploadDoc: any[]) => {
    if (!uploadDoc || uploadDoc.length === 0) {
      return 'https://via.placeholder.com/400x300?text=Laundry+Store'
    }

    const shopImage = uploadDoc.find(doc => doc.name === 'shop_image')
    return (
      shopImage?.fileUrl ||
      uploadDoc[0]?.fileUrl ||
      'https://via.placeholder.com/400x300?text=Laundry+Store'
    )
  }

  const getServiceTags = (services: any[]) => {
    if (!services || services.length === 0) return ['Laundry']

    return services.map(service => {
      switch (service.serviceType) {
        case 'WASH_N_FOLD':
          return 'Wash & Fold'
        case 'TAILORING':
          return 'Tailoring'
        case 'DRYCLEANING':
          return 'Dry Cleaning'
        default:
          return service.serviceType || 'Laundry'
      }
    })
  }

  const fetchFavouriteStores = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!userId) {
        throw new Error('User ID not available')
      }

      console.log('Fetching favourite stores for user:', userId)

      // API call matching your curl request
      const response = await ApiService.get({
        url: `/customer/store/offered-laundary/${userId}`,
        params: {
          page: 1,
          limit: 10
        }
      })

      console.log('API Response:', response)

      if (response && response.data && Array.isArray(response.data)) {
        // Transform API data to match your interface
        const transformedStores: OfferedStore[] = response.data.map(
          (store: any) => {
            // Calculate average rating from feedbacks if not provided
            let avgRating = store.average_rating || 0
            if (!avgRating && store.feedbacks && store.feedbacks.length > 0) {
              const totalScore = store.feedbacks.reduce(
                (sum: number, feedback: any) => sum + (feedback.score || 0),
                0
              )
              avgRating = totalScore / store.feedbacks.length
            }

            return {
              id: store.id?.toString() || Math.random().toString(),
              title: store.storeName || 'Laundry Store',
              image: { uri: getShopImage(store.uploadDoc) },
              rating: avgRating || 4.0,
              time: getOperatingHours(store.store_hours),
              description: store.licenceNumber
                ? `Licence: ${store.licenceNumber}`
                : 'Quality laundry services',
              tags: getServiceTags(store.services),
              isNew: store.createdAt
                ? new Date().getTime() - new Date(store.createdAt).getTime() <
                  30 * 24 * 60 * 60 * 1000
                : false, // New if created within 30 days
              isFavorite: store.isFavourite,
              preferred: store.preferred
            }
          }
        )

        console.log('Transformed stores:', transformedStores)
        setOfferedStores(transformedStores)
      } else {
        // No data or empty response
        console.log('No stores found in response')
        setOfferedStores([])
      }
    } catch (err: any) {
      console.error('Error fetching favourite stores:', err)

      // Handle different error types
      if (err.response) {
        // Server responded with error status
        const statusCode = err.response.status
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          'Server error'
        setError(`Error ${statusCode}: ${errorMessage}`)
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection.')
      } else {
        // Other errors
        setError(err.message || 'Failed to load favourite stores')
      }

      setOfferedStores([])
    } finally {
      setLoading(false)
    }
  }

  const handleStorePress = (item: OfferedStore) => {
    console.log('Store pressed:', item.title, 'ID:', item.id)
    // Handle navigation to store details
    // router.push(`/store/${item.id}`)
  }

  const handleFavoritePress = async (item: OfferedStore) => {
    try {
      console.log(
        'Toggling favorite for:',
        item.title,
        'Current status:',
        item.isFavorite
      )

      if (!userId) {
        console.error('User ID not available')
        return
      }

      let response

      if (item.isFavorite) {
        // Remove from favorites - DELETE request
        response = await ApiService.delete({
          url: `/customer/store/favorite/${userId}`,
          params: {
            storeId: item.id
          }
        })
        console.log('Removed from favorites')
      } else {
        // Add to favorites - PATCH request
        response = await ApiService.patch({
          url: `/customer/store/favorite/${userId}`,
          params: {
            storeId: item.id
          },
          data: {} // Empty data body, storeId is in params
        })
        console.log('Added to favorites')
      }

      if (response) {
        // Update local state to toggle favorite status
        setOfferedStores(prev =>
          prev.map(store =>
            store.id === item.id
              ? { ...store, isFavorite: !store.isFavorite }
              : store
          )
        )
        console.log('Favorite status toggled successfully')
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
      // You could show a toast/alert here to inform user of the error
    }
  }

  const handleRefresh = () => {
    if (userId) {
      fetchFavouriteStores()
    } else {
      getUserIdFromToken()
    }
  }

  const renderCard = ({ item }: { item: OfferedStore }) => {
    return (
      <View style={{ marginHorizontal: CARD_MARGIN }}>
        <StoreCard
          item={item}
          cardWidth={CARD_WIDTH}
          onPress={handleStorePress}
          onFavoritePress={handleFavoritePress}
        />
      </View>
    )
  }

  // Empty state
  if (error || OfferedStores.length === 0) {
    return <></>
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Offered <Text style={styles.titleAccent}>Laundry</Text>
        </Text>
        <View style={styles.underline} />
      </View>

      <View
        style={{
          marginHorizontal: 15
        }}
      >
        <Animated.FlatList
          ref={flatListRef}
          data={OfferedStores}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
          snapToAlignment='start'
          decelerationRate='fast'
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={styles.flatListContainer}
          renderItem={renderCard}
        />
      </View>

      {/* Pagination Dots */}
      {OfferedStores.length > 2 && (
        <View style={styles.pagination}>
          {/* Pagination Dots */}
          {OfferedStores.length > 2 && (
            <View style={styles.pagination}>
              {Array.from({ length: Math.ceil(OfferedStores.length / 2) }).map(
                (_, i) => {
                  const inputRange = [
                    (i - 1) * (CARD_WIDTH + CARD_MARGIN * 2) * 2,
                    i * (CARD_WIDTH + CARD_MARGIN * 2) * 2,
                    (i + 1) * (CARD_WIDTH + CARD_MARGIN * 2) * 2
                  ]

                  // Animate opacity
                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp'
                  })

                  // Animate scale for bigger active dot
                  const scale = scrollX.interpolate({
                    inputRange,
                    outputRange: [1, 1.8, 1], // Makes active dot 1.8x bigger
                    extrapolate: 'clamp'
                  })

                  return (
                    <Animated.View
                      key={`pagination-dot-${i}`}
                      style={[
                        styles.paginationDot,
                        {
                          opacity,
                          transform: [{ scale }]
                        }
                      ]}
                    />
                  )
                }
              )}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: 16,
      backgroundColor: '#02537F',
      marginHorizontal: 14,
      overflow: 'hidden',
      borderRadius: 20,
      marginBottom: 30
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200
    },
    header: {
      paddingHorizontal: 16,
      marginBottom: 16
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: 'white',
      letterSpacing: 2
    },
    titleAccent: {
      color: 'white'
    },
    underline: {
      width: 120,
      height: 3,
      backgroundColor: '#008ECC',
      marginTop: 4
    },
    flatListContainer: {
      overflow: 'hidden'
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 0,
      paddingVertical: 8 // Add padding to prevent clipping
    },
    paginationDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 6, // Increased spacing for larger active dots
      backgroundColor: '#D9D9D9'
    },
    activeDot: {
      backgroundColor: 'black'
    },
    inactiveDot: {
      backgroundColor: 'red'
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
      paddingHorizontal: 20
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8
    },
    retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600'
    }
  })
