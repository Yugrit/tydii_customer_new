import ServiceCard from '@/components/ui/MainCard'
import StoreCard from '@/components/ui/storeCard'
import { useThemeColors } from '@/hooks/useThemeColor'
import ApiService from '@/services/ApiService'
import { getData_MMKV } from '@/services/StorageService'
import { jwtDecode } from 'jwt-decode'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

interface LaundryStore {
  id: string
  title: string
  image: any
  rating: number
  time: string
  description: string
  tags: string[]
  isNew: boolean
  isFavorite: boolean
  preferred?: boolean
  services: any[]
  storeName: string
  storeAddresses: any[]
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
  services: any[]
}

export default function FavouriteScreen () {
  const colors = useThemeColors()
  const [laundryStores, setLaundryStores] = useState<LaundryStore[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(true)

  // Calculate card width for 2 columns with proper spacing
  // screenWidth - (container padding * 2) - (gap between cards) / 2
  const cardWidth = (screenWidth - 32 - 5) / 2 // 32 for container padding, 16 for gap

  // Get user ID from token on mount
  useEffect(() => {
    getUserIdFromToken()
  }, [])

  // Fetch data when userId is available
  useEffect(() => {
    if (userId) {
      fetchFavouriteStores(1, false)
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

  const fetchFavouriteStores = async (
    page: number = 1,
    isLoadMore: boolean = false
  ) => {
    try {
      if (!isLoadMore) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      if (!userId) {
        throw new Error('User ID not available')
      }

      console.log('Fetching favourite stores for user:', userId, 'Page:', page)

      // API call matching your curl request
      const response = await ApiService.get({
        url: `/customer/store/favouriteStores/${userId}`,
        params: {
          page: page,
          limit: 10
        }
      })

      console.log('API Response:', response)

      if (response && response.data && Array.isArray(response.data)) {
        // Transform API data to match your interface
        const transformedStores: LaundryStore[] = response.data.map(
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
              storeName: store.storeName || 'Laundry Store',
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
              isFavorite: true, // Since these are favourite stores
              preferred: store.preferred || false,
              services: store.services || [],
              storeAddresses: store.storeAddresses || []
            }
          }
        )

        console.log('Transformed stores:', transformedStores)

        if (isLoadMore) {
          // Append new stores to existing list
          setLaundryStores(prev => [...prev, ...transformedStores])
        } else {
          // Replace existing stores
          setLaundryStores(transformedStores)
        }

        // Check if there's more data to load
        if (transformedStores.length < 10) {
          setHasMoreData(false)
        } else {
          setHasMoreData(true)
        }
      } else {
        // No data or empty response
        console.log('No stores found in response')
        if (!isLoadMore) {
          setLaundryStores([])
        }
        setHasMoreData(false)
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

      if (!isLoadMore) {
        setLaundryStores([])
      }
      setHasMoreData(false)
    } finally {
      if (!isLoadMore) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    }
  }

  // Handle load more data
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMoreData && laundryStores.length > 0) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchFavouriteStores(nextPage, true)
    }
  }, [loadingMore, hasMoreData, currentPage, laundryStores.length])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setCurrentPage(1)
    setHasMoreData(true)
    if (userId) {
      fetchFavouriteStores(1, false)
    } else {
      getUserIdFromToken()
    }
  }, [userId])

  // Handle store press
  const handleStorePress = (item: LaundryStore) => {
    console.log('Store pressed:', item.title, 'ID:', item.id)
    // Navigation logic handled by StoreCard component
  }

  // Handle favorite toggle
  const handleFavoritePress = async (item: LaundryStore) => {
    try {
      console.log('Removing from favorites:', item.title)

      if (!userId) {
        console.error('User ID not available')
        return
      }

      // Use the correct endpoint with query parameter as per your curl
      const response = await ApiService.delete({
        url: `/customer/store/favorite/${userId}`,
        params: {
          storeId: item.id
        }
      })

      if (response) {
        // Remove from local state
        setLaundryStores(prev => prev.filter(store => store.id !== item.id))
        console.log('Store removed from favorites successfully')
      }
    } catch (err) {
      console.error('Error removing from favorites:', err)
      // You could show a toast/alert here to inform user of the error
    }
  }

  // Render cards in rows using map - no for loops
  const renderStoreCards = () => {
    // Group stores into pairs using reduce
    const storePairs = laundryStores.reduce(
      (pairs: LaundryStore[][], store, index) => {
        if (index % 2 === 0) {
          pairs.push([store])
        } else {
          pairs[pairs.length - 1].push(store)
        }
        return pairs
      },
      []
    )

    // Map each pair to a row
    return storePairs.map((pair, rowIndex) => (
      <View key={`row-${rowIndex}`} style={styles.row}>
        <StoreCard
          item={pair[0]}
          cardWidth={cardWidth}
          onPress={handleStorePress}
          onFavoritePress={handleFavoritePress}
        />
        {pair[1] ? (
          <StoreCard
            item={pair[1]}
            cardWidth={cardWidth}
            onPress={handleStorePress}
            onFavoritePress={handleFavoritePress}
          />
        ) : (
          <View style={{ width: cardWidth }} />
        )}
      </View>
    ))
  }

  const styles = createStyles(colors)

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ServiceCard
          title='Favourite Laundry'
          description={'Get all your favourite laundary at one place'}
          button={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
          <Text style={styles.loadingText}>Loading favourite stores...</Text>
        </View>
      </View>
    )
  }

  // Error state
  if (error && laundryStores.length === 0) {
    return (
      <View style={styles.container}>
        <ServiceCard
          title='Favourite Laundry'
          description={'Get all your favourite laundary at one place'}
          button={false}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubText}>Please try again later</Text>
        </View>
      </View>
    )
  }

  // Empty state
  if (laundryStores.length === 0) {
    return (
      <View style={styles.container}>
        <ServiceCard
          title='Favourite Laundry'
          description={'Get all your favourite laundary at one place'}
          button={false}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Favourite Stores Yet</Text>
          <Text style={styles.emptyText}>
            Start adding stores to your favourites to see them here
          </Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.storesContainer}
      showsVerticalScrollIndicator={false}
    >
      <ServiceCard
        title='Favourite Laundry'
        description={'Get all your favourite laundary at one place'}
        button={false}
      />

      {renderStoreCards()}

      {/* Load More Button */}
      {hasMoreData && (
        <View style={styles.loadMoreContainer}>
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <ActivityIndicator size='small' color={colors.primary} />
            ) : (
              <Text style={styles.loadMoreText}>Load More Stores</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 10,
      backgroundColor: colors.surface
    },
    scrollView: {
      marginVertical: 10,
      flex: 1
    },
    storesContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 16 // Consistent gap between cards
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 50
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 50
    },
    errorText: {
      fontSize: 18,
      color: colors.notification,
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: 8
    },
    errorSubText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 50
    },
    emptyTitle: {
      fontSize: 20,
      color: colors.text,
      textAlign: 'center',
      fontWeight: '700',
      marginBottom: 12
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24
    },
    loadMoreContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20
    },
    loadMoreButton: {
      backgroundColor: colors.background,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      minWidth: 150,
      alignItems: 'center'
    },
    loadMoreText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600'
    }
  })
